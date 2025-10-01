#!/bin/bash

echo "🚀 Starting Medusa production server..."

# In production, run from built files, not TypeScript
echo "🌟 Starting from .medusa build output..."
node .medusa/index.js
