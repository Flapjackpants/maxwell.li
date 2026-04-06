#!/bin/bash

echo "Cleaning .next directory..."
rm -rf .next

echo "Building project..."
npm run build

echo "Starting server..."
npm start
