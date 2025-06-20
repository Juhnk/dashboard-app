#!/bin/bash

# Mustache Cashstache WSL2 Development Environment Setup

set -e

echo "🚀 Setting up WSL2 development environment..."

# Check if running in WSL2
if ! grep -q "WSL2\|microsoft-standard-WSL2" /proc/version; then
    echo "⚠️  This script is optimized for WSL2"
fi

# Update system packages
echo "📦 Updating system packages..."
sudo apt update -qq

# Install essential development tools
echo "🛠️  Installing development tools..."
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    net-tools \
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
alias wslip='hostname -I | awk "{print \$1}"'

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
