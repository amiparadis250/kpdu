const blockchainService = require('./src/services/blockchainService');

async function testBlockchainService() {
  try {
    console.log('Testing blockchain service...');
    
    // Test voter registration
    console.log('1. Testing voter registration...');
    const registerResult = await blockchainService.registerVoter('TEST001', 'BRANCH001');
    console.log('✅ Register result:', registerResult);
    
    // Test voter verification
    console.log('2. Testing voter verification...');
    const voter = await blockchainService.verifyVoter('TEST001');
    console.log('✅ Voter found:', voter);
    
    // Test vote casting
    console.log('3. Testing vote casting...');
    const voteResult = await blockchainService.castVote('TEST001', 'POS001', 'CAND001', 'national');
    console.log('✅ Vote result:', voteResult);
    
    // Test mark voted
    console.log('4. Testing mark voted...');
    const markResult = await blockchainService.markVoted('TEST001', 'national');
    console.log('✅ Mark voted result:', markResult);
    
    // Test get results
    console.log('5. Testing get results...');
    const results = await blockchainService.getResults('POS001');
    console.log('✅ Results:', results);
    
    console.log('🎉 All blockchain service tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBlockchainService();