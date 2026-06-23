#!/bin/bash

echo "Fetching Minecraft crafting recipes..."
npm run db:fetch-crafting

echo "Cleaning .next directory..."
rm -rf .next

echo "Building project..."
npm run build

echo "Starting server..."
npm start
