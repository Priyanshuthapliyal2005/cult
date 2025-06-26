#!/usr/bin/env node

// Test script to verify database and API connections
import { prisma } from './lib/prisma.js';
import { getCulturalInsights } from './lib/openai.js';

async function testConnections() {
  console.log('🧪 Testing connections...\n');

  // Test 1: Database Connection
  console.log('1. Testing database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test creating a user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    console.log('✅ Database operations working');
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }

  // Test 2: OpenAI API
  console.log('\n2. Testing OpenAI API...');
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OpenAI API key not found');
  } else {
    try {
      const insights = await getCulturalInsights({
        location: 'Pushkar, Rajasthan',
        latitude: 26.4902,
        longitude: 74.5513
      });
      console.log('✅ OpenAI API working');
      console.log('Sample response:', insights.customs.title);
    } catch (error) {
      console.log('❌ OpenAI API failed:', error.message);
    }
  }

  await prisma.$disconnect();
  console.log('\n🎉 Testing complete!');
}

testConnections().catch(console.error);
