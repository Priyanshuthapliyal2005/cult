export interface ContentStats {
  totalContent: number;
  contentTypes: Record<string, number>;
  recentContent: number;
}

export interface RAGStats {
  totalQueries: number;
  avgConfidence: number;
  topContentTypes: Array<{ type: string; count: number }>;
  recentActivity: number;
}

export interface IngestionStatus {
  contentStats: ContentStats;
  systemHealth: {
    vectorStore: boolean;
    embeddings: boolean;
  };
}

export interface VectorStatsResponse {
  content: ContentStats;
  rag: RAGStats;
  ingestion: IngestionStatus;
  timestamp: string;
}
