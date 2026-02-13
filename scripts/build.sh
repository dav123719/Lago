#!/bin/bash
# Optimized build script with error handling
set -e

echo "=== LAGO Website Build Script ==="

# Clean previous build
echo "Cleaning..."
rm -rf .next dist

# Type check first (fast fail)
echo "TypeScript check..."
npx tsc --noEmit

# Run build
echo "Building..."
npm run build

echo "Build complete!"
