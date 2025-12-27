# KMPDU Blockchain Voting API Documentation

## Base URL
```
http://localhost:5000/api/blockchain
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📋 API Endpoints

### 1. Create Election
**POST** `/elections`

Creates a new election on the blockchain.

**Request Body:**
```json
{
  "title": "2024 KMPDU National Elections",
  "description": "Annual leadership elections",
  "electionType": "NATIONAL", // or "BRANCH"
  "branchId": "WESTERN", // required for BRANCH elections
  "startDate": "2024-03-01T00:00:00Z",
  "endDate": "2024-03-07T23:59:59Z",
  "positions": [
    {
      "positionId": "president",
      "title": "National President",
      "description": "Lead the union nationally",
      "maxVotesPerVoter": 1,
      "candidates": [
        {
          "candidateId": "john-doe",
          "name": "Dr. John Doe",
          "bio": "Experienced medical leader",
          "photo": "https://example.com/photo.jpg"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "electionId": "election-1703123456789",
  "message": "Election created on blockchain"
}
```

### 2. Cast Vote
**POST** `/vote`

Casts a vote on the blockchain with duplicate prevention.

**Request Body:**
```json
{
  "electionId": "election-1703123456789",
  "memberId": "KMPDU12345",
  "nationalId": "12345678",
  "positionId": "president",
  "candidateId": "john-doe",
  "userBranch": "WESTERN"
}
```

**Response:**
```json
{
  "success": true,
  "voteId": "voter123hash-election-1703123456789-president-1703123456789",
  "message": "Vote cast successfully on blockchain"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "You have already voted in this election"
}
```

### 3. Check Voting Status
**GET** `/vote-status/:electionId?memberId=KMPDU12345&nationalId=12345678`

Checks if a voter has already voted in an election.

**Response:**
```json
{
  "success": true,
  "hasVoted": true,
  "voterHash": "a1b2c3d4..." // Partial hash for verification
}
```

### 4. Get Election Results
**GET** `/results/:electionId`

Retrieves real-time vote counts from blockchain.

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "candidateId": "john-doe",
      "positionId": "president",
      "voteCount": 150
    },
    {
      "candidateId": "jane-smith",
      "positionId": "president",
      "voteCount": 120
    }
  ]
}
```

### 5. Get All Elections
**GET** `/elections`

Lists all elections on the blockchain.

**Response:**
```json
{
  "success": true,
  "elections": [
    {
      "electionId": "election-1703123456789",
      "title": "2024 KMPDU National Elections",
      "electionType": "NATIONAL",
      "status": "ACTIVE",
      "startDate": "2024-03-01T00:00:00Z",
      "endDate": "2024-03-07T23:59:59Z"
    }
  ]
}
```

### 6. Verify Vote
**GET** `/verify/:voteId`

Verifies a specific vote exists on blockchain.

**Response:**
```json
{
  "success": true,
  "vote": {
    "voteId": "voter123hash-election-1703123456789-president-1703123456789",
    "electionId": "election-1703123456789",
    "positionId": "president",
    "candidateId": "john-doe",
    "timestamp": 1703123456789,
    "verified": true
  }
}
```

## 🔧 Frontend Integration Examples

### React/JavaScript Usage

```javascript
// 1. Create Election (Admin only)
const createElection = async (electionData) => {
  const response = await fetch('/api/blockchain/elections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(electionData)
  });
  return response.json();
};

// 2. Cast Vote
const castVote = async (voteData) => {
  const response = await fetch('/api/blockchain/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(voteData)
  });
  return response.json();
};

// 3. Check if user already voted
const checkVotingStatus = async (electionId, memberId, nationalId) => {
  const response = await fetch(
    `/api/blockchain/vote-status/${electionId}?memberId=${memberId}&nationalId=${nationalId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
};

// 4. Get results
const getResults = async (electionId) => {
  const response = await fetch(`/api/blockchain/results/${electionId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### Complete Voting Flow

```javascript
// Complete voting process
const handleVote = async (electionId, positionId, candidateId) => {
  try {
    // 1. Check if already voted
    const status = await checkVotingStatus(electionId, user.memberId, user.nationalId);
    
    if (status.hasVoted) {
      alert('You have already voted in this election');
      return;
    }

    // 2. Cast vote
    const voteResult = await castVote({
      electionId,
      memberId: user.memberId,
      nationalId: user.nationalId,
      positionId,
      candidateId,
      userBranch: user.branch
    });

    if (voteResult.success) {
      alert('Vote cast successfully!');
      console.log('Vote ID:', voteResult.voteId);
    } else {
      alert('Error: ' + voteResult.error);
    }
  } catch (error) {
    console.error('Voting error:', error);
    alert('Failed to cast vote');
  }
};
```

## 🛡️ Security Features

### 1. Voter Anonymity
- Member ID + National ID hashed with SHA-256
- No vote-to-voter linkage possible
- Only aggregated counts stored

### 2. Duplicate Prevention
- Blockchain-level duplicate checking
- Multiple validation layers
- Real-time status checking

### 3. Branch Validation
- Automatic branch eligibility checking
- National vs Branch election separation
- User branch verification

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install @dfinity/agent @dfinity/principal
```

### 2. Environment Variables
```env
# .env file
VOTING_CANISTER_ID=rdmx6-jaaaa-aaaaa-aaadq-cai
ICP_HOST=http://localhost:8000
```

### 3. Add to Express App
```javascript
// backend/src/app.js
const blockchainRoutes = require('./routes/blockchain');
app.use('/api/blockchain', blockchainRoutes);
```

### 4. Deploy ICP Canister
```bash
cd blockchain/kmpdu_voting
dfx deploy
dfx canister id election_voting
```

## 📊 Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Already voted | Duplicate vote attempt |
| 400 | Election not found | Invalid election ID |
| 400 | Not eligible | Wrong branch for branch election |
| 404 | Vote not found | Invalid vote ID for verification |
| 500 | Blockchain error | ICP canister communication failed |

## 🧪 Testing

```bash
# Test create election
curl -X POST http://localhost:5000/api/blockchain/elections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Test Election","electionType":"NATIONAL",...}'

# Test cast vote
curl -X POST http://localhost:5000/api/blockchain/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"electionId":"election-123","memberId":"KMPDU12345",...}'

# Test check status
curl http://localhost:5000/api/blockchain/vote-status/election-123?memberId=KMPDU12345&nationalId=12345678 \
  -H "Authorization: Bearer <token>"
```

This API provides complete blockchain integration for your KMPDU voting system with security, anonymity, and fraud prevention built-in!