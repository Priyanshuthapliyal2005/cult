#!/usr/bin/env tsx

import { travelKnowledgeBase } from '../lib/knowledgeBase';

async function populateKnowledgeBase() {
  console.log('🚀 Starting knowledge base population...');
  
  // Priority cities to add
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

  // Initialize the knowledge base
  await travelKnowledgeBase.initialize();
  
  // Process each city
  for (const city of priorityCities.slice(0, 3)) { // Limit to 3 for testing
    try {
      console.log(`\n🌍 Processing ${city.name}, ${city.country}...`);
      
      const cityData = await travelKnowledgeBase.addCity(city.name, city.country);
      
      console.log(`✅ Added ${city.name} to knowledge base`);
      console.log(`   ID: ${cityData.id}`);
      console.log(`   Quality Score: ${cityData.metadata.dataQuality.overallScore.toFixed(2)}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to process ${city.name}:`, error);
    }
  }
  
  console.log('\n🎉 Knowledge base population completed!');
  
  // Get system status
  const status = await travelKnowledgeBase.getSystemStatus();
  console.log('\n📊 System Status:');
  console.log(`   Total Cities: ${status.totalCities}`);
  console.log(`   Data Quality: ${status.dataQuality.overallScore.toFixed(2)}`);
  console.log(`   Last Updated: ${status.lastUpdated}`);
  
  process.exit(0);
}

// Run the script
populateKnowledgeBase().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});