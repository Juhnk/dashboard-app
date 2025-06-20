// Test authentication directly
require('dotenv').config({ path: '../../.env.local' });

const { authOptions } = require('../src/lib/auth');

async function testAuth() {
  console.log('🔍 Testing authentication...');
  
  // Check environment variables
  console.log('Environment check:');
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing');
  console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing');
  
  // Test credentials provider directly
  const credentialsProvider = authOptions.providers.find(p => p.id === 'credentials');
  
  if (!credentialsProvider) {
    console.log('❌ Credentials provider not found');
    return;
  }
  
  console.log('✅ Credentials provider found');
  
  try {
    const result = await credentialsProvider.authorize({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (result) {
      console.log('✅ Authentication successful:', result);
    } else {
      console.log('❌ Authentication failed');
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
  }
}

testAuth();