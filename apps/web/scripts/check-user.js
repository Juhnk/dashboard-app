const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function checkUser() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: 'postgresql://mustache:mustache_dev_password@localhost:5432/mustache_dev' }
    }
  });
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: { organization: true }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      email: user.email,
      name: user.first_name + ' ' + user.last_name,
      role: user.role,
      active: user.is_active,
      org: user.organization?.name
    });
    
    // Test password
    const isValid = await bcrypt.compare('password123', user.password_hash);
    console.log('🔐 Password test:', isValid ? '✅ Valid' : '❌ Invalid');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();