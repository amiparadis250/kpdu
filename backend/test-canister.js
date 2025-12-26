const canisterClient = require('./src/services/canisterClient');

async function testCanisterClient() {
  try {
    console.log('Testing canister client...');
    await canisterClient.init();
    
    // Test identity actor
    const identityActor = canisterClient.getActor('identity');
    console.log('✅ Identity actor created');
    
    // Test voting actor
    const votingActor = canisterClient.getActor('voting');
    console.log('✅ Voting actor created');
    
    // Test results actor
    const resultsActor = canisterClient.getActor('results');
    console.log('✅ Results actor created');
    
    console.log('🎉 All canister actors initialized successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCanisterClient();