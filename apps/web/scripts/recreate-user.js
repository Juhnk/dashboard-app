#!/usr/bin/env node

// Load environment variables properly
require('dotenv').config({ path: '../../.env.local' });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function recreateUser() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Recreating test user...');
    
    // Delete existing user
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    });
    console.log('🗑️ Deleted existing user');

    // Create organization first
    let organization = await prisma.organization.findFirst({
      where: { name: 'Test Organization' }
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'Test Organization',
          slug: 'test-org',
          subscription_tier: 'free'
        }
      });
      console.log('✅ Created test organization');
    }

    // Create fresh password hash
    const hashedPassword = await bcrypt.hash('password123', 12);
    console.log('🔐 Generated new password hash');
    
    const testUser = await prisma.user.create({
      data: {
        organization_id: organization.id,
        email: 'test@example.com',
        password_hash: hashedPassword,
        first_name: 'Test',
        last_name: 'User',
        role: 'admin',
        is_active: true
      }
    });

    console.log('✅ Test user recreated successfully!');
    
    // Verify the password immediately
    const isValid = await bcrypt.compare('password123', hashedPassword);
    console.log('🔐 Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('   Role: admin');
    console.log(`   Organization: ${organization.name}`);

  } catch (error) {
    console.error('❌ Error recreating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  recreateUser();
}

module.exports = { recreateUser };