#!/bin/bash

# 🤖 APEX MCP Servers Setup Script
# Version: 1.0.0
# Purpose: Install all MCP servers required for APEX automation

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 APEX MCP Servers Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ ERROR: Node.js 18+ required. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js version OK: $(node -v)"
echo ""

# Install Shopify Dev MCP
echo "📦 Installing Shopify Dev MCP..."
npm install -g @shopify/dev-mcp@latest
if [ $? -eq 0 ]; then
    echo "✅ Shopify Dev MCP installed"
else
    echo "❌ Failed to install Shopify Dev MCP"
    exit 1
fi
echo ""

# Install Playwright MCP
echo "📦 Installing Playwright MCP..."
npm install -g @playwright/mcp@latest
if [ $? -eq 0 ]; then
    echo "✅ Playwright MCP installed"
else
    echo "❌ Failed to install Playwright MCP"
    exit 1
fi
echo ""

# Install GitHub MCP
echo "📦 Installing GitHub MCP Server..."
npm install -g @modelcontextprotocol/server-github
if [ $? -eq 0 ]; then
    echo "✅ GitHub MCP Server installed"
else
    echo "❌ Failed to install GitHub MCP Server"
    exit 1
fi
echo ""

# Install Shopify Admin MCP
echo "📦 Installing Shopify Admin MCP..."
npm install -g @akson/mcp-shopify
if [ $? -eq 0 ]; then
    echo "✅ Shopify Admin MCP installed"
else
    echo "❌ Failed to install Shopify Admin MCP"
    exit 1
fi
echo ""

# Install Railway CLI (optional but recommended)
echo "📦 Installing Railway CLI..."
npm install -g @railway/cli
if [ $? -eq 0 ]; then
    echo "✅ Railway CLI installed"
else
    echo "⚠️  Warning: Railway CLI installation failed (optional)"
fi
echo ""

# Verify installations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Verifying installations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SHOPIFY_VERSION=$(npx @shopify/dev-mcp@latest --version 2>/dev/null || echo "NOT FOUND")
PLAYWRIGHT_VERSION=$(npx @playwright/mcp@latest --version 2>/dev/null || echo "NOT FOUND")
GITHUB_VERSION=$(npx @modelcontextprotocol/server-github --version 2>/dev/null || echo "NOT FOUND")
SHOPIFY_ADMIN_VERSION=$(npx @akson/mcp-shopify --version 2>/dev/null || echo "NOT FOUND")

echo "Shopify Dev MCP:   $SHOPIFY_VERSION"
echo "Playwright MCP:    $PLAYWRIGHT_VERSION"
echo "GitHub MCP:        $GITHUB_VERSION"
echo "Shopify Admin MCP: $SHOPIFY_ADMIN_VERSION"
echo ""

# Create Claude config directory if not exists
CONFIG_DIR="$HOME/.config/claude"
if [ ! -d "$CONFIG_DIR" ]; then
    echo "📁 Creating Claude config directory: $CONFIG_DIR"
    mkdir -p "$CONFIG_DIR"
fi

# Check if config.json exists
CONFIG_FILE="$CONFIG_DIR/config.json"
if [ -f "$CONFIG_FILE" ]; then
    echo "⚠️  Warning: $CONFIG_FILE already exists"
    echo "   Backup: $CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Configure MCP servers in Claude:"
echo "   cp automation/mcp/config.template.json ~/.config/claude/config.json"
echo ""
echo "2. Edit config with your credentials:"
echo "   - GITHUB_TOKEN"
echo "   - SHOPIFY_ACCESS_TOKEN (for Admin MCP)"
echo "   - SHOPIFY_DOMAIN (for Admin MCP)"
echo ""
echo "3. Restart Claude Desktop/Code"
echo ""
echo "4. Verify MCP servers:"
echo "   claude mcp list"
echo ""
echo "   Expected output:"
echo "   ✓ shopify-dev"
echo "   ✓ playwright"
echo "   ✓ github"
echo "   ✓ shopify-admin"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
