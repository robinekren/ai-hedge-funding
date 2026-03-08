#!/bin/bash
# CI/CD Localhost Shortcut — ai-hedge-funding
# Baut und startet das Frontend auf http://localhost:3000

set -e

cd "$(dirname "$0")/frontend"

git checkout main
git pull origin main

rm -rf .next
npm install
npx next build
npx next start -p 3000
