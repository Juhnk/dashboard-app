#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '../../.env.local' })

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function createTestUser() {
  const prisma = new PrismaClient()

  try {
    console.log('🔍 Creating test user...')

    // Create organization first
    let organization = await prisma.organization.findFirst({
      where: { name: 'Test Organization' }
    })

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'Test Organization',
          domain: 'test.com',
          subscription_tier: 'free'
        }
      })
      console.log('✅ Created test organization')
    } else {
      console.log('✅ Test organization already exists')
    }

    // Check if test user exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (existingUser) {
      console.log('✅ Test user already exists')
      console.log('\n🔐 Test Login Credentials:')
      console.log('   Email: test@example.com')
      console.log('   Password: password123')
      return
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12)
    
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
    })

    console.log('✅ Test user created successfully!')
    console.log('\n🔐 Test Login Credentials:')
    console.log('   Email: test@example.com')
    console.log('   Password: password123')
    console.log('   Role: admin')
    console.log(`   Organization: ${organization.name}`)

  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  createTestUser()
}

module.exports = { createTestUser }