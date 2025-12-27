#!/bin/bash

# KMPDU Blockchain API Test Script
# No additional dependencies required - uses curl

API_BASE="http://localhost:5000/api/blockchain"
JWT_TOKEN="your-jwt-token-here"  # Replace with actual token

echo "🚀 KMPDU Blockchain API Test Suite"
echo "=================================="

# Check if server is running
echo -e "\n📡 Checking API server..."
if curl -s "$API_BASE/elections" -H "Authorization: Bearer $JWT_TOKEN" > /dev/null; then
    echo "✅ API server is running"
else
    echo "❌ API server not accessible. Start backend with: npm run dev"
    exit 1
fi

# Test 1: Create Election
echo -e "\n🗳️  Test 1: Creating Election"
ELECTION_RESPONSE=$(curl -s -X POST "$API_BASE/elections" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "title": "2024 Test Election",
    "description": "API Test Election",
    "electionType": "NATIONAL",
    "startDate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "endDate": "'$(date -u -d '+7 days' +%Y-%m-%dT%H:%M:%SZ)'",
    "positions": [{
      "positionId": "test-president",
      "title": "Test President",
      "maxVotesPerVoter": 1,
      "candidates": [
        {"candidateId": "candidate-1", "name": "Dr. Test One"},
        {"candidateId": "candidate-2", "name": "Dr. Test Two"}
      ]
    }]
  }')

echo "Response: $ELECTION_RESPONSE"

# Extract election ID (basic parsing)
ELECTION_ID=$(echo "$ELECTION_RESPONSE" | grep -o '"electionId":"[^"]*"' | cut -d'"' -f4)
echo "Election ID: $ELECTION_ID"

# Test 2: Cast Vote
echo -e "\n🗳️  Test 2: Casting Vote"
VOTE_RESPONSE=$(curl -s -X POST "$API_BASE/vote" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "memberId": "KMPDU12345",
    "nationalId": "12345678",
    "positionId": "test-president",
    "candidateId": "candidate-1",
    "userBranch": "WESTERN"
  }')

echo "Response: $VOTE_RESPONSE"

# Extract vote ID
VOTE_ID=$(echo "$VOTE_RESPONSE" | grep -o '"voteId":"[^"]*"' | cut -d'"' -f4)
echo "Vote ID: $VOTE_ID"

# Test 3: Duplicate Vote (should fail)
echo -e "\n🚫 Test 3: Testing Duplicate Vote Prevention"
DUPLICATE_RESPONSE=$(curl -s -X POST "$API_BASE/vote" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "memberId": "KMPDU12345",
    "nationalId": "12345678",
    "positionId": "test-president",
    "candidateId": "candidate-2",
    "userBranch": "WESTERN"
  }')

echo "Response: $DUPLICATE_RESPONSE"

# Test 4: Check Vote Status
echo -e "\n📊 Test 4: Checking Vote Status"
STATUS_RESPONSE=$(curl -s "$API_BASE/vote-status/$ELECTION_ID?memberId=KMPDU12345&nationalId=12345678" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Response: $STATUS_RESPONSE"

# Test 5: Get Results
echo -e "\n📈 Test 5: Getting Results"
RESULTS_RESPONSE=$(curl -s "$API_BASE/results/$ELECTION_ID" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Response: $RESULTS_RESPONSE"

# Test 6: Verify Vote
if [ ! -z "$VOTE_ID" ]; then
    echo -e "\n🔍 Test 6: Verifying Vote"
    VERIFY_RESPONSE=$(curl -s "$API_BASE/verify/$VOTE_ID" \
      -H "Authorization: Bearer $JWT_TOKEN")
    
    echo "Response: $VERIFY_RESPONSE"
fi

# Test 7: Get All Elections
echo -e "\n📋 Test 7: Getting All Elections"
ALL_ELECTIONS_RESPONSE=$(curl -s "$API_BASE/elections" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Response: $ALL_ELECTIONS_RESPONSE"

echo -e "\n🏁 Test Suite Completed!"
echo "=================================="

# Usage examples
echo -e "\n📚 USAGE EXAMPLES:"
echo "=================="

echo -e "\n1. Frontend JavaScript Integration:"
echo "const response = await fetch('/api/blockchain/vote', {"
echo "  method: 'POST',"
echo "  headers: {"
echo "    'Content-Type': 'application/json',"
echo "    'Authorization': 'Bearer ' + token"
echo "  },"
echo "  body: JSON.stringify(voteData)"
echo "});"

echo -e "\n2. Check if user already voted:"
echo "const status = await fetch('/api/blockchain/vote-status/election-123?memberId=KMPDU12345&nationalId=12345678');"

echo -e "\n3. Get real-time results:"
echo "const results = await fetch('/api/blockchain/results/election-123');"

echo -e "\n🔧 Setup Instructions:"
echo "1. Add to backend/src/app.js:"
echo "   const blockchainRoutes = require('./routes/blockchain');"
echo "   app.use('/api/blockchain', blockchainRoutes);"
echo ""
echo "2. Install dependencies:"
echo "   npm install @dfinity/agent @dfinity/principal"
echo ""
echo "3. Set environment variables:"
echo "   VOTING_CANISTER_ID=your-canister-id"
echo "   ICP_HOST=http://localhost:8000"