#!/bin/bash

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
