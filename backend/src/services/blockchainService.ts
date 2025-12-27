const { Actor, HttpAgent } = require('@dfinity/agent');
const { Principal } = require('@dfinity/principal');
const crypto = require('crypto');

// Your deployed canister IDs
const CANISTER_IDS = {
  electionFactory: 'uxrrr-q7777-77774-qaaaq-cai',
  electionVoting: 'u6s2n-gx777-77774-qaaba-cai', 
  identity: 'uzt4z-lp777-77774-qaabq-cai',
  results: 'umunu-kh777-77774-qaaca-cai',
  voting: 'ulvla-h7777-77774-qaacq-cai'
};

// Local development agent
const agent = new HttpAgent({ host: 'http://127.0.0.1:4943' });

// Disable certificate verification for local development
if (process.env.NODE_ENV !== 'production') {
  agent.fetchRootKey().catch(err => {
    console.warn('Unable to fetch root key:', err);
  });
}

// IDL interfaces for canisters
const electionFactoryIDL = ({ IDL }) => {
  const ElectionType = IDL.Variant({ 'NATIONAL': IDL.Null, 'BRANCH': IDL.Null });
  const ElectionStatus = IDL.Variant({ 
    'DRAFT': IDL.Null, 
    'ACTIVE': IDL.Null, 
    'COMPLETED': IDL.Null, 
    'CANCELLED': IDL.Null 
  });
  const ElectionInfo = IDL.Record({
    'electionId': IDL.Text,
    'title': IDL.Text,
    'canisterId': IDL.Principal,
    'electionType': ElectionType,
    'branchId': IDL.Opt(IDL.Text),
    'startDate': IDL.Int,
    'endDate': IDL.Int,
    'status': ElectionStatus,
    'createdAt': IDL.Int,
    'createdBy': IDL.Principal
  });
  const FactoryResult = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });
  
  return IDL.Service({
    'createElection': IDL.Func([IDL.Text, IDL.Text, IDL.Principal, ElectionType, IDL.Opt(IDL.Text), IDL.Int, IDL.Int], [FactoryResult], []),
    'getAllElections': IDL.Func([], [IDL.Vec(ElectionInfo)], ['query']),
    'getActiveElections': IDL.Func([], [IDL.Vec(ElectionInfo)], ['query']),
    'getElectionInfo': IDL.Func([IDL.Text], [IDL.Opt(ElectionInfo)], ['query']),
    'updateElectionStatus': IDL.Func([IDL.Text, ElectionStatus], [FactoryResult], [])
  });
};

const identityIDL = ({ IDL }) => {
  const Voter = IDL.Record({
    'memberId': IDL.Text,
    'branchId': IDL.Text,
    'hasVotedNational': IDL.Bool,
    'hasVotedBranch': IDL.Bool
  });
  
  return IDL.Service({
    'registerVoter': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'verifyVoter': IDL.Func([IDL.Text], [IDL.Opt(Voter)], ['query']),
    'markVoted': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], [])
  });
};

const electionVotingIDL = ({ IDL }) => {
  const ElectionType = IDL.Variant({ 'NATIONAL': IDL.Null, 'BRANCH': IDL.Null });
  const ElectionStatus = IDL.Variant({ 
    'DRAFT': IDL.Null, 
    'ACTIVE': IDL.Null, 
    'COMPLETED': IDL.Null, 
    'CANCELLED': IDL.Null 
  });
  const VoteResult = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });
  const Vote = IDL.Record({
    'voteId': IDL.Text,
    'voterHash': IDL.Text,
    'positionId': IDL.Text,
    'candidateId': IDL.Text,
    'timestamp': IDL.Int,
    'verified': IDL.Bool
  });
  
  return IDL.Service({
    'castVote': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [VoteResult], []),
    'getResults': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, IDL.Nat))], ['query']),
    'getElectionStats': IDL.Func([], [IDL.Record({
      'totalVoters': IDL.Nat,
      'totalVotes': IDL.Nat,
      'positions': IDL.Nat,
      'candidates': IDL.Nat,
      'status': ElectionStatus
    })], ['query']),
    'verifyVote': IDL.Func([IDL.Text], [IDL.Opt(Vote)], ['query'])
  });
};

// Create actor instances
const electionFactoryActor = Actor.createActor(electionFactoryIDL, {
  agent,
  canisterId: CANISTER_IDS.electionFactory
});

const identityActor = Actor.createActor(identityIDL, {
  agent,
  canisterId: CANISTER_IDS.identity
});

const electionVotingActor = Actor.createActor(electionVotingIDL, {
  agent,
  canisterId: CANISTER_IDS.electionVoting
});

class BlockchainService {
  // Generate anonymous voter hash from user data
  generateVoterHash(memberId, nationalId) {
    return crypto.createHash('sha256')
      .update(memberId + nationalId + process.env.HASH_SALT || 'kmpdu_salt')
      .digest('hex');
  }

  // ELECTION FACTORY METHODS
  async createElection(electionData) {
    try {
      const { electionId, title, electionType, branchId, startDate, endDate } = electionData;
      
      // Use election voting canister as the election canister
      const canisterId = Principal.fromText(CANISTER_IDS.electionVoting);
      const type = electionType === 'NATIONAL' ? { 'NATIONAL': null } : { 'BRANCH': null };
      const branch = branchId ? [branchId] : [];
      
      const result = await electionFactoryActor.createElection(
        electionId,
        title,
        canisterId,
        type,
        branch,
        BigInt(startDate),
        BigInt(endDate)
      );
      
      return result;
    } catch (error) {
      console.error('Blockchain createElection error:', error);
      throw error;
    }
  }

  async getAllElections() {
    try {
      const elections = await electionFactoryActor.getAllElections();
      return elections.map(election => ({
        electionId: election.electionId,
        title: election.title,
        electionType: Object.keys(election.electionType)[0],
        branchId: election.branchId[0] || null,
        startDate: Number(election.startDate),
        endDate: Number(election.endDate),
        status: Object.keys(election.status)[0],
        createdAt: Number(election.createdAt)
      }));
    } catch (error) {
      console.error('Blockchain getAllElections error:', error);
      throw error;
    }
  }

  async getActiveElections() {
    try {
      const elections = await electionFactoryActor.getActiveElections();
      return elections.map(election => ({
        electionId: election.electionId,
        title: election.title,
        electionType: Object.keys(election.electionType)[0],
        branchId: election.branchId[0] || null,
        startDate: Number(election.startDate),
        endDate: Number(election.endDate),
        status: Object.keys(election.status)[0]
      }));
    } catch (error) {
      console.error('Blockchain getActiveElections error:', error);
      throw error;
    }
  }

  async updateElectionStatus(electionId, status) {
    try {
      const statusVariant = { [status]: null };
      const result = await electionFactoryActor.updateElectionStatus(electionId, statusVariant);
      return result;
    } catch (error) {
      console.error('Blockchain updateElectionStatus error:', error);
      throw error;
    }
  }

  // IDENTITY METHODS
  async registerVoter(memberId, branchId) {
    try {
      const result = await identityActor.registerVoter(memberId, branchId);
      return result;
    } catch (error) {
      console.error('Blockchain registerVoter error:', error);
      throw error;
    }
  }

  async verifyVoter(memberId) {
    try {
      const result = await identityActor.verifyVoter(memberId);
      return result[0] || null;
    } catch (error) {
      console.error('Blockchain verifyVoter error:', error);
      throw error;
    }
  }

  async markVoted(memberId, level) {
    try {
      const result = await identityActor.markVoted(memberId, level);
      return result;
    } catch (error) {
      console.error('Blockchain markVoted error:', error);
      throw error;
    }
  }

  // VOTING METHODS
  async castVote(memberId, nationalId, positionId, candidateId, userBranch) {
    try {
      const voterHash = this.generateVoterHash(memberId, nationalId);
      
      const result = await electionVotingActor.castVote(
        voterHash,
        positionId,
        candidateId,
        userBranch
      );
      
      return result;
    } catch (error) {
      console.error('Blockchain castVote error:', error);
      throw error;
    }
  }

  async getResults() {
    try {
      const results = await electionVotingActor.getResults();
      return results.map(([candidateId, positionId, count]) => ({
        candidateId,
        positionId,
        votes: Number(count)
      }));
    } catch (error) {
      console.error('Blockchain getResults error:', error);
      throw error;
    }
  }

  async getElectionStats() {
    try {
      const stats = await electionVotingActor.getElectionStats();
      return {
        totalVoters: Number(stats.totalVoters),
        totalVotes: Number(stats.totalVotes),
        positions: Number(stats.positions),
        candidates: Number(stats.candidates),
        status: Object.keys(stats.status)[0]
      };
    } catch (error) {
      console.error('Blockchain getElectionStats error:', error);
      throw error;
    }
  }

  async verifyVote(voteId) {
    try {
      const result = await electionVotingActor.verifyVote(voteId);
      if (result[0]) {
        const vote = result[0];
        return {
          voteId: vote.voteId,
          voterHash: vote.voterHash,
          positionId: vote.positionId,
          candidateId: vote.candidateId,
          timestamp: Number(vote.timestamp),
          verified: vote.verified
        };
      }
      return null;
    } catch (error) {
      console.error('Blockchain verifyVote error:', error);
      throw error;
    }
  }

  // UTILITY METHODS
  async getCanisterStatus() {
    try {
      const status = {
        electionFactory: CANISTER_IDS.electionFactory,
        electionVoting: CANISTER_IDS.electionVoting,
        identity: CANISTER_IDS.identity,
        results: CANISTER_IDS.results,
        voting: CANISTER_IDS.voting,
        network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'local',
        connected: true
      };
      return status;
    } catch (error) {
      console.error('Blockchain status error:', error);
      return { connected: false, error: error.message };
    }
  }
}

module.exports = new BlockchainService();