import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Canister IDs from your deployment
const CANISTER_IDS = {
  voting: 'uzt4z-lp777-77774-qaabq-cai',
  results: 'u6s2n-gx777-77774-qaaba-cai',
  identity: 'uxrrr-q7777-77774-qaaaq-cai'
};

// Local development agent
const agent = new HttpAgent({ host: 'http://127.0.0.1:4943' });

// Disable certificate verification for local development
if (process.env.NODE_ENV !== 'production') {
  agent.fetchRootKey();
}

// IDL interfaces for canisters
const votingIDL = ({ IDL }) => {
  return IDL.Service({
    'registerVoter': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'verifyVoter': IDL.Func([IDL.Text], [IDL.Opt(IDL.Record({
      'memberId': IDL.Text,
      'branchId': IDL.Text,
      'hasVotedNational': IDL.Bool,
      'hasVotedBranch': IDL.Bool
    }))], ['query']),
    'castVote': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    'markVoted': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], [])
  });
};

const resultsIDL = ({ IDL }) => {
  return IDL.Service({
    'getResults': IDL.Func([IDL.Text], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))], ['query']),
    'getVotes': IDL.Func([IDL.Text], [IDL.Vec(IDL.Record({
      'positionId': IDL.Text,
      'candidateId': IDL.Text,
      'timestamp': IDL.Int
    }))], ['query'])
  });
};

// Create actor instances
const votingActor = Actor.createActor(votingIDL, {
  agent,
  canisterId: CANISTER_IDS.voting
});

const resultsActor = Actor.createActor(resultsIDL, {
  agent,
  canisterId: CANISTER_IDS.results
});

class BlockchainService {
  async registerVoter(memberId, branchId) {
    try {
      const result = await votingActor.registerVoter(memberId, branchId);
      return result;
    } catch (error) {
      console.error('Blockchain registerVoter error:', error);
      throw error;
    }
  }

  async verifyVoter(memberId) {
    try {
      const result = await votingActor.verifyVoter(memberId);
      return result[0] || null;
    } catch (error) {
      console.error('Blockchain verifyVoter error:', error);
      throw error;
    }
  }

  async castVote(memberId, positionId, candidateId, level) {
    try {
      const result = await votingActor.castVote(memberId, positionId, candidateId, level);
      return result;
    } catch (error) {
      console.error('Blockchain castVote error:', error);
      throw error;
    }
  }

  async markVoted(memberId, level) {
    try {
      const result = await votingActor.markVoted(memberId, level);
      return result;
    } catch (error) {
      console.error('Blockchain markVoted error:', error);
      throw error;
    }
  }

  async getResults(positionId) {
    try {
      const result = await resultsActor.getResults(positionId);
      return result;
    } catch (error) {
      console.error('Blockchain getResults error:', error);
      throw error;
    }
  }

  async getVotes(positionId) {
    try {
      const result = await resultsActor.getVotes(positionId);
      return result;
    } catch (error) {
      console.error('Blockchain getVotes error:', error);
      throw error;
    }
  }
}

export default new BlockchainService();