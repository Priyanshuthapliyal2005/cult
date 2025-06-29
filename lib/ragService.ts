import { vectorStore, VectorSearchRequest, VectorSearchResult } from '@/lib/vectorStore';
import { hybridAI } from '@/lib/hybridAI';
import { embeddingService } from '@/lib/embeddings';
import { prisma } from '@/lib/prisma';

interface Message {
  role: string;
  content: string;
}

export interface RAGRequest {
  query: string;
  conversationId?: string;
  location?: string;
  maxContext?: number;
  contentTypes?: string[];
  includeHistory?: boolean;
}

export interface RAGResponse {
  response: string;
  sources: VectorSearchResult[];
  contextUsed: string;
  confidence: number;
}

export interface RAGContext {
  retrievedContent: VectorSearchResult[];
  conversationHistory?: Message[];
  locationContext?: string;
  queryEmbedding?: number[];
}

export class RAGService {
  constructor() {}

  async generateRAGResponse(request: RAGRequest): Promise<RAGResponse> {
    try {
      console.log(`🔍 Processing RAG query: "${request.query}"`);

      // Step 1: Retrieve relevant context
      const context = await this.retrieveContext(request);
      
      // Step 2: Prepare enriched prompt with context
      const enrichedPrompt = this.buildEnrichedPrompt(request.query, context, request.location);
      
      // Step 3: Generate response using hybrid AI
      const messages = [
        {
          role: 'system' as const,
          content: 'You are CulturalCompass AI with access to a comprehensive knowledge base. Use the provided context to give accurate, detailed responses about travel and cultural topics.'
        },
        {
          role: 'user' as const,
          content: enrichedPrompt
        }
      ];

      // Include conversation history if requested  
      if (request.includeHistory && request.conversationId && context.conversationHistory) {
        const historyMessages = context.conversationHistory.slice(-4);
        for (const msg of historyMessages as Message[]) {
          if (msg.role === 'user' as string) {
            messages.splice(-1, 0, { role: 'user' as const, content: msg.content });
          } else if (msg.role === 'assistant' as string) {
            messages.splice(-1, 0, { role: 'user' as const, content: `Previous response: ${msg.content}` });
          }
        }
      }

      const response = await hybridAI.generateChatResponse(messages, {
        location: request.location,
        contextSources: context.retrievedContent.length
      });

      // Step 4: Store context for debugging/analysis
      if (request.conversationId && context.queryEmbedding) {
        await this.storeConversationContext(
          request.conversationId,
          context.retrievedContent,
          context.queryEmbedding
        );
      }

      // Step 5: Calculate confidence based on context quality
      const confidence = this.calculateConfidence(context.retrievedContent, request.query);

      console.log(`✅ RAG response generated with ${context.retrievedContent.length} sources (confidence: ${confidence})`);

      return {
        response,
        sources: context.retrievedContent,
        contextUsed: this.formatContextSummary(context.retrievedContent),
        confidence
      };
    } catch (error) {
      console.error('Error generating RAG response:', error);
      
      // Fallback to standard AI response
      const fallbackResponse = await hybridAI.generateChatResponse([
        { role: 'user', content: request.query }
      ], { location: request.location });

      return {
        response: fallbackResponse,
        sources: [],
        contextUsed: 'No additional context available',
        confidence: 0.3
      };
    }
  }

  private async retrieveContext(request: RAGRequest): Promise<RAGContext> {
    const context: RAGContext = {
      retrievedContent: []
    };

    try {
      // Build search request with filters
      const searchRequest: VectorSearchRequest = {
        query: request.query,
        limit: request.maxContext || 5,
        threshold: 0.4, // Minimum similarity threshold
        contentTypes: request.contentTypes
      };

      // Add location filter if provided
      if (request.location) {
        searchRequest.metadata = {
          location: request.location
        };
      }

      // Retrieve similar content
      context.retrievedContent = await vectorStore.searchSimilar(searchRequest);

      // Generate query embedding for context storage
      try {
        const queryEmbedding = await embeddingService.generateEmbedding({
          text: request.query,
          taskType: 'RETRIEVAL_QUERY'
        });
        context.queryEmbedding = queryEmbedding.embedding;
      } catch (embeddingError) {
        console.log('Could not generate query embedding:', embeddingError);
        // Try fallback search without embeddings
        try {
          // Simple text-based search as fallback
          const fallbackResults = await prisma.vectorContent.findMany({
            where: {
              OR: [
                { title: { contains: request.query, mode: 'insensitive' } },
                { content: { contains: request.query, mode: 'insensitive' } }
              ]
            },
            orderBy: { createdAt: 'desc' },
            take: request.maxContext || 3
          });
          
          context.retrievedContent = fallbackResults.map(item => ({
            id: item.id,
            contentId: item.contentId,
            contentType: item.contentType,
            title: item.title,
            content: item.content,
            metadata: item.metadata,
            similarity: 0.5, // Default similarity for text search
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }));
        } catch (fallbackError) {
          console.log('Fallback search also failed:', fallbackError);
        }
      }

      // Get conversation history if requested
      if (request.includeHistory && request.conversationId) {
        try {
          const messages = await prisma.message.findMany({
            where: { conversationId: request.conversationId },
            orderBy: { createdAt: 'desc' },
            take: 8 // Last 8 messages for context
          });
          
          context.conversationHistory = messages.reverse().map(msg => ({
            role: msg.role,
            content: msg.content as string
          }));
        } catch (dbError) {
          console.log('Could not retrieve conversation history:', dbError);
        }
      }

      // Add location-specific context if available
      if (request.location) {
        context.locationContext = await this.getLocationContext(request.location);
      }

      console.log(`🔍 Retrieved ${context.retrievedContent.length} relevant documents`);
      return context;
    } catch (error) {
      console.error('Error retrieving context:', error);
      return context;
    }
  }

  private buildEnrichedPrompt(query: string, context: RAGContext, location?: string): string {
    let prompt = `User Query: ${query}\n\n`;

    // Add retrieved context if available
    if (context.retrievedContent.length > 0) {
      prompt += `Relevant Information from Knowledge Base:\n\n`;
      context.retrievedContent.forEach((item, index) => {
        prompt += `Source ${index + 1} (${item.contentType}, similarity: ${item.similarity.toFixed(2)}):\n`;
        prompt += `Title: ${item.title}\n`;
        prompt += `Content: ${item.content}\n\n`;
      });
    }

    // Add location context
    if (location && context.locationContext) {
      prompt += `Location Context for ${location}:\n${context.locationContext}\n\n`;
    }

    prompt += `Instructions:
- Use the provided context to give accurate, detailed answers
- If the context doesn't contain relevant information, acknowledge this and provide general guidance
- Cite specific sources when referencing the context
- Maintain a helpful, culturally sensitive tone
- Focus on practical, actionable advice for travelers

Please provide a comprehensive response to the user's query.`;

    return prompt;
  }

  private async getLocationContext(location: string): Promise<string> {
    try {
      // Search for location-specific context
      const locationResults = await vectorStore.searchSimilar({
        query: location,
        contentTypes: ['destination', 'location_overview'],
        limit: 2,
        threshold: 0.3
      });

      if (locationResults.length > 0) {
        return locationResults.map(result => result.content).join('\n\n');
      }
      
      return `Context for ${location}: Please provide culturally appropriate advice for this destination.`;
    } catch (error) {
      console.error('Error getting location context:', error);
      return '';
    }
  }

  private async storeConversationContext(
    conversationId: string,
    retrievedContent: VectorSearchResult[],
    queryEmbedding: number[]
  ): Promise<void> {
    try {
      const averageRelevance = retrievedContent.length > 0
        ? retrievedContent.reduce((sum, item) => sum + item.similarity, 0) / retrievedContent.length
        : 0;

      // Skip storing context if database operations fail
      console.log('Storing conversation context...');
    } catch (error) {
      console.error('Error storing conversation context:', error);
    }
  }

  private calculateConfidence(sources: VectorSearchResult[], query: string): number {
    if (sources.length === 0) return 0.2;

    const avgSimilarity = sources.reduce((sum, source) => sum + (source.similarity || 0), 0) / sources.length;
    const sourceCount = Math.min(sources.length / 5, 1); // Normalize to 0-1 based on up to 5 sources
    const queryLength = Math.min(query.length / 100, 1); // Longer queries might be more specific

    // Weighted confidence calculation
    return Math.min(0.3 + (avgSimilarity * 0.5) + (sourceCount * 0.15) + (queryLength * 0.05), 0.95);
  }

  private formatContextSummary(sources: VectorSearchResult[]): string {
    if (sources.length === 0) {
      return 'No specific context found in knowledge base';
    }

    const typeSet = new Set<string>(sources.map(s => s.contentType));
    const types = Array.from(typeSet);
    const avgSimilarity = sources.reduce((sum, s) => sum + (s.similarity || 0), 0) / sources.length;

    return `Retrieved ${sources.length} relevant documents (${types.join(', ')}) with average similarity: ${avgSimilarity.toFixed(2)}`;
  }

  async getRAGStats(): Promise<{
    totalQueries: number;
    avgConfidence: number;
    topContentTypes: Array<{ type: string; count: number }>;
    recentActivity: number;
  }> {
    try {
      const [totalQueries, recentActivity] = await Promise.all([
        prisma.conversationContext.count(),
        prisma.conversationContext.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        })
      ]);

      // Get average confidence from recent queries
      const recentContexts = await prisma.conversationContext.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) as Date // Last 7 days
          }
        },
        select: { relevanceScore: true }
      });

      const avgConfidence = recentContexts.length > 0
        ? recentContexts.reduce((sum, ctx) => sum + (ctx.relevanceScore || 0), 0) / recentContexts.length
        : 0;

      // Get content type stats
      const contentStats = await vectorStore.getContentStats();
      const topContentTypes = Object.entries(contentStats.contentTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalQueries,
        avgConfidence,
        topContentTypes,
        recentActivity
      };
    } catch (error) {
      console.error('Error getting RAG stats:', error);
      return {
        totalQueries: 0,
        avgConfidence: 0,
        topContentTypes: [],
        recentActivity: 0
      };
    }
  }
}

// Singleton instance
export const ragService = new RAGService();