import { ChromaClient, Collection, OpenAIEmbeddingFunction } from '@xenova/chromadb';
import { embeddingService } from './embeddings';

export interface ChromaDocument {
  id: string;
  document: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export class ChromaDBService {
  private client: ChromaClient;
  private collections: Record<string, Collection> = {};
  private embeddingFunction: any;
  private isConnected: boolean = false;

  constructor() {
    // Create a client for interacting with the ChromaDB instance
    this.client = new ChromaClient({
      path: process.env.CHROMA_DB_URL || 'http://localhost:8000'
    });

    // Initialize the embedding function for vector creation
    this.embeddingFunction = {
      generate: async (texts: string[]): Promise<number[][]> => {
        // Use our existing embedding service
        const results = await Promise.all(
          texts.map(text => embeddingService.generateEmbedding({ text }))
        );
        return results.map(result => result.embedding);
      }
    };
  }

  async connect(): Promise<boolean> {
    try {
      // Test connection by listing collections
      await this.client.listCollections();
      this.isConnected = true;
      console.log('✅ ChromaDB connected successfully');
      return true;
    } catch (error) {
      console.error('❌ ChromaDB connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  async getOrCreateCollection(name: string): Promise<Collection> {
    if (this.collections[name]) {
      return this.collections[name];
    }

    try {
      // Check if collection exists
      const collections = await this.client.listCollections();
      const exists = collections.some(col => col.name === name);

      let collection;
      if (exists) {
        collection = await this.client.getCollection({
          name,
          embeddingFunction: this.embeddingFunction
        });
      } else {
        collection = await this.client.createCollection({
          name,
          embeddingFunction: this.embeddingFunction,
          metadata: {
            description: `Collection for ${name} data`,
            created: new Date().toISOString()
          }
        });
      }

      this.collections[name] = collection;
      return collection;
    } catch (error) {
      console.error(`Error getting/creating collection ${name}:`, error);
      throw new Error(`Failed to access collection ${name}`);
    }
  }

  async addDocuments(
    collectionName: string, 
    documents: ChromaDocument[]
  ): Promise<string[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const collection = await this.getOrCreateCollection(collectionName);

      // Format data for Chroma
      const ids = documents.map(doc => doc.id);
      const texts = documents.map(doc => doc.document);
      const metadatas = documents.map(doc => doc.metadata);
      
      // Use pre-computed embeddings if available, otherwise let Chroma generate them
      const embeddings = documents
        .filter(doc => doc.embedding)
        .map(doc => doc.embedding as number[]);

      // Add documents to collection
      if (embeddings.length === documents.length) {
        // All documents have embeddings
        await collection.add({
          ids,
          documents: texts,
          metadatas,
          embeddings
        });
      } else if (embeddings.length === 0) {
        // No documents have embeddings
        await collection.add({
          ids,
          documents: texts,
          metadatas
        });
      } else {
        // Mixed case - handle in batches
        const withEmbeddings = documents.filter(doc => doc.embedding);
        const withoutEmbeddings = documents.filter(doc => !doc.embedding);
        
        // Add documents with embeddings
        if (withEmbeddings.length > 0) {
          await collection.add({
            ids: withEmbeddings.map(doc => doc.id),
            documents: withEmbeddings.map(doc => doc.document),
            metadatas: withEmbeddings.map(doc => doc.metadata),
            embeddings: withEmbeddings.map(doc => doc.embedding as number[])
          });
        }
        
        // Add documents without embeddings
        if (withoutEmbeddings.length > 0) {
          await collection.add({
            ids: withoutEmbeddings.map(doc => doc.id),
            documents: withoutEmbeddings.map(doc => doc.document),
            metadatas: withoutEmbeddings.map(doc => doc.metadata)
          });
        }
      }

      console.log(`✅ Added ${documents.length} documents to ${collectionName}`);
      return ids;
    } catch (error) {
      console.error(`Error adding documents to ${collectionName}:`, error);
      throw new Error(`Failed to add documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async queryCollection(
    collectionName: string,
    query: string,
    options: {
      limit?: number;
      filters?: Record<string, any>;
      includeMetadata?: boolean;
      includeDocuments?: boolean;
    } = {}
  ): Promise<any> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const collection = await this.getOrCreateCollection(collectionName);
      
      // Default options
      const { 
        limit = 10, 
        filters = {},
        includeMetadata = true,
        includeDocuments = true
      } = options;

      // Convert filters to Chroma format
      let formattedFilters = {};
      if (Object.keys(filters).length > 0) {
        formattedFilters = this.formatFilters(filters);
      }

      // Query collection
      const results = await collection.query({
        queryTexts: [query],
        nResults: limit,
        where: Object.keys(formattedFilters).length > 0 ? formattedFilters : undefined,
        include: {
          metadatas: includeMetadata,
          documents: includeDocuments,
          distances: true,
        }
      });

      // Format results
      return this.formatQueryResults(results, query);
    } catch (error) {
      console.error(`Error querying collection ${collectionName}:`, error);
      throw new Error(`Failed to query collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteDocument(collectionName: string, id: string): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const collection = await this.getOrCreateCollection(collectionName);
      await collection.delete({ ids: [id] });
      console.log(`✅ Deleted document ${id} from ${collectionName}`);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      return false;
    }
  }

  async updateDocument(
    collectionName: string,
    id: string,
    newData: {
      document?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const collection = await this.getOrCreateCollection(collectionName);
      
      // Update document content if provided
      if (newData.document) {
        await collection.update({
          ids: [id],
          documents: [newData.document]
        });
      }
      
      // Update metadata if provided
      if (newData.metadata) {
        await collection.update({
          ids: [id],
          metadatas: [newData.metadata]
        });
      }
      
      console.log(`✅ Updated document ${id} in ${collectionName}`);
      return true;
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      return false;
    }
  }

  async getCollectionStats(collectionName: string): Promise<{
    documentCount: number;
    metadataKeys: string[];
    collectionInfo: any;
  }> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const collection = await this.getOrCreateCollection(collectionName);
      
      // Get count
      const count = await collection.count();
      
      // Get all documents to analyze metadata keys
      // Note: In a production system, you'd want to sample this for large collections
      const allDocs = await collection.get({ 
        include: { metadatas: true, documents: false }
      });
      
      // Extract unique metadata keys
      const metadataKeys = new Set<string>();
      allDocs.metadatas?.forEach((metadata: Record<string, any>) => {
        Object.keys(metadata).forEach(key => metadataKeys.add(key));
      });
      
      return {
        documentCount: count,
        metadataKeys: Array.from(metadataKeys),
        collectionInfo: await collection.getMetadata()
      };
    } catch (error) {
      console.error(`Error getting stats for collection ${collectionName}:`, error);
      return {
        documentCount: 0,
        metadataKeys: [],
        collectionInfo: {}
      };
    }
  }

  async listCollections(): Promise<string[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const collections = await this.client.listCollections();
      return collections.map(col => col.name);
    } catch (error) {
      console.error('Error listing collections:', error);
      return [];
    }
  }

  async deleteCollection(name: string): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      await this.client.deleteCollection({ name });
      delete this.collections[name];
      return true;
    } catch (error) {
      console.error(`Error deleting collection ${name}:`, error);
      return false;
    }
  }

  private formatFilters(filters: Record<string, any>): any {
    // Convert simple key-value filters to Chroma's where clause format
    const formattedFilters: any = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle array values (IN operator)
        formattedFilters[key] = { $in: value };
      } else if (typeof value === 'object' && value !== null) {
        // Handle operators like greater than, less than, etc.
        formattedFilters[key] = value;
      } else {
        // Simple equality
        formattedFilters[key] = { $eq: value };
      }
    });
    
    return formattedFilters;
  }

  private formatQueryResults(results: any, query: string): any {
    // Format Chroma results into a standardized structure
    const formattedResults = [];
    
    if (results.ids && results.ids[0]) {
      const ids = results.ids[0];
      const documents = results.documents ? results.documents[0] : [];
      const metadatas = results.metadatas ? results.metadatas[0] : [];
      const distances = results.distances ? results.distances[0] : [];
      
      for (let i = 0; i < ids.length; i++) {
        formattedResults.push({
          id: ids[i],
          content: documents[i],
          metadata: metadatas[i] || {},
          similarity: distances[i] ? 1 - distances[i] : 0,
          query: query
        });
      }
    }
    
    return formattedResults;
  }

  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const connected = await this.connect();
      if (connected) {
        return {
          status: 'success',
          message: 'ChromaDB connected successfully'
        };
      } else {
        return {
          status: 'error',
          message: 'ChromaDB connection failed'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance
export const chromaDb = new ChromaDBService();