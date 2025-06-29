import { prisma } from '@/lib/prisma';
import { EnhancedCityData, QualityMetrics, UserRating } from './types';
import { qualityAssuranceSystem } from './qualityAssurance';

export interface QualityReport {
  overallScore: number;
  metrics: QualityMetrics;
  recommendations: string[];
  criticalIssues: string[];
  dataFreshness: {
    stale: number;
    current: number;
    recent: number;
  };
  userSatisfaction: {
    averageRating: number;
    totalRatings: number;
    distribution: Record<number, number>;
  };
}

export class QualityAssuranceSystem {
  async generateQualityReport(): Promise<QualityReport> {
    try {
      console.log('📊 Generating comprehensive quality report...');

      const [dataFreshness, userSatisfaction, overallMetrics] = await Promise.all([
        this.analyzeDataFreshness(),
        this.analyzeUserSatisfaction(),
        this.calculateOverallMetrics()
      ]);

      const recommendations = this.generateRecommendations(dataFreshness, userSatisfaction, overallMetrics);
      const criticalIssues = this.identifyCriticalIssues(dataFreshness, userSatisfaction, overallMetrics);

      return {
        overallScore: overallMetrics.overallScore,
        metrics: overallMetrics,
        recommendations,
        criticalIssues,
        dataFreshness,
        userSatisfaction
      };
    } catch (error) {
      console.error('Error generating quality report:', error);
      return this.getDefaultQualityReport();
    }
  }

  async validateCityData(cityData: EnhancedCityData): Promise<{
    isValid: boolean;
    issues: string[];
    score: number;
  }> {
    const issues: string[] = [];
    let score = 1.0;

    // Validate required fields
    if (!cityData.name || cityData.name.trim() === '') {
      issues.push('City name is missing or empty');
      score -= 0.2;
    }

    if (!cityData.country || cityData.country.trim() === '') {
      issues.push('Country is missing or empty');
      score -= 0.2;
    }

    if (!cityData.coordinates || cityData.coordinates.latitude === 0 || cityData.coordinates.longitude === 0) {
      issues.push('Invalid or missing coordinates');
      score -= 0.1;
    }

    // Validate travel laws
    if (!cityData.travelLaws) {
      issues.push('Travel laws information is missing');
      score -= 0.3;
    } else {
      if (!cityData.travelLaws.penalties?.commonViolations?.length) {
        issues.push('Penalty information is incomplete');
        score -= 0.1;
      }
    }

    // Validate cultural norms
    if (!cityData.culturalNorms?.etiquette?.length) {
      issues.push('Cultural etiquette information is missing');
      score -= 0.1;
    }

    // Validate data freshness
    const daysSinceUpdate = (Date.now() - new Date(cityData.metadata.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 30) {
      issues.push(`Data is ${Math.round(daysSinceUpdate)} days old`);
      score -= Math.min(daysSinceUpdate / 100, 0.2);
    }

    // Validate quality score
    if (cityData.metadata.dataQuality.overallScore < 0.5) {
      issues.push('Overall data quality score is below acceptable threshold');
      score -= 0.2;
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };
  }

  async submitUserFeedback(feedback: {
    cityId: string;
    rating: number;
    category: 'accuracy' | 'completeness' | 'usefulness' | 'timeliness';
    comment?: string;
    userId: string;
  }): Promise<void> {
    try {
      await prisma.userRating.create({
        data: {
          cityId: feedback.cityId,
          userId: feedback.userId,
          rating: feedback.rating,
          category: feedback.category,
          comment: feedback.comment,
          timestamp: new Date()
        }
      });

      console.log(`✅ User feedback submitted for city ${feedback.cityId}`);
    } catch (error) {
      console.error('Error submitting user feedback:', error);
    }
  }

  async getFeedbackSummary(cityId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    categoryBreakdown: Record<string, { average: number; count: number }>;
    recentComments: string[];
  }> {
    try {
      const ratings = await prisma.userRating.findMany({
        where: { cityId },
        orderBy: { timestamp: 'desc' }
      });

      if (ratings.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          categoryBreakdown: {},
          recentComments: []
        };
      }

      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      const categoryBreakdown: Record<string, { average: number; count: number }> = {};

      // Group by category
      const byCategory = ratings.reduce((acc, rating) => {
        if (!acc[rating.category]) acc[rating.category] = [];
        acc[rating.category].push(rating);
        return acc;
      }, {} as Record<string, any[]>);

      // Calculate category averages
      Object.entries(byCategory).forEach(([category, categoryRatings]) => {
        categoryBreakdown[category] = {
          average: categoryRatings.reduce((sum, r) => sum + r.rating, 0) / categoryRatings.length,
          count: categoryRatings.length
        };
      });

      const recentComments = ratings
        .filter(r => r.comment && r.comment.trim() !== '')
        .slice(0, 10)
        .map(r => r.comment!);

      return {
        averageRating,
        totalRatings: ratings.length,
        categoryBreakdown,
        recentComments
      };
    } catch (error) {
      console.error('Error getting feedback summary:', error);
      return {
        averageRating: 0,
        totalRatings: 0,
        categoryBreakdown: {},
        recentComments: []
      };
    }
  }

  async scheduleQualityAudit(cityId: string): Promise<void> {
    try {
      // In a production system, this would schedule an audit task
      console.log(`📋 Scheduled quality audit for city ${cityId}`);
      
      // For now, we'll just mark it in the database
      await prisma.qualityAudit.create({
        data: {
          cityId,
          status: 'scheduled',
          scheduledAt: new Date(),
          priority: 'normal'
        }
      });
    } catch (error) {
      console.error('Error scheduling quality audit:', error);
    }
  }

  private async analyzeDataFreshness() {
    try {
      const cities = await prisma.vectorContent.findMany({
        where: { contentType: 'enhanced_city' as string },
        select: { metadata: true, createdAt: true, updatedAt: true }
      });

      const now = Date.now();
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

      let recent = 0, current = 0, stale = 0;

      cities.forEach(city => {
        const lastUpdate = new Date(city.updatedAt).getTime();
        
        if (lastUpdate > oneWeekAgo) {
          recent++;
        } else if (lastUpdate > oneMonthAgo) {
          current++;
        } else {
          stale++;
        }
      });

      return { recent, current, stale };
    } catch (error) {
      console.error('Error analyzing data freshness:', error);
      return { recent: 0, current: 0, stale: 0 };
    }
  }

  private async analyzeUserSatisfaction() {
    try {
      const ratings = await prisma.userRating.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      if (ratings.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          distribution: {}
        };
      }

      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      const distribution = ratings.reduce((acc, rating) => {
        acc[rating.rating] = (acc[rating.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      return {
        averageRating,
        totalRatings: ratings.length,
        distribution
      };
    } catch (error) {
      console.error('Error analyzing user satisfaction:', error);
      return {
        averageRating: 0,
        totalRatings: 0,
        distribution: {}
      };
    }
  }

  private async calculateOverallMetrics(): Promise<QualityMetrics> {
    try {
      const cities = await prisma.vectorContent.findMany({
        where: { contentType: 'enhanced_city' as string },
        select: { metadata: true }
      });

      if (cities.length === 0) {
        return {
          dataFreshness: 0,
          sourceReliability: 0,
          userValidation: 0,
          expertReview: 0,
          crossReferenceAccuracy: 0,
          overallScore: 0
        };
      }

      let totalFreshness = 0;
      let totalReliability = 0;
      let totalUserValidation = 0;
      let totalExpertReview = 0;
      let totalCrossReference = 0;

      cities.forEach(city => {
        const quality = (city.metadata as any)?.dataQuality;
        if (quality) {
          totalFreshness += quality.dataFreshness || 0;
          totalReliability += quality.sourceReliability || 0;
          totalUserValidation += quality.userValidation || 0;
          totalExpertReview += quality.expertReview || 0;
          totalCrossReference += quality.crossReferenceAccuracy || 0;
        }
      });

      const count = cities.length;
      const avgFreshness = totalFreshness / count;
      const avgReliability = totalReliability / count;
      const avgUserValidation = totalUserValidation / count;
      const avgExpertReview = totalExpertReview / count;
      const avgCrossReference = totalCrossReference / count;

      const overallScore = (avgFreshness + avgReliability + avgUserValidation + avgExpertReview + avgCrossReference) / 5;

      return {
        dataFreshness: avgFreshness,
        sourceReliability: avgReliability,
        userValidation: avgUserValidation,
        expertReview: avgExpertReview,
        crossReferenceAccuracy: avgCrossReference,
        overallScore
      };
    } catch (error) {
      console.error('Error calculating overall metrics:', error);
      return {
        dataFreshness: 0,
        sourceReliability: 0,
        userValidation: 0,
        expertReview: 0,
        crossReferenceAccuracy: 0,
        overallScore: 0
      };
    }
  }

  private generateRecommendations(
    dataFreshness: any,
    userSatisfaction: any,
    overallMetrics: QualityMetrics
  ): string[] {
    const recommendations: string[] = [];

    if (dataFreshness.stale > dataFreshness.recent) {
      recommendations.push('Increase frequency of data updates - significant portion of data is stale');
    }

    if (userSatisfaction.averageRating < 4.0) {
      recommendations.push('Focus on improving user satisfaction - ratings below acceptable threshold');
    }

    if (overallMetrics.sourceReliability < 0.7) {
      recommendations.push('Improve source reliability by adding more authoritative data sources');
    }

    if (overallMetrics.expertReview < 0.3) {
      recommendations.push('Implement expert review process to validate critical information');
    }

    if (overallMetrics.userValidation < 0.5) {
      recommendations.push('Encourage more user feedback and validation of information');
    }

    if (recommendations.length === 0) {
      recommendations.push('Quality metrics are within acceptable ranges - continue monitoring');
    }

    return recommendations;
  }

  private identifyCriticalIssues(
    dataFreshness: any,
    userSatisfaction: any,
    overallMetrics: QualityMetrics
  ): string[] {
    const issues: string[] = [];

    if (overallMetrics.overallScore < 0.5) {
      issues.push('CRITICAL: Overall quality score below acceptable threshold');
    }

    if (userSatisfaction.averageRating < 3.0) {
      issues.push('CRITICAL: User satisfaction critically low');
    }

    if (dataFreshness.stale > (dataFreshness.recent + dataFreshness.current) * 2) {
      issues.push('CRITICAL: Majority of data is stale and needs immediate update');
    }

    if (overallMetrics.sourceReliability < 0.5) {
      issues.push('HIGH: Source reliability critically low');
    }

    return issues;
  }

  private getDefaultQualityReport(): QualityReport {
    return {
      overallScore: 0.5,
      metrics: {
        dataFreshness: 0,
        sourceReliability: 0.5,
        userValidation: 0,
        expertReview: 0,
        crossReferenceAccuracy: 0.5,
        overallScore: 0.5
      },
      recommendations: ['System unable to generate recommendations at this time'],
      criticalIssues: ['Quality assessment system temporarily unavailable'],
      dataFreshness: { recent: 0, current: 0, stale: 0 },
      userSatisfaction: { averageRating: 0, totalRatings: 0, distribution: {} }
    };
  }
}

// Singleton instance
export const qualityAssuranceSystem = new QualityAssuranceSystem();