#!/bin/bash
echo "=== DEBUGGING ADMIN BUILD ==="

echo "1. Build output structure:"
npm run build
echo ""

echo "2. .medusa directory contents:"
find .medusa -type f -name "*.html" -exec ls -la {} \;
echo ""

echo "3. Testing different copy approaches:"
mkdir -p .medusa/admin-test
cp .medusa/client/index.html .medusa/admin-test/
cp .medusa/client/index.html .medusa/
echo "Files copied to multiple locations"

echo "4. File permissions:"
ls -la .medusa/client/index.html
ls -la .medusa/admin/index.html 2>/dev/null || echo "admin/index.html not found"

echo "5. Testing server start (will fail but show exact path):"
timeout 5 npm run start || echo "Server failed as expected"
