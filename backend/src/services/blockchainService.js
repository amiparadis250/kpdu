const crypto = require('crypto');
const canisterClient = require('./canisterClient');

class BlockchainService {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      await canisterClient.init();
      this.initialized = true;
    }
  }

  // Register voter on blockchain
  async registerVoter(memberId, branchId) {
    await this.init();
    const identityActor = canisterClient.getActor('identity');
    return await identityActor.registerVoter(memberId, branchId);
  }

  // Verify voter exists
  async verifyVoter(memberId) {
    await this.init();
    const identityActor = canisterClient.getActor('identity');
    const result = await identityActor.verifyVoter(memberId);
    return result.length > 0 ? result[0] : null;
  }

  // Cast vote on blockchain
  async castVote(memberId, positionId, candidateId, level) {
    await this.init();
    
    // Hash voter ID for privacy
    const hashedVoter = crypto.createHash('sha256').update(memberId).digest('hex');
    
    const votingActor = canisterClient.getActor('voting');
    const resultsActor = canisterClient.getActor('results');
    
    // Cast vote
    const voteResult = await votingActor.castVote(hashedVoter, positionId, candidateId, level);
    
    // If vote successful, update results
    if (voteResult) {
      await resultsActor.addVote(positionId, candidateId);
    }
    
    return voteResult;
  }

  // Mark voter as having voted
  async markVoted(memberId, level) {
    await this.init();
    const identityActor = canisterClient.getActor('identity');
    return await identityActor.markVoted(memberId, level);
  }

  // Get voting results
  async getResults(positionId) {
    await this.init();
    const resultsActor = canisterClient.getActor('results');
    return await resultsActor.getResults(positionId);
  }

  // Get all votes for a position
  async getVotes(positionId) {
    await this.init();
    const votingActor = canisterClient.getActor('voting');
    return await votingActor.getVotes(positionId);
  }
}

module.exports = new BlockchainService();