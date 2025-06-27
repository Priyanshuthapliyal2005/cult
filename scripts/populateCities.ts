#!/usr/bin/env tsx

import { DynamicCityService } from '../lib/dynamicCityService';
import { storeInVectorDB } from '../lib/vectorStore';

async function populateTestCities() {
  const cityService = new DynamicCityService();
  
  // Test cities to populate
  const testCities = [
    'Singapore',
    'Dubai', 
    'Bangkok',
    'Mumbai',
    'Seoul',
    'Melbourne',
    'Barcelona',
    'Amsterdam',
    'Copenhagen',
    'Stockholm'
  ];

  console.log('Starting city population...');
  
  for (const cityName of testCities) {
    try {
      console.log(`\n🌍 Processing ${cityName}...`);
      
      // Generate comprehensive city data
      const cityData = await cityService.generateCityData(cityName);
      
      if (cityData) {
        console.log(`✅ Generated data for ${cityData.name}`);
        console.log(`   Laws: ${cityData.localLaws?.length || 0} items`);
        console.log(`   Taboos: ${cityData.culturalTaboos?.length || 0} items`);
        console.log(`   Phrases: ${cityData.commonPhrases?.length || 0} items`);
        
        // Store in vector database
        const content = `${cityData.name}: ${cityData.description}\n\nLocal Laws:\n${cityData.localLaws?.join('\n') || 'N/A'}\n\nCultural Guidelines:\n${cityData.culturalTaboos?.join('\n') || 'N/A'}\n\nCommon Phrases:\n${cityData.commonPhrases?.map(p => `${p.phrase} - ${p.meaning}`).join('\n') || 'N/A'}`;
        
        await storeInVectorDB({
          contentId: cityData.id,
          contentType: 'destination',
          title: cityData.name,
          content,
          metadata: {
            country: cityData.country,
            continent: cityData.continent,
            latitude: cityData.latitude,
            longitude: cityData.longitude,
            timezone: cityData.timezone,
            currency: cityData.currency,
            languages: cityData.languages,
            category: 'city-guide'
          }
        });
        
        console.log(`💾 Stored ${cityName} in vector database`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } else {
        console.log(`❌ Failed to generate data for ${cityName}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${cityName}:`, error);
    }
  }
  
  console.log('\n🎉 City population completed!');
}

// Run the script
populateTestCities().catch(console.error);
