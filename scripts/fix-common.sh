#!/bin/bash
# Fix common issues script

set -e

echo "=== LAGO Website Fix Script ==="

# Remove .next cache if corrupted
echo "Checking .next cache..."
if [ -d ".next" ]; then
    echo "Removing .next cache..."
    rm -rf .next
    echo "✓ .next cache cleared"
else
    echo "✓ No .next cache to clear"
fi

# Check for env files
echo ""
echo "Checking environment files..."
if [ -f ".env.local" ]; then
    echo "✓ .env.local exists"
else
    if [ -f ".env.local.example" ]; then
        echo "⚠ .env.local missing (copy from .env.local.example)"
    else
        echo "⚠ .env.local missing (no example file found)"
    fi
fi

if [ -f ".env.example" ]; then
    echo "✓ .env.example exists"
fi

# Check node_modules
echo ""
echo "Checking node_modules..."
if [ -d "node_modules" ]; then
    echo "✓ node_modules exists"
else
    echo "✗ node_modules missing - run: npm install"
fi

# Check for common mistakes in tsconfig
echo ""
echo "Checking tsconfig..."
if [ -f "tsconfig.json" ]; then
    echo "✓ tsconfig.json exists"
else
    echo "✗ tsconfig.json missing"
fi

# Clear dist if it exists
echo ""
echo "Checking dist folder..."
if [ -d "dist" ]; then
    echo "Removing dist folder..."
    rm -rf dist
    echo "✓ dist folder cleared"
fi

echo ""
echo "=== Fix complete! ==="
echo "If issues persist, try: npm install"
