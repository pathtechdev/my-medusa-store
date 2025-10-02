#!/bin/bash

echo "🔐 Creating admin user for Ying Floral..."
echo ""

# Default credentials (can be overridden with environment variables)
ADMIN_EMAIL="${MEDUSA_ADMIN_EMAIL:-admin@yingfloral.com}"
ADMIN_PASSWORD="${MEDUSA_ADMIN_PASSWORD:-YingFloral2025!}"

echo "📧 Email: $ADMIN_EMAIL"
echo "🔑 Password: $ADMIN_PASSWORD"
echo ""

# Create admin user using Medusa CLI
npx medusa user -e "$ADMIN_EMAIL" -p "$ADMIN_PASSWORD"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Admin user created successfully!"
    echo "🌐 Login at: https://yingfloral-production.up.railway.app/app"
else
    echo ""
    echo "❌ Failed to create admin user"
    echo "ℹ️  User might already exist. Try logging in with existing credentials."
fi 