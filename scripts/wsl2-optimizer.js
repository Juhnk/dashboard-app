#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

class WSL2Optimizer {
  constructor() {
    this.isWSL2 = this.checkWSL2();
    this.windowsUserProfile = this.getWindowsUserProfile();
  }

  checkWSL2() {
    try {
      const version = fs.readFileSync('/proc/version', 'utf8');
      return version.includes('WSL2') || version.includes('microsoft-standard-WSL2');
    } catch {
      return false;
    }
  }

  getWindowsUserProfile() {
    try {
      // Try to get Windows user profile path
      const winPath = safeExec('cmd.exe /c "echo %USERPROFILE%" 2>/dev/null');
      if (winPath && winPath.includes(':\\\\')) {
        return winPath.replace(/\\\\/g, '/').replace('C:', '/mnt/c');
      }
      return null;
    } catch {
      return null;
    }
  }

  // Create optimized .wslconfig file
  createWSLConfig() {
    if (!this.windowsUserProfile) {
      log('⚠️  Cannot locate Windows user profile for .wslconfig', 'yellow');
      return false;
    }

    const wslConfigPath = path.join(this.windowsUserProfile, '.wslconfig');
    const config = `# WSL2 Configuration for Mustache Cashstache Development
# Optimized for Node.js and Docker development

[wsl2]
# Limit memory usage (adjust based on your system)
memory=4GB

# Limit CPU usage
processors=4

# Enable localhost forwarding for development
localhostforwarding=true

# Kernel parameters for better networking
kernelCommandLine=vsyscall=emulate

# Swap configuration
swap=2GB

# Enable systemd (if needed)
# systemd=true

# Network configuration
# generateHosts=false
# generateResolvConf=false

[experimental]
# Enable memory reclaim for better performance
autoMemoryReclaim=gradual

# Network mode (if available in your WSL version)
# networkingMode=mirrored
# autoProxy=true
`;

    try {
      fs.writeFileSync(wslConfigPath, config);
      log(`✅ Created optimized .wslconfig at ${wslConfigPath}`, 'green');
      log('   Restart WSL2 to apply changes: wsl --shutdown', 'yellow');
      return true;
    } catch (error) {
      log(`❌ Failed to create .wslconfig: ${error.message}`, 'red');
      return false;
    }
  }

  // Configure Docker for WSL2
  optimizeDockerConfig() {
    const dockerConfigDir = path.join(os.homedir(), '.docker');
    const configPath = path.join(dockerConfigDir, 'daemon.json');

    const dockerConfig = {
      "features": {
        "buildkit": true
      },
      "experimental": false,
      "hosts": ["unix:///var/run/docker.sock"],
      "log-driver": "json-file",
      "log-opts": {
        "max-size": "10m",
        "max-file": "3"
      },
      "storage-driver": "overlay2",
      "dns": ["8.8.8.8", "8.8.4.4"],
      "registry-mirrors": [],
      "insecure-registries": [],
      "default-address-pools": [
        {
          "base": "172.17.0.0/16",
          "size": 24
        }
      ]
    };

    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(dockerConfigDir)) {
        fs.mkdirSync(dockerConfigDir, { recursive: true });
      }

      fs.writeFileSync(configPath, JSON.stringify(dockerConfig, null, 2));
      log(`✅ Optimized Docker configuration at ${configPath}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to optimize Docker config: ${error.message}`, 'red');
      return false;
    }
  }

  // Create development environment script
  createDevScript() {
    const scriptContent = `#!/bin/bash

# Mustache Cashstache WSL2 Development Environment Setup

set -e

echo "🚀 Setting up WSL2 development environment..."

# Check if running in WSL2
if ! grep -q "WSL2\\|microsoft-standard-WSL2" /proc/version; then
    echo "⚠️  This script is optimized for WSL2"
fi

# Update system packages
echo "📦 Updating system packages..."
sudo apt update -qq

# Install essential development tools
echo "🛠️  Installing development tools..."
sudo apt install -y \\
    curl \\
    wget \\
    git \\
    build-essential \\
    ca-certificates \\
    gnupg \\
    lsb-release \\
    net-tools \\
    dnsutils

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed. Please log out and back in to use Docker without sudo."
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Configure Git (if not configured)
if [ -z "$(git config --global user.email)" ]; then
    echo "🔧 Configuring Git..."
    echo "Please enter your Git email:"
    read git_email
    echo "Please enter your Git name:"
    read git_name
    git config --global user.email "$git_email"
    git config --global user.name "$git_name"
fi

# Set up useful aliases
echo "🔧 Setting up development aliases..."
cat >> ~/.bashrc << 'EOF'

# Mustache Cashstache Development Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias dc='docker-compose'
alias dps='docker ps'
alias dlogs='docker logs'
alias npm-fresh='rm -rf node_modules package-lock.json && npm install'
alias ports='ss -tuln'
alias wslip='hostname -I | awk "{print \\$1}"'

# Development environment shortcuts
alias mcd='cd /home/juhnk/repos/dashboard-app'
alias mchealth='npm run health'
alias mcdev='npm run dev'
alias mclogs='npm run docker:logs'

EOF

echo "✅ WSL2 development environment setup complete!"
echo ""
echo "🔧 Next steps:"
echo "   1. Restart your terminal or run: source ~/.bashrc"
echo "   2. Log out and back in to use Docker without sudo"
echo "   3. Run: npm run wsl2:optimize"
echo "   4. Test with: npm run health"
`;

    const scriptPath = './scripts/setup-wsl2-dev.sh';
    
    try {
      fs.writeFileSync(scriptPath, scriptContent);
      safeExec(`chmod +x ${scriptPath}`);
      log(`✅ Created WSL2 development setup script at ${scriptPath}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to create dev script: ${error.message}`, 'red');
      return false;
    }
  }

  // Optimize system settings for development
  optimizeSystem() {
    log('🔧 Optimizing system settings for development...', 'cyan');

    const optimizations = [
      {
        name: 'Increase file watchers limit',
        command: 'echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf',
        verify: 'sysctl fs.inotify.max_user_watches'
      },
      {
        name: 'Optimize network settings',
        command: 'echo "net.core.rmem_max = 16777216" | sudo tee -a /etc/sysctl.conf',
        verify: 'sysctl net.core.rmem_max'
      }
    ];

    optimizations.forEach(opt => {
      try {
        log(`   ${opt.name}...`, 'white');
        safeExec(opt.command);
        
        if (opt.verify) {
          const result = safeExec(opt.verify);
          log(`     ✅ ${result}`, 'green');
        }
      } catch (error) {
        log(`     ❌ Failed: ${error.message}`, 'red');
      }
    });

    // Apply sysctl changes
    try {
      safeExec('sudo sysctl -p');
      log('   ✅ Applied system optimizations', 'green');
    } catch (error) {
      log(`   ⚠️  Could not apply sysctl changes: ${error.message}`, 'yellow');
    }
  }

  // Create port forwarding helper
  createPortForwardingHelper() {
    const helperScript = `#!/bin/bash

# Port Forwarding Helper for WSL2

WSL_IP=$(hostname -I | awk '{print $1}')
WINDOWS_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')

echo "🔄 WSL2 Port Forwarding Helper"
echo "WSL2 IP: $WSL_IP"
echo "Windows IP: $WINDOWS_IP"

# Function to add port forwarding
add_port() {
    local port=$1
    echo "Adding port forwarding for port $port..."
    
    # Add Windows port proxy rule
    powershell.exe -Command "netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$WSL_IP"
    
    # Add Windows Firewall rule
    powershell.exe -Command "New-NetFirewallRule -DisplayName 'WSL2-Port-$port' -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow"
    
    echo "✅ Port $port forwarding configured"
}

# Function to remove port forwarding
remove_port() {
    local port=$1
    echo "Removing port forwarding for port $port..."
    
    powershell.exe -Command "netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0"
    powershell.exe -Command "Remove-NetFirewallRule -DisplayName 'WSL2-Port-$port'"
    
    echo "✅ Port $port forwarding removed"
}

# Function to list current port forwarding rules
list_ports() {
    echo "Current port forwarding rules:"
    powershell.exe -Command "netsh interface portproxy show all"
}

# Main command handler
case "$1" in
    add)
        if [ -z "$2" ]; then
            echo "Usage: $0 add <port>"
            exit 1
        fi
        add_port $2
        ;;
    remove)
        if [ -z "$2" ]; then
            echo "Usage: $0 remove <port>"
            exit 1
        fi
        remove_port $2
        ;;
    list)
        list_ports
        ;;
    setup-dev)
        echo "Setting up development ports..."
        add_port 3000
        add_port 3001
        add_port 3002
        add_port 8080
        ;;
    cleanup-dev)
        echo "Cleaning up development ports..."
        remove_port 3000
        remove_port 3001
        remove_port 3002
        remove_port 8080
        ;;
    *)
        echo "Usage: $0 {add|remove|list|setup-dev|cleanup-dev} [port]"
        echo ""
        echo "Examples:"
        echo "  $0 add 3000        # Add port forwarding for port 3000"
        echo "  $0 remove 3000     # Remove port forwarding for port 3000"
        echo "  $0 list            # List current port forwarding rules"
        echo "  $0 setup-dev       # Set up common development ports"
        echo "  $0 cleanup-dev     # Clean up development ports"
        exit 1
        ;;
esac
`;

    const helperPath = './scripts/wsl2-port-forward.sh';
    
    try {
      fs.writeFileSync(helperPath, helperScript);
      safeExec(`chmod +x ${helperPath}`);
      log(`✅ Created port forwarding helper at ${helperPath}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to create port forwarding helper: ${error.message}`, 'red');
      return false;
    }
  }

  // Run all optimizations
  async runOptimizations() {
    log('🚀 WSL2 Optimization for Mustache Cashstache', 'cyan');
    log('===============================================', 'cyan');

    if (!this.isWSL2) {
      log('⚠️  Not running in WSL2 - some optimizations may not apply', 'yellow');
    }

    const results = [];

    // Create .wslconfig
    results.push({
      name: 'WSL Configuration',
      success: this.createWSLConfig()
    });

    // Optimize Docker
    results.push({
      name: 'Docker Configuration',
      success: this.optimizeDockerConfig()
    });

    // Create development script
    results.push({
      name: 'Development Setup Script',
      success: this.createDevScript()
    });

    // Create port forwarding helper
    results.push({
      name: 'Port Forwarding Helper',
      success: this.createPortForwardingHelper()
    });

    // Optimize system settings
    try {
      this.optimizeSystem();
      results.push({
        name: 'System Optimizations',
        success: true
      });
    } catch (error) {
      results.push({
        name: 'System Optimizations',
        success: false
      });
    }

    // Show results
    log('\\n📊 Optimization Results:', 'magenta');
    results.forEach(result => {
      const symbol = result.success ? '✅' : '❌';
      const color = result.success ? 'green' : 'red';
      log(`   ${symbol} ${result.name}`, color);
    });

    // Show next steps
    log('\\n🔧 Next Steps:', 'cyan');
    log('   1. Restart WSL2: wsl --shutdown (in Windows)', 'white');
    log('   2. Restart Docker Desktop (if using)', 'white');
    log('   3. Run development setup: ./scripts/setup-wsl2-dev.sh', 'white');
    log('   4. Test environment: npm run health', 'white');
    log('   5. Start development: npm run dev', 'white');

    if (this.isWSL2) {
      log('\\n💡 WSL2 Tips:', 'yellow');
      log('   • Access from Windows: use WSL2 IP address', 'white');
      log('   • Set up port forwarding if needed', 'white');
      log('   • Monitor memory usage with htop', 'white');
      log('   • Use Windows Terminal for best experience', 'white');
    }
  }
}

async function main() {
  const optimizer = new WSL2Optimizer();
  await optimizer.runOptimizations();
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Optimization failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = WSL2Optimizer;