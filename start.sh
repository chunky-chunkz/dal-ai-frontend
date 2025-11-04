#!/bin/bash
# Startscript für Next.js Frontend (dal-ai-frontend)
# Autorisiert Proxy-Betrieb über Nginx (Port 443 -> 3020)

script_dir=$(dirname "$(realpath "$0")")

cd "$script_dir" || exit 1

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building project..."
npm run build

echo "🚀 Starting Next.js server on port 3020..."
npm run start -- -p 3020
