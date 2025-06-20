#!/usr/bin/env node

const { execSync } = require('child_process');
const net = require('net');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

async function checkPortInUse(port) {
  return !(await checkPort(port));
}

async function main() {
  log('🏥 Mustache Cashstache Health Check', 'cyan');
  log('====================================', 'cyan');
  
  let allHealthy = true;
  
  // Check Docker services
  log('\n🐳 Docker Services:', 'blue');
  try {
    const result = execSync('docker ps --format "{{.Names}}\\t{{.Status}}" | grep mustache', { encoding: 'utf8' });
    const services = result.trim().split('\n');
    
    services.forEach(service => {
      const [name, status] = service.split('\t');
      const isHealthy = status.includes('healthy') || status.includes('Up');
      log(`   ${isHealthy ? '✅' : '❌'} ${name}: ${status}`, isHealthy ? 'green' : 'red');
      if (!isHealthy) allHealthy = false;
    });
    
    if (services.length !== 3) {
      log('   ❌ Expected 3 services, found ' + services.length, 'red');
      allHealthy = false;
    }
  } catch (error) {
    log('   ❌ Docker services not running', 'red');
    allHealthy = false;
  }
  
  // Check database connection
  log('\n🗄️  Database:', 'blue');
  try {
    execSync('docker exec mustache-postgres pg_isready -U mustache -d mustache_dev', { stdio: 'pipe' });
    log('   ✅ PostgreSQL connection healthy', 'green');
    
    // Check tables exist
    const tables = execSync('docker exec mustache-postgres psql -U mustache -d mustache_dev -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\';"', { encoding: 'utf8' });
    const tableCount = parseInt(tables.trim());
    if (tableCount >= 10) {
      log(`   ✅ Database schema ready (${tableCount} tables)`, 'green');
    } else {
      log(`   ⚠️  Database schema incomplete (${tableCount} tables)`, 'yellow');
    }
  } catch (error) {
    log('   ❌ Database connection failed', 'red');
    allHealthy = false;
  }
  
  // Check Redis connection
  log('\n🗃️  Cache:', 'blue');
  try {
    const result = execSync('docker exec mustache-redis redis-cli ping', { encoding: 'utf8' });
    if (result.trim() === 'PONG') {
      log('   ✅ Redis connection healthy', 'green');
    } else {
      log('   ❌ Redis not responding correctly', 'red');
      allHealthy = false;
    }
  } catch (error) {
    log('   ❌ Redis connection failed', 'red');
    allHealthy = false;
  }
  
  // Check port availability
  log('\n🔌 Port Status:', 'blue');
  const portsToCheck = [
    { port: 3000, service: 'Next.js (preferred)' },
    { port: 3001, service: 'Next.js (fallback 1)' },
    { port: 3002, service: 'Next.js (fallback 2)' },
    { port: 5432, service: 'PostgreSQL', shouldBeUsed: true },
    { port: 6379, service: 'Redis', shouldBeUsed: true },
    { port: 8080, service: 'Adminer', shouldBeUsed: true }
  ];
  
  for (const { port, service, shouldBeUsed } of portsToCheck) {
    const inUse = await checkPortInUse(port);
    if (shouldBeUsed) {
      log(`   ${inUse ? '✅' : '❌'} Port ${port} (${service}): ${inUse ? 'In Use' : 'Available'}`, inUse ? 'green' : 'red');
      if (!inUse) allHealthy = false;
    } else {
      log(`   ${inUse ? '⚠️' : '✅'} Port ${port} (${service}): ${inUse ? 'In Use' : 'Available'}`, inUse ? 'yellow' : 'green');
    }
  }
  
  // Check TypeScript compilation
  log('\n📝 Code Quality:', 'blue');
  try {
    execSync('cd apps/web && npx tsc --noEmit', { stdio: 'pipe' });
    log('   ✅ TypeScript compilation successful', 'green');
  } catch (error) {
    log('   ❌ TypeScript compilation failed', 'red');
    allHealthy = false;
  }
  
  // Show service URLs
  log('\n📊 Service URLs:', 'magenta');
  log('   🌐 Frontend: http://localhost:3000 (or first available port)', 'white');
  log('   🗄️  Database Admin: http://localhost:8080', 'white');
  log('   🔌 PostgreSQL: localhost:5432', 'white');
  log('   🗃️  Redis: localhost:6379', 'white');
  
  log('\n🔐 Database Credentials:', 'magenta');
  log('   👤 Username: mustache', 'white');
  log('   🔑 Password: mustache_dev_password', 'white');
  log('   🗄️  Database: mustache_dev', 'white');
  
  // Overall status
  log('\n📋 Overall Status:', 'cyan');
  if (allHealthy) {
    log('   ✅ All systems healthy! Ready for development.', 'green');
    process.exit(0);
  } else {
    log('   ❌ Some issues detected. Check logs above.', 'red');
    log('\n🔧 Quick fixes:', 'yellow');
    log('   • Start Docker services: npm run docker:dev', 'white');
    log('   • Restart services: npm run docker:restart', 'white');
    log('   • View Docker logs: npm run docker:logs', 'white');
    log('   • Reset environment: npm run reset', 'white');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Health check failed: ${error.message}`, 'red');
    process.exit(1);
  });
}