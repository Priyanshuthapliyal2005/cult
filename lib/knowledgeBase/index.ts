import { dataAcquisitionEngine } from './dataAcquisition';
import { intelligentSearchEngine } from './intelligentSearch';
import { qualityAssuranceSystem } from './qualityAssurance';
import { automatedDataPipeline } from './automatedPipeline';
import { 
  SearchRequest, 
  TravelIntelligenceResponse, 
  EnhancedCityData,
  QualityMetrics
} from './types';
import { vectorStore } from '@/lib/vectorStore';

export class TravelKnowledgeBase {
  /**
   * Initialize the knowledge base system
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Travel Knowledge Base system...');
    
    try {
      // Start the automated pipeline for regular updates
      await automatedDataPipeline.scheduleRegularUpdates();
      
      console.log('✅ Travel Knowledge Base initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Travel Knowledge Base:', error);
    }
  }

  /**
   * Search the knowledge base with intelligent context
   */
  async search(request: SearchRequest): Promise<TravelIntelligenceResponse> {
    return await intelligentSearchEngine.search(request);
  }

  /**
   * Add a new city to the knowledge base
   */
  async addCity(cityName: string, country?: string): Promise<EnhancedCityData> {
    console.log(`🌍 Adding new city: ${cityName}${country ? `, ${country}` : ''}`);
    
    try {
      // Fetch comprehensive data
      const cityData = await dataAcquisitionEngine.fetchCityData(cityName, country);
      
      // Validate and enrich data
      const enhancedData = await dataAcquisitionEngine.validateAndEnrichData(cityData, cityName);
      
      // Validate quality
      const validation = await qualityAssuranceSystem.validateCityData(enhancedData);
      
      if (validation.score < 0.6) {
        console.warn(`⚠️ City data quality below threshold: ${validation.score.toFixed(2)}`);
        console.warn('Issues:', validation.issues);
      }
      
      // Store in knowledge base
      await dataAcquisitionEngine.storeInKnowledgeBase(enhancedData);
      
      console.log(`✅ Added ${cityName} to knowledge base`);
      return enhancedData;
      
    } catch (error) {
      console.error(`❌ Failed to add ${cityName}:`, error);
      throw new Error(`Failed to add ${cityName} to knowledge base`);
    }
  }

  /**
   * Update an existing city in the knowledge base
   */
  async updateCity(cityId: string): Promise<EnhancedCityData> {
    console.log(`🔄 Updating city: ${cityId}`);
    
    try {
      // Get existing city data
      const existingData = await this.getCityById(cityId);
      
      if (!existingData) {
        throw new Error(`City with ID ${cityId} not found`);
      }
      
      // Fetch fresh data
      const freshData = await dataAcquisitionEngine.fetchCityData(
        existingData.name, 
        existingData.country
      );
      
      // Validate and enrich
      const enhancedData = await dataAcquisitionEngine.validateAndEnrichData(
        freshData,
        existingData.name
      );
      
      // Preserve ID and metadata
      enhancedData.id = existingData.id;
      enhancedData.metadata.lastUpdated = new Date();
      
      // Update quality metrics
      enhancedData.metadata.dataQuality = this.updateQualityMetrics(
        existingData.metadata.dataQuality,
        enhancedData
      );
      
      // Store updated data
      await dataAcquisitionEngine.storeInKnowledgeBase(enhancedData);
      
      console.log(`✅ Updated ${existingData.name} in knowledge base`);
      return enhancedData;
      
    } catch (error) {
      console.error(`❌ Failed to update city ${cityId}:`, error);
      throw new Error(`Failed to update city ${cityId}`);
    }
  }

  /**
   * Get a city by ID
   */
  async getCityById(cityId: string): Promise<EnhancedCityData | null> {
    try {
      const result = await vectorStore.searchSimilar({
        query: cityId,
        contentTypes: ['enhanced_city'],
        limit: 1,
        threshold: 0.1
      });

      if (result.length === 0) return null;

      try {
        const cityData = JSON.parse(result[0].content);
        return cityData;
      } catch (error) {
        console.error('Error parsing city data:', error);
        return null;
      }
    } catch (error) {
      console.error(`Error getting city ${cityId}:`, error);
      return null;
    }
  }

  /**
   * Get system status and statistics
   */
  async getSystemStatus(): Promise<{
    totalCities: number;
    dataQuality: QualityMetrics;
    pipelineStatus: any;
    lastUpdated: Date;
  }> {
    try {
      const [qualityReport, pipelineStatus] = await Promise.all([
        qualityAssuranceSystem.generateQualityReport(),
        automatedDataPipeline.getStatus()
      ]);
      
      // Mock data since we can't access Prisma directly in WebContainer
      const totalCities = 42; // Sample value
      
      return {
        totalCities,
        dataQuality: qualityReport.metrics,
        pipelineStatus,
        lastUpdated: pipelineStatus.lastRun || new Date()
      };
    } catch (error) {
      console.error('Error getting system status:', error);
      return {
        totalCities: 0,
        dataQuality: {
          dataFreshness: 0,
          sourceReliability: 0,
          userValidation: 0,
          expertReview: 0,
          crossReferenceAccuracy: 0,
          overallScore: 0
        },
        pipelineStatus: { isRunning: false, lastRun: null, nextRun: null, stats: { citiesProcessed: 0, citiesAdded: 0, citiesUpdated: 0, errors: 0 } },
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Run a manual update of the knowledge base
   */
  async runManualUpdate(): Promise<any> {
    return await automatedDataPipeline.runPipeline();
  }

  private updateQualityMetrics(currentMetrics: QualityMetrics, newData: any): QualityMetrics {
    // Update data freshness (0 days old)
    const dataFreshness = 0;
    
    // Source reliability stays the same or improves slightly
    const sourceReliability = Math.min(
      currentMetrics.sourceReliability + 0.05,
      0.95
    );
    
    // Other metrics remain the same
    const userValidation = currentMetrics.userValidation;
    const expertReview = currentMetrics.expertReview;
    const crossReferenceAccuracy = currentMetrics.crossReferenceAccuracy;
    
    // Calculate overall score
    const overallScore = (
      dataFreshness + 
      sourceReliability + 
      userValidation + 
      expertReview + 
      crossReferenceAccuracy
    ) / 5;
    
    return {
      dataFreshness,
      sourceReliability,
      userValidation,
      expertReview,
      crossReferenceAccuracy,
      overallScore
    };
  }
}

// Export types
export * from './types';

// Export singleton instance
export const travelKnowledgeBase = new TravelKnowledgeBase();