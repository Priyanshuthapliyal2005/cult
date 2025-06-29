/**
 * Mock implementation of ChromaDB for WebContainer environment
 * This allows the app to run without the need for native binaries
 */

export interface MockDocument {
  id: string;
  document: string;
  metadata: Record<string, any>;
}

export interface MockCollection {
  name: string;
  metadata: Record<string, any>;
  documents: MockDocument[];
}

export class MockChromaDB {
  private collections: Map<string, MockCollection> = new Map();
  private isConnected: boolean = false;

  async connect(): Promise<boolean> {
    this.isConnected = true;
    console.log('✅ Mock ChromaDB connected successfully');
    return true;
  }

  async getOrCreateCollection(name: string): Promise<any> {
    if (!this.collections.has(name)) {
      this.collections.set(name, {
        name,
        metadata: {
          description: `Collection for ${name} data`,
          created: new Date().toISOString()
        },
        documents: []
      });
    }
    return this.collections.get(name);
  }

  async addDocuments(
    collectionName: string, 
    documents: MockDocument[]
  ): Promise<string[]> {
    const collection = await this.getOrCreateCollection(collectionName);
    
    const ids = documents.map(doc => doc.id);
    
    // Add documents to collection
    documents.forEach(doc => {
      // Check if document with this ID already exists
      const existingIndex = collection.documents.findIndex(d => d.id === doc.id);
      if (existingIndex >= 0) {
        // Update existing document
        collection.documents[existingIndex] = doc;
      } else {
        // Add new document
        collection.documents.push(doc);
      }
    });
    
    return ids;
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
  ): Promise<any[]> {
    const collection = await this.getOrCreateCollection(collectionName);
    
    // Get all documents from collection
    let results = [...collection.documents];
    
    // Apply filters if provided
    if (options.filters && Object.keys(options.filters).length > 0) {
      results = results.filter(doc => {
        return Object.entries(options.filters || {}).every(([key, value]) => {
          // Simple equality check - in real ChromaDB this would be more sophisticated
          return doc.metadata[key] === value;
        });
      });
    }
    
    // Simple text search - in real ChromaDB this would use vector similarity
    results = results.filter(doc => 
      doc.document.toLowerCase().includes(query.toLowerCase()) || 
      doc.metadata.title?.toLowerCase().includes(query.toLowerCase()) ||
      doc.metadata.name?.toLowerCase().includes(query.toLowerCase())
    );
    
    // Assign mock similarity scores - in real ChromaDB this would be actual cosine similarity
    results.forEach(doc => {
      // Count the occurrences of query terms in the document
      const queryTerms = query.toLowerCase().split(/\s+/);
      const docText = doc.document.toLowerCase();
      
      let matches = 0;
      queryTerms.forEach(term => {
        if (docText.includes(term)) matches++;
      });
      
      // Calculate a simple similarity score
      doc.similarity = Math.min(matches / queryTerms.length * 0.8 + 0.2, 1);
    });
    
    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);
    
    // Apply limit
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    // Format results
    return results.map(doc => ({
      id: doc.id,
      content: doc.document,
      metadata: options.includeMetadata ? doc.metadata : undefined,
      similarity: doc.similarity || 0.5
    }));
  }

  async deleteDocument(collectionName: string, id: string): Promise<boolean> {
    const collection = await this.getOrCreateCollection(collectionName);
    
    const initialLength = collection.documents.length;
    collection.documents = collection.documents.filter(doc => doc.id !== id);
    
    return collection.documents.length < initialLength;
  }

  async updateDocument(
    collectionName: string,
    id: string,
    updates: {
      document?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<boolean> {
    const collection = await this.getOrCreateCollection(collectionName);
    
    const docIndex = collection.documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return false;
    
    if (updates.document) {
      collection.documents[docIndex].document = updates.document;
    }
    
    if (updates.metadata) {
      collection.documents[docIndex].metadata = {
        ...collection.documents[docIndex].metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString()
      };
    }
    
    return true;
  }

  async getCollectionStats(collectionName: string): Promise<{
    documentCount: number;
    metadataKeys: string[];
    collectionInfo: any;
  }> {
    const collection = await this.getOrCreateCollection(collectionName);
    
    // Get unique metadata keys
    const metadataKeys = new Set<string>();
    collection.documents.forEach(doc => {
      Object.keys(doc.metadata).forEach(key => metadataKeys.add(key));
    });
    
    return {
      documentCount: collection.documents.length,
      metadataKeys: Array.from(metadataKeys),
      collectionInfo: collection.metadata
    };
  }

  async listCollections(): Promise<string[]> {
    return Array.from(this.collections.keys());
  }

  async deleteCollection(name: string): Promise<boolean> {
    return this.collections.delete(name);
  }

  async testConnection(): Promise<{ status: string; message: string }> {
    return {
      status: 'success',
      message: 'Mock ChromaDB connected successfully'
    };
  }
}

// Singleton instance
export const mockChromeDb = new MockChromaDB();