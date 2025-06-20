#!/usr/bin/env node

const { execSync, exec } = require('child_process');
const fs = require('fs');
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
  white: '\x1b[37m',
  bright: '\x1b[1m'
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

function getWSLVersion() {
  try {
    const version = fs.readFileSync('/proc/version', 'utf8');
    if (version.includes('WSL2')) return '2';
    if (version.includes('Microsoft')) return '1';
    return 'Native Linux';
  } catch {
    return 'Unknown';
  }
}

function checkPortsInUse(ports) {
  const results = {};
  ports.forEach(port => {
    try {
      const result = safeExec(`ss -tuln | grep :${port}`);
      results[port] = {
        inUse: !!result,
        details: result || 'Available',
        process: safeExec(`lsof -i :${port} 2>/dev/null | head -n 2`)
      };
    } catch {
      results[port] = { inUse: false, details: 'Available', process: null };
    }
  });
  return results;
}

function getNetworkInfo() {
  return {
    interfaces: safeExec('ip addr show'),
    routes: safeExec('ip route show'),
    dns: safeExec('cat /etc/resolv.conf'),
    hosts: safeExec('cat /etc/hosts')
  };
}

function getDockerNetworkInfo() {
  return {
    networks: safeExec('docker network ls 2>/dev/null'),
    containers: safeExec('docker ps --format "table {{.Names}}\\t{{.Ports}}" 2>/dev/null'),
    dockerVersion: safeExec('docker --version 2>/dev/null'),
    dockerCompose: safeExec('docker-compose --version 2>/dev/null')
  };
}

function checkWindowsProcesses() {
  // Check if we can access Windows processes from WSL2
  const windowsCommands = [
    'tasklist.exe /FI "IMAGENAME eq node.exe" 2>/dev/null',
    'netstat.exe -ano | findstr :3000 2>/dev/null',
    'netstat.exe -ano | findstr :3001 2>/dev/null',
    'netstat.exe -ano | findstr :3002 2>/dev/null'
  ];
  
  const results = {};
  windowsCommands.forEach((cmd, index) => {
    const result = safeExec(cmd);
    results[`command_${index}`] = result || 'Not accessible or no results';
  });
  
  return results;
}

function detectPortConflicts() {
  const suspiciousPorts = [3000, 3001, 3002, 3003, 8080, 5432, 6379];
  const conflicts = [];
  
  suspiciousPorts.forEach(port => {
    const process = safeExec(`lsof -i :${port} 2>/dev/null`);
    if (process) {
      conflicts.push({
        port,
        process: process.split('\n')[1] // Get the actual process line
      });
    }
  });
  
  return conflicts;
}

function checkWSL2PortForwarding() {
  // Check WSL2 specific networking
  const wslHost = safeExec('cat /etc/resolv.conf | grep nameserver | awk \'{print $2}\'');
  return {
    wslHostIP: wslHost,
    wslIP: safeExec('hostname -I | awk \'{print $1}\''),
    defaultGateway: safeExec('ip route | grep default | awk \'{print $3}\''),
    portProxy: safeExec('netsh.exe interface portproxy show all 2>/dev/null')
  };
}

async function main() {
  log('🔍 WSL2 Network Diagnostics for Mustache Cashstache', 'cyan');
  log('======================================================', 'cyan');
  
  // Environment Detection
  log('\\n🖥️  Environment Information:', 'blue');
  const wslVersion = getWSLVersion();
  log(`   WSL Version: ${wslVersion}`, wslVersion === '2' ? 'green' : 'yellow');
  
  if (wslVersion !== '2') {
    log('   ⚠️  This diagnostic is optimized for WSL2', 'yellow');
  }
  
  const osInfo = safeExec('uname -a');
  log(`   OS: ${osInfo}`, 'white');
  
  // Network Configuration
  log('\\n🌐 Network Configuration:', 'blue');
  const networkInfo = getNetworkInfo();
  
  // WSL2 IP addresses
  const wslInfo = checkWSL2PortForwarding();
  log(`   WSL2 IP: ${wslInfo.wslIP}`, 'green');
  log(`   Windows Host IP: ${wslInfo.wslHostIP}`, 'green');
  log(`   Default Gateway: ${wslInfo.defaultGateway}`, 'white');
  
  // Port Analysis
  log('\\n🔌 Port Analysis:', 'blue');
  const targetPorts = [3000, 3001, 3002, 3003, 5432, 6379, 8080];
  const portStatus = checkPortsInUse(targetPorts);
  
  targetPorts.forEach(port => {
    const status = portStatus[port];
    const symbol = status.inUse ? '🔴' : '🟢';
    const color = status.inUse ? 'red' : 'green';
    log(`   ${symbol} Port ${port}: ${status.inUse ? 'IN USE' : 'AVAILABLE'}`, color);
    
    if (status.inUse && status.process) {
      log(`      Process: ${status.process.split('\\n')[1] || 'Unknown'}`, 'yellow');
    }
  });
  
  // Port Conflicts Detection
  log('\\n⚠️  Port Conflicts:', 'yellow');
  const conflicts = detectPortConflicts();
  if (conflicts.length === 0) {
    log('   ✅ No suspicious port conflicts detected', 'green');
  } else {
    conflicts.forEach(conflict => {
      log(`   🔴 Port ${conflict.port}: ${conflict.process}`, 'red');
    });
  }
  
  // Docker Network Analysis
  log('\\n🐳 Docker Network Analysis:', 'blue');
  const dockerInfo = getDockerNetworkInfo();
  
  if (dockerInfo.dockerVersion) {
    log(`   Docker Version: ${dockerInfo.dockerVersion}`, 'green');
    
    if (dockerInfo.containers) {
      log('   Running Containers:', 'white');
      dockerInfo.containers.split('\\n').forEach((line, index) => {
        if (index === 0) {
          log(`      ${line}`, 'cyan'); // Header
        } else if (line.trim()) {
          log(`      ${line}`, 'white');
        }
      });
    }
    
    if (dockerInfo.networks) {
      log('   Docker Networks:', 'white');
      dockerInfo.networks.split('\\n').slice(1).forEach(line => {
        if (line.trim()) {
          log(`      ${line}`, 'white');
        }
      });
    }
  } else {
    log('   ❌ Docker not accessible', 'red');
  }
  
  // Windows Process Detection
  log('\\n🪟 Windows Process Detection:', 'blue');
  const windowsProcesses = checkWindowsProcesses();
  const hasWindowsAccess = Object.values(windowsProcesses).some(result => 
    result && result !== 'Not accessible or no results' && !result.includes('not found')
  );
  
  if (hasWindowsAccess) {
    log('   ✅ Can access Windows processes from WSL2', 'green');
    Object.entries(windowsProcesses).forEach(([key, value]) => {
      if (value && value !== 'Not accessible or no results') {
        log(`   ${value}`, 'white');
      }
    });
  } else {
    log('   ⚠️  Limited access to Windows processes', 'yellow');
    log('   This may indicate WSL2 networking isolation', 'yellow');
  }
  
  // WSL2 Port Forwarding
  log('\\n🔄 WSL2 Port Forwarding:', 'blue');
  if (wslInfo.portProxy) {
    log('   Windows Port Proxy Rules:', 'white');
    log(`   ${wslInfo.portProxy}`, 'white');
  } else {
    log('   ⚠️  No Windows port proxy rules detected', 'yellow');
    log('   This might explain port forwarding issues', 'yellow');
  }
  
  // Recommendations
  log('\\n💡 Recommendations:', 'magenta');
  
  if (conflicts.length > 0) {
    log('   🔧 Port Conflict Resolution:', 'yellow');
    log('      • Use our smart port detection system', 'white');
    log('      • Configure explicit port ranges for development', 'white');
    log('      • Set up port forwarding rules if needed', 'white');
  }
  
  if (wslVersion === '2') {
    log('   🔧 WSL2 Optimization:', 'yellow');
    log('      • Configure .wslconfig for better networking', 'white');
    log('      • Use WSL2 IP for service access', 'white');
    log('      • Set up proper port forwarding if accessing from Windows', 'white');
  }
  
  log('   🔧 Docker Optimization:', 'yellow');
  log('      • Use host networking for development when possible', 'white');
  log('      • Configure explicit port bindings', 'white');
  log('      • Monitor Docker network bridge conflicts', 'white');
  
  // Network Interface Details
  log('\\n📡 Network Interface Details:', 'blue');
  if (networkInfo.interfaces) {
    const interfaces = networkInfo.interfaces.split('\\n').filter(line => 
      line.includes('inet ') && !line.includes('127.0.0.1')
    );
    interfaces.forEach(iface => {
      log(`   ${iface.trim()}`, 'white');
    });
  }
  
  log('\\n✅ Diagnostics Complete!', 'green');
  log('\\n🔧 Next Steps:', 'cyan');
  log('   1. Run: npm run wsl2:optimize', 'white');
  log('   2. Configure: .wslconfig file', 'white');
  log('   3. Set up: Explicit port management', 'white');
  log('   4. Test: Cross-platform connectivity', 'white');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Diagnostic failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  isWSL2,
  getWSLVersion,
  checkPortsInUse,
  detectPortConflicts,
  checkWSL2PortForwarding
};