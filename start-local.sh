#!/bin/bash
set -e

cd /home/user/ai-hedge-funding
git checkout main
git pull origin main

cd frontend
rm -rf .next
npm install
npx next build
npx next start -p 3000
