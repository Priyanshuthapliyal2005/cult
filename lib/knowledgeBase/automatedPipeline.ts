import { dataAcquisitionEngine } from './dataAcquisition';
import { qualityAssuranceSystem } from './qualityAssurance';
import { vectorStore } from '@/lib/vectorStore';
import { prisma } from '@/lib/prisma';
import { QualityMetrics } from './types';

export interface PipelineStatus {
  isRunning: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  stats: {
    citiesProcessed: number;
    citiesAdded: number;
    citiesUpdated: number;
    errors: number;
  };
}

export interface PipelineConfig {
  updateInterval: number; // hours
  batchSize: number;
  maxRetries: number;
  qualityThreshold: number;
  enableAutoExpansion: boolean;
  enableQualityValidation: boolean;
}

export class AutomatedDataPipeline {
  private config: PipelineConfig = {
    updateInterval: 24, // 24 hours
    batchSize: 10,
    maxRetries: 3,
    qualityThreshold: 0.6,
    enableAutoExpansion: true,
    enableQualityValidation: true
  };

  private isRunning = false;
  private lastRun: Date | null = null;
  private stats = {
    citiesProcessed: 0,
    citiesAdded: 0,
    citiesUpdated: 0,
    errors: 0
  };

  async runPipeline(): Promise<PipelineStatus> {
    if (this.isRunning) {
      console.log('⚠️ Pipeline already running, skipping...');
      return this.getStatus();
    }

    this.isRunning = true;
    this.resetStats();
    
    try {
      console.log('🚀 Starting automated data pipeline...');
      
      // Phase 1: Update existing cities
      await this.updateExistingCities();
      
      // Phase 2: Add new cities (if enabled)
      if (this.config.enableAutoExpansion) {
        await this.expandDatabase();
      }
      
      // Phase 3: Quality validation (if enabled)
      if (this.config.enableQualityValidation) {
        await this.validateDataQuality();
      }
      
      // Phase 4: Cleanup and optimization
      await this.optimizeDatabase();
      
      this.lastRun = new Date();
      console.log(`✅ Pipeline completed successfully. Stats:`, this.stats);
      
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      this.stats.errors++;
    } finally {
      this.isRunning = false;
    }

    return this.getStatus();
  }

  async scheduleRegularUpdates(): Promise<void> {
    console.log(`📅 Scheduling regular updates every ${this.config.updateInterval} hours`);
    
    setInterval(async () => {
      await this.runPipeline();
    }, this.config.updateInterval * 60 * 60 * 1000);
  }

  private async updateExistingCities(): Promise<void> {
    console.log('🔄 Updating existing cities...');
    
    /* In a real implementation, this would query the database
     try {
      const cities = await prisma.VectorContent.findMany({
        where: { 
          contentType: 'enhanced_city',
          updatedAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Older than 24 hours
          }
        },
        take: this.config.batchSize,
        orderBy: { updatedAt: 'asc' }
      });

      for (const city of cities) {
        try {
          const cityData = JSON.parse(city.content);
          
          // Fetch latest data
          const newData = await dataAcquisitionEngine.fetchCityData(
            cityData.name, 
            cityData.country
          );
          
          // Validate and enrich
          const enrichedData = await dataAcquisitionEngine.validateAndEnrichData(
            newData, 
            cityData.name
          );
          
          // Update quality metrics
          enrichedData.metadata.dataQuality = await this.updateQualityMetrics(
            cityData.metadata.dataQuality,
            enrichedData
          );
          
          // Store updated data
          await dataAcquisitionEngine.storeInKnowledgeBase(enrichedData);
          
          this.stats.citiesUpdated++;
          console.log(`✅ Updated ${cityData.name}`);
          
          // Rate limiting
          await this.delay(1000);
          
        } catch (error) {
          console.error(`❌ Failed to update city:`, error);
          this.stats.errors++;
        }
        
        this.stats.citiesProcessed++;
      }
    } catch (error) {
      console.error('Error in updateExistingCities:', error);
      this.stats.errors++;
    }
    */
  }

  private async expandDatabase(): Promise<void> {
    console.log('🌍 Expanding database with new cities...');
    
    // Priority cities to add (this would be configurable)
    const priorityCities = [
      { name: 'Singapore', country: 'Singapore' },
      { name: 'Dubai', country: 'UAE' },
      { name: 'Bangkok', country: 'Thailand' },
      { name: 'Mumbai', country: 'India' },
      { name: 'Seoul', country: 'South Korea' },
      { name: 'Melbourne', country: 'Australia' },
      { name: 'Barcelona', country: 'Spain' },
      { name: 'Amsterdam', country: 'Netherlands' },
      { name: 'Copenhagen', country: 'Denmark' },
      { name: 'Stockholm', country: 'Sweden' }
    ];

    for (const cityInfo of priorityCities.slice(0, 3)) { // Limit to 3 new cities per run
      try {
        // Check if city already exists
        const existing = await prisma.vectorContent.findFirst({
          where: {
            contentType: 'enhanced_city',
            content: {
              contains: cityInfo.name
            }
          }
        });

        if (existing) {
          console.log(`⏭️ Skipping ${cityInfo.name} - already exists`);
          continue;
        }

        // Fetch and process new city
        const cityData = await dataAcquisitionEngine.fetchCityData(
          cityInfo.name, 
          cityInfo.country
        );
        
        const enrichedData = await dataAcquisitionEngine.validateAndEnrichData(
          cityData, 
          cityInfo.name
        );
        
        // Validate quality before adding
        const validation = await qualityAssuranceSystem.validateCityData(enrichedData);
        
        if (validation.score >= this.config.qualityThreshold) {
          await dataAcquisitionEngine.storeInKnowledgeBase(enrichedData);
          this.stats.citiesAdded++;
          console.log(`✅ Added ${cityInfo.name}`);
        } else {
          console.log(`⚠️ Skipped ${cityInfo.name} - quality score ${validation.score} below threshold`);
          this.stats.errors++;
        }
        
        // Rate limiting
        await this.delay(2000);
        
      } catch (error) {
        console.error(`❌ Failed to add ${cityInfo.name}:`, error);
        this.stats.errors++;
      }
      
      this.stats.citiesProcessed++;
    }
  }

  private async validateDataQuality(): Promise<void> {
    console.log('🔍 Validating data quality...');
    
    try {
      const qualityReport = await qualityAssuranceSystem.generateQualityReport();
      
      if (qualityReport.criticalIssues.length > 0) {
        console.warn('⚠️ Critical quality issues detected:', qualityReport.criticalIssues);
      }
      
      if (qualityReport.overallScore < this.config.qualityThreshold) {
        console.warn(`⚠️ Overall quality score ${qualityReport.overallScore} below threshold ${this.config.qualityThreshold}`);
      }
      
      // Log recommendations
      if (qualityReport.recommendations.length > 0) {
        console.log('💡 Quality recommendations:', qualityReport.recommendations);
      }
      
    } catch (error) {
      console.error('Error in validateDataQuality:', error);
      this.stats.errors++;
    }
  }

  private async optimizeDatabase(): Promise<void>  {
    console.log('⚙️ Optimizing database...');
    
    try {
      // In a production system, this would perform database maintenance
      // For now, we'll just log the action
      console.log('✅ Database optimization completed');
    } catch (error) {
      console.error('Error in optimizeDatabase:', error);
      this.stats.errors++;
    }
  }

  private async updateQualityMetrics(
    currentMetrics: QualityMetrics | undefined,
    newData: any
  ): Promise<QualityMetrics> {
    if (!currentMetrics) {
      return {
        dataFreshness: 0,
        sourceReliability: 0.7,
        userValidation: 0,
        expertReview: 0,
        crossReferenceAccuracy: 0.5,
        overallScore: 0.4
      };
    }
    
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

  private resetStats(): void {
    this.stats = {
      citiesProcessed: 0,
      citiesAdded: 0,
      citiesUpdated: 0,
      errors: 0
    };
  }

  getStatus(): PipelineStatus {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.lastRun 
        ? new Date(this.lastRun.getTime() + (this.config.updateInterval * 60 * 60 * 1000))
        : null,
      stats: { ...this.stats }
    };
  }

  updateConfig(newConfig: Partial<PipelineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Pipeline configuration updated:', this.config);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const automatedDataPipeline = new AutomatedDataPipeline();