#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const net = require('net');
const fs = require('fs');

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

function safeExec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', ...options }).trim();
  } catch (error) {
    return null;
  }
}

function isWSL2() {
  try {
    const version = fs.readFileSync('/proc/version', 'utf8');
    return version.includes('WSL2') || version.includes('microsoft-standard-WSL2');
  } catch {
    return false;
  }
}

class WSL2PortManager {
  constructor() {
    this.isWSL2 = isWSL2();
    this.reservedPorts = new Set([22, 80, 443, 5432, 6379, 8080]); // System and our services
    this.developmentPortRange = { min: 3000, max: 3100 };
    this.portCache = new Map();
  }

  // Enhanced port checking for WSL2
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      
      server.on('error', () => {
        // Double-check with system commands in WSL2
        if (this.isWSL2) {
          const linuxCheck = !safeExec(`ss -tuln | grep :${port}`);
          const windowsCheck = this.checkWindowsPort(port);
          resolve(linuxCheck && windowsCheck);
        } else {
          resolve(false);
        }
      });
    });
  }

  checkWindowsPort(port) {
    try {
      // Try to check Windows netstat if accessible
      const result = safeExec(`netstat.exe -ano | findstr :${port} 2>/dev/null`);
      return !result; // Available if no result
    } catch {
      return true; // Assume available if can't check Windows
    }
  }

  // Find the next available port with WSL2 awareness
  async findAvailablePort(startPort = 3000, maxAttempts = 100) {
    log(`🔍 Searching for available port starting from ${startPort}...`, 'cyan');
    
    for (let i = 0; i < maxAttempts; i++) {
      const port = startPort + i;
      
      // Skip reserved ports
      if (this.reservedPorts.has(port)) {
        continue;
      }
      
      // Check if port is available
      const isAvailable = await this.isPortAvailable(port);
      
      if (isAvailable) {
        log(`✅ Found available port: ${port}`, 'green');
        this.portCache.set('lastUsed', port);
        return port;
      } else {
        const process = this.getPortProcess(port);
        log(`   Port ${port}: ${process || 'In use'}`, 'yellow');
      }
    }
    
    throw new Error(`No available ports found in range ${startPort}-${startPort + maxAttempts}`);
  }

  getPortProcess(port) {
    try {
      const result = safeExec(`lsof -i :${port} 2>/dev/null | tail -n +2`);
      if (result) {
        const parts = result.split(/\\s+/);
        return `${parts[0]} (PID: ${parts[1]})`;
      }
      
      // Try Windows process check if in WSL2
      if (this.isWSL2) {
        const winResult = safeExec(`netstat.exe -ano | findstr :${port} 2>/dev/null`);
        if (winResult) {
          return 'Windows process';
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  // Get WSL2 network information
  getWSL2NetworkInfo() {
    if (!this.isWSL2) return null;

    return {
      wslIP: safeExec('hostname -I | awk \'{print $1}\''),
      windowsHostIP: safeExec('cat /etc/resolv.conf | grep nameserver | awk \'{print $2}\''),
      defaultGateway: safeExec('ip route | grep default | awk \'{print $3}\'')
    };
  }

  // Set up Windows port forwarding for WSL2
  setupWindowsPortForwarding(port) {
    if (!this.isWSL2) return false;

    try {
      const wslIP = safeExec('hostname -I | awk \'{print $1}\'');
      if (!wslIP) return false;

      log(`🔄 Setting up Windows port forwarding for port ${port}...`, 'cyan');
      
      // Add port proxy rule (requires admin privileges on Windows)
      const command = `netsh.exe interface portproxy add v4tov4 listenport=${port} listenaddress=0.0.0.0 connectport=${port} connectaddress=${wslIP}`;
      const result = safeExec(command);
      
      if (result !== null) {
        log(`✅ Port forwarding configured for ${port}`, 'green');
        return true;
      } else {
        log(`⚠️  Could not set up port forwarding (may need admin rights)`, 'yellow');
        return false;
      }
    } catch (error) {
      log(`❌ Port forwarding setup failed: ${error.message}`, 'red');
      return false;
    }
  }

  // Clean up port forwarding rules
  cleanupPortForwarding(port) {
    if (!this.isWSL2) return;

    try {
      log(`🧹 Cleaning up port forwarding for ${port}...`, 'cyan');
      const command = `netsh.exe interface portproxy delete v4tov4 listenport=${port} listenaddress=0.0.0.0`;
      safeExec(command);
      log(`✅ Port forwarding cleaned up for ${port}`, 'green');
    } catch (error) {
      log(`⚠️  Could not clean up port forwarding: ${error.message}`, 'yellow');
    }
  }

  // Generate recommended ports for different services
  generatePortConfiguration() {
    const config = {
      frontend: null,
      api: null,
      storybook: null,
      testing: null
    };

    return config;
  }

  // Create a development server with smart port management
  async startDevelopmentServer(command, cwd = '.', preferredPort = 3000) {
    const port = await this.findAvailablePort(preferredPort);
    
    log(`🚀 Starting development server on port ${port}...`, 'cyan');
    
    // Set environment variables
    const env = {
      ...process.env,
      PORT: port.toString(),
      NEXT_PORT: port.toString()
    };

    // Setup Windows port forwarding if needed
    if (this.isWSL2) {
      this.setupWindowsPortForwarding(port);
    }

    // Start the process
    const proc = spawn('npm', ['run', command], {
      cwd,
      stdio: 'inherit',
      env
    });

    // Handle cleanup on exit
    process.on('SIGINT', () => {
      log('\\n🛑 Shutting down development server...', 'yellow');
      this.cleanupPortForwarding(port);
      proc.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      this.cleanupPortForwarding(port);
      proc.kill('SIGTERM');
    });

    // Show connection information
    const networkInfo = this.getWSL2NetworkInfo();
    
    log('\\n📊 Development Server Information:', 'magenta');
    log(`   🌐 Local: http://localhost:${port}`, 'green');
    
    if (networkInfo) {
      log(`   🔗 WSL2: http://${networkInfo.wslIP}:${port}`, 'green');
      log(`   🪟 Windows: http://${networkInfo.windowsHostIP}:${port} (if forwarded)`, 'cyan');
    }

    return { port, process: proc, networkInfo };
  }

  // Show current port usage
  async showPortUsage() {
    log('🔌 Current Port Usage:', 'cyan');
    
    const portsToCheck = [3000, 3001, 3002, 3003, 5432, 6379, 8080, 8081];
    
    for (const port of portsToCheck) {
      const isAvailable = await this.isPortAvailable(port);
      const process = this.getPortProcess(port);
      
      const symbol = isAvailable ? '🟢' : '🔴';
      const status = isAvailable ? 'Available' : 'In Use';
      const processInfo = process ? ` (${process})` : '';
      
      log(`   ${symbol} Port ${port}: ${status}${processInfo}`, isAvailable ? 'green' : 'red');
    }
  }
}

async function main() {
  const manager = new WSL2PortManager();
  
  log('🔧 WSL2 Port Manager for Mustache Cashstache', 'cyan');
  log('===============================================', 'cyan');
  
  if (manager.isWSL2) {
    log('✅ WSL2 environment detected', 'green');
    
    const networkInfo = manager.getWSL2NetworkInfo();
    if (networkInfo) {
      log('\\n🌐 Network Configuration:', 'blue');
      log(`   WSL2 IP: ${networkInfo.wslIP}`, 'white');
      log(`   Windows Host: ${networkInfo.windowsHostIP}`, 'white');
      log(`   Gateway: ${networkInfo.defaultGateway}`, 'white');
    }
  } else {
    log('ℹ️  Not running in WSL2', 'yellow');
  }
  
  await manager.showPortUsage();
  
  // If called with command line arguments, start the server
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const command = args[0];
    const preferredPort = parseInt(args[1]) || 3000;
    
    await manager.startDevelopmentServer(command, './apps/web', preferredPort);
  } else {
    log('\\n💡 Usage Examples:', 'magenta');
    log('   node scripts/wsl2-port-manager.js dev 3000', 'white');
    log('   node scripts/wsl2-port-manager.js start 3001', 'white');
  }
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Port manager failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = WSL2PortManager;