#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
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

async function findAvailablePort(startPort = 3000, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      return port;
    }
  }
  throw new Error(`No available ports found starting from ${startPort}`);
}

function checkDockerServices() {
  try {
    const result = execSync('docker ps --format "{{.Names}}\\t{{.Status}}" | grep mustache', { encoding: 'utf8' });
    const services = result.trim().split('\n');
    
    log('\n🐳 Docker Services Status:', 'cyan');
    services.forEach(service => {
      const [name, status] = service.split('\t');
      const isHealthy = status.includes('healthy') || status.includes('Up');
      log(`   ${isHealthy ? '✅' : '❌'} ${name}: ${status}`, isHealthy ? 'green' : 'red');
    });
    
    return services.length === 3; // postgres, redis, adminer
  } catch (error) {
    log('❌ Docker services not running. Starting them...', 'red');
    return false;
  }
}

function startDockerServices() {
  log('\n🚀 Starting Docker services...', 'yellow');
  try {
    execSync('npm run docker:dev', { stdio: 'inherit' });
    log('✅ Docker services started successfully', 'green');
    
    // Wait for services to be ready
    log('⏳ Waiting for services to be ready...', 'yellow');
    execSync('sleep 10', { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    log('❌ Failed to start Docker services', 'red');
    return false;
  }
}

function testDatabaseConnection() {
  try {
    execSync('docker exec mustache-postgres pg_isready -U mustache -d mustache_dev', { stdio: 'pipe' });
    log('✅ Database connection healthy', 'green');
    return true;
  } catch (error) {
    log('❌ Database connection failed', 'red');
    return false;
  }
}

function testRedisConnection() {
  try {
    const result = execSync('docker exec mustache-redis redis-cli ping', { encoding: 'utf8' });
    if (result.trim() === 'PONG') {
      log('✅ Redis connection healthy', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Redis connection failed', 'red');
    return false;
  }
}

async function startNextApp() {
  const availablePort = await findAvailablePort(3000);
  
  log(`\n🚀 Starting Next.js app on port ${availablePort}...`, 'cyan');
  
  // Set the PORT environment variable
  process.env.PORT = availablePort.toString();
  
  const nextProcess = spawn('npm', ['run', 'dev'], {
    cwd: './apps/web',
    stdio: 'inherit',
    env: { ...process.env, PORT: availablePort.toString() }
  });
  
  nextProcess.on('error', (error) => {
    log(`❌ Failed to start Next.js: ${error.message}`, 'red');
  });
  
  log(`📊 Frontend will be available at: http://localhost:${availablePort}`, 'magenta');
  
  return nextProcess;
}

async function main() {
  log('🧪 Mustache Cashstache Development Setup', 'cyan');
  log('==========================================', 'cyan');
  
  // Check if Docker services are running
  const dockerRunning = checkDockerServices();
  
  if (!dockerRunning) {
    const started = startDockerServices();
    if (!started) {
      process.exit(1);
    }
  }
  
  // Test connections
  log('\n🔍 Testing service connections...', 'yellow');
  const dbOk = testDatabaseConnection();
  const redisOk = testRedisConnection();
  
  if (!dbOk || !redisOk) {
    log('❌ Some services are not ready. Please check Docker logs:', 'red');
    log('   npm run docker:logs', 'yellow');
    process.exit(1);
  }
  
  // Show service URLs
  log('\n📊 Available Services:', 'magenta');
  log('   Database Admin: http://localhost:8080', 'white');
  log('   PostgreSQL: localhost:5432', 'white');
  log('   Redis: localhost:6379', 'white');
  
  log('\n🔐 Database Credentials:', 'magenta');
  log('   Username: mustache', 'white');
  log('   Password: mustache_dev_password', 'white');
  log('   Database: mustache_dev', 'white');
  
  // Start Next.js app
  await startNextApp();
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { checkPort, findAvailablePort };