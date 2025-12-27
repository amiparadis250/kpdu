// KMPDU Blockchain API Test Client
// File: backend/test_blockchain_api.js

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/blockchain';
const JWT_TOKEN = 'your-jwt-token-here'; // Replace with actual token

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

class BlockchainAPITest {
  
  // Test 1: Create Election
  async testCreateElection() {
    console.log('\n🗳️  Testing: Create Election');
    
    const electionData = {
      title: "2024 KMPDU Test Election",
      description: "Test election for API validation",
      electionType: "NATIONAL",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      positions: [
        {
          positionId: "test-president",
          title: "Test President",
          description: "Test presidential position",
          maxVotesPerVoter: 1,
          candidates: [
            {
              candidateId: "test-candidate-1",
              name: "Dr. Test Candidate 1",
              bio: "First test candidate"
            },
            {
              candidateId: "test-candidate-2", 
              name: "Dr. Test Candidate 2",
              bio: "Second test candidate"
            }
          ]
        }
      ]
    };

    try {
      const response = await api.post('/elections', electionData);
      console.log('✅ Election created:', response.data);
      return response.data.electionId;
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
      return null;
    }
  }

  // Test 2: Cast Vote
  async testCastVote(electionId) {
    console.log('\n🗳️  Testing: Cast Vote');
    
    const voteData = {
      electionId,
      memberId: "KMPDU12345",
      nationalId: "12345678",
      positionId: "test-president",
      candidateId: "test-candidate-1",
      userBranch: "WESTERN"
    };

    try {
      const response = await api.post('/vote', voteData);
      console.log('✅ Vote cast:', response.data);
      return response.data.voteId;
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
      return null;
    }
  }

  // Test 3: Check Duplicate Vote
  async testDuplicateVote(electionId) {
    console.log('\n🚫 Testing: Duplicate Vote Prevention');
    
    const voteData = {
      electionId,
      memberId: "KMPDU12345",
      nationalId: "12345678",
      positionId: "test-president",
      candidateId: "test-candidate-2", // Different candidate
      userBranch: "WESTERN"
    };

    try {
      const response = await api.post('/vote', voteData);
      console.log('⚠️  Unexpected success:', response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Duplicate vote correctly blocked:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
  }

  // Test 4: Check Vote Status
  async testVoteStatus(electionId) {
    console.log('\n📊 Testing: Vote Status Check');
    
    try {
      const response = await api.get(`/vote-status/${electionId}?memberId=KMPDU12345&nationalId=12345678`);
      console.log('✅ Vote status:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }

  // Test 5: Get Results
  async testGetResults(electionId) {
    console.log('\n📈 Testing: Get Results');
    
    try {
      const response = await api.get(`/results/${electionId}`);
      console.log('✅ Results:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }

  // Test 6: Verify Vote
  async testVerifyVote(voteId) {
    if (!voteId) return;
    
    console.log('\n🔍 Testing: Vote Verification');
    
    try {
      const response = await api.get(`/verify/${voteId}`);
      console.log('✅ Vote verified:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }

  // Test 7: Get All Elections
  async testGetAllElections() {
    console.log('\n📋 Testing: Get All Elections');
    
    try {
      const response = await api.get('/elections');
      console.log('✅ Elections:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 KMPDU Blockchain API Test Suite');
    console.log('=' .repeat(50));

    try {
      // Test sequence
      const electionId = await this.testCreateElection();
      
      if (electionId) {
        const voteId = await this.testCastVote(electionId);
        await this.testDuplicateVote(electionId);
        await this.testVoteStatus(electionId);
        await this.testGetResults(electionId);
        await this.testVerifyVote(voteId);
      }
      
      await this.testGetAllElections();
      
      console.log('\n' + '=' .repeat(50));
      console.log('🏁 Test suite completed');
      
    } catch (error) {
      console.error('💥 Test suite failed:', error.message);
    }
  }
}

// Usage examples for different scenarios
class UsageExamples {
  
  static async memberVotingFlow() {
    console.log('\n👤 MEMBER VOTING FLOW EXAMPLE');
    console.log('-' .repeat(30));
    
    const memberId = "KMPDU67890";
    const nationalId = "87654321";
    const electionId = "election-1703123456789";
    
    try {
      // 1. Check if already voted
      console.log('1. Checking vote status...');
      const statusResponse = await api.get(`/vote-status/${electionId}?memberId=${memberId}&nationalId=${nationalId}`);
      
      if (statusResponse.data.hasVoted) {
        console.log('❌ Already voted in this election');
        return;
      }
      
      // 2. Cast vote
      console.log('2. Casting vote...');
      const voteResponse = await api.post('/vote', {
        electionId,
        memberId,
        nationalId,
        positionId: "president",
        candidateId: "candidate-1",
        userBranch: "NYANZA"
      });
      
      console.log('✅ Vote successful:', voteResponse.data.voteId);
      
      // 3. Verify vote was recorded
      console.log('3. Verifying vote...');
      const verifyResponse = await api.get(`/verify/${voteResponse.data.voteId}`);
      console.log('✅ Vote verified on blockchain');
      
    } catch (error) {
      console.log('❌ Voting failed:', error.response?.data?.error || error.message);
    }
  }
  
  static async adminElectionFlow() {
    console.log('\n👨‍💼 ADMIN ELECTION MANAGEMENT EXAMPLE');
    console.log('-' .repeat(40));
    
    try {
      // 1. Create election
      console.log('1. Creating election...');
      const electionResponse = await api.post('/elections', {
        title: "2024 Branch Elections",
        electionType: "BRANCH",
        branchId: "EASTERN",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        positions: [{
          positionId: "branch-chair",
          title: "Branch Chairperson",
          maxVotesPerVoter: 1,
          candidates: [
            { candidateId: "chair-1", name: "Dr. Eastern Leader 1" },
            { candidateId: "chair-2", name: "Dr. Eastern Leader 2" }
          ]
        }]
      });
      
      console.log('✅ Election created:', electionResponse.data.electionId);
      
      // 2. Monitor results
      console.log('2. Getting real-time results...');
      const resultsResponse = await api.get(`/results/${electionResponse.data.electionId}`);
      console.log('📊 Current results:', resultsResponse.data.results);
      
    } catch (error) {
      console.log('❌ Admin operation failed:', error.response?.data?.error || error.message);
    }
  }
}

// Main execution
async function main() {
  console.log('🔗 Testing KMPDU Blockchain API Integration\n');
  
  // Check if server is running
  try {
    await api.get('/elections');
    console.log('✅ API server is running');
  } catch (error) {
    console.log('❌ API server not accessible. Make sure backend is running on port 5000');
    console.log('   Start with: npm run dev');
    return;
  }
  
  // Run comprehensive tests
  const testSuite = new BlockchainAPITest();
  await testSuite.runAllTests();
  
  // Show usage examples
  await UsageExamples.memberVotingFlow();
  await UsageExamples.adminElectionFlow();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BlockchainAPITest, UsageExamples };