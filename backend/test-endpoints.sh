#!/bin/bash

echo "🧪 Testing Dayrade Backend Endpoints"
echo "====================================="

BASE_URL="http://localhost:3001"

echo ""
echo "1. Testing Health Endpoint..."
curl -s "$BASE_URL/health" | jq .

echo ""
echo "2. Testing Root Endpoint..."
curl -s "$BASE_URL/" | jq .

echo ""
echo "3. Testing Auth Login (POST)..."
curl -s -X POST -H "Content-Type: application/json" "$BASE_URL/api/auth/login" | jq .

echo ""
echo "4. Testing Auth Register (POST)..."
curl -s -X POST -H "Content-Type: application/json" "$BASE_URL/api/auth/register" | jq .

echo ""
echo "5. Testing Tournament Routes..."
curl -s "$BASE_URL/api/tournaments" | jq .

echo ""
echo "6. Testing Trading Routes..."
curl -s "$BASE_URL/api/trading" | jq .

echo ""
echo "7. Testing Admin Routes..."
curl -s "$BASE_URL/api/admin" | jq .

echo ""
echo "8. Testing Webhook Routes..."
curl -s "$BASE_URL/api/webhooks" | jq .

echo ""
echo "9. Testing 404 Handler..."
curl -s "$BASE_URL/api/nonexistent" | jq .

echo ""
echo "✅ All endpoint tests completed!"