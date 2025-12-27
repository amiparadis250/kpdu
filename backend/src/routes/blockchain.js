// KMPDU Blockchain Voting API Endpoints
// File: backend/src/routes/blockchain.js

const express = require('express');
const { Actor, HttpAgent } = require('@dfinity/agent');
const { 
  checkBlockchainConnection,
  validateElectionData,
  validateVoteData,
  rateLimitVoting,
  auditLog,
  hashVoter,
  setBlockchainStatus
} = require('../middleware/blockchain');
const router = express.Router();

// ICP Canister Configuration
const CANISTER_ID = process.env.VOTING_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai';
const ICP_HOST = process.env.ICP_HOST || 'http://localhost:8000';

// Initialize ICP Actor
let votingActor = null;

async function initializeActor() {
  try {
    const agent = new HttpAgent({ host: ICP_HOST });
    // In development, fetch root key
    if (ICP_HOST.includes('localhost')) {
      await agent.fetchRootKey();
    }
    
    // Import your canister's IDL interface here
    const idlFactory = ({ IDL }) => {
      // Define your canister interface
      return IDL.Service({
        createElection: IDL.Func([IDL.Record({
          electionId: IDL.Text,
          title: IDL.Text,
          description: IDL.Opt(IDL.Text),
          electionType: IDL.Variant({ NATIONAL: IDL.Null, BRANCH: IDL.Null }),
          branchId: IDL.Opt(IDL.Text),
          startDate: IDL.Int,
          endDate: IDL.Int,
          status: IDL.Variant({ DRAFT: IDL.Null, ACTIVE: IDL.Null, COMPLETED: IDL.Null, CANCELLED: IDL.Null }),
          positions: IDL.Vec(IDL.Record({
            positionId: IDL.Text,
            title: IDL.Text,
            description: IDL.Opt(IDL.Text),
            maxVotesPerVoter: IDL.Nat,
            candidates: IDL.Vec(IDL.Record({
              candidateId: IDL.Text,
              name: IDL.Text,
              bio: IDL.Opt(IDL.Text),
              photo: IDL.Opt(IDL.Text)
            }))
          }))
        })], [IDL.Variant({ ok: IDL.Record({}), err: IDL.Text })]),
        castVote: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Variant({ ok: IDL.Text, err: IDL.Text })]),
        hasVoterVoted: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], ['query']),
        getResults: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, IDL.Nat))], ['query']),
        getAllElections: IDL.Func([], [IDL.Vec(IDL.Record({}))], ['query'])
      });
    };

    votingActor = Actor.createActor(idlFactory, {
      agent,
      canisterId: CANISTER_ID,
    });
    
    console.log('✅ Blockchain actor initialized');
    setBlockchainStatus(true);
  } catch (error) {
    console.error('❌ Failed to initialize blockchain actor:', error);
    setBlockchainStatus(false);
  }
}

// Initialize on startup
initializeActor();

// Helper function to hash voter identity
// Moved to middleware/blockchain.js

// 1. Create Election
router.post('/elections', 
  checkBlockchainConnection,
  validateElectionData,
  auditLog('CREATE_ELECTION'),
  async (req, res) => {
  try {
    const { title, description, electionType, branchId, startDate, endDate, positions } = req.body;
    
    const electionConfig = {
      electionId: `election-${Date.now()}`,
      title,
      description: description ? [description] : [],
      electionType: electionType === 'NATIONAL' ? { NATIONAL: null } : { BRANCH: null },
      branchId: branchId ? [branchId] : [],
      startDate: BigInt(new Date(startDate).getTime() * 1000000),
      endDate: BigInt(new Date(endDate).getTime() * 1000000),
      status: { ACTIVE: null },
      positions: positions.map(pos => ({
        positionId: pos.positionId,
        title: pos.title,
        description: pos.description ? [pos.description] : [],
        maxVotesPerVoter: pos.maxVotesPerVoter || 1,
        candidates: pos.candidates.map(candidate => ({
          candidateId: candidate.candidateId,
          name: candidate.name,
          bio: candidate.bio ? [candidate.bio] : [],
          photo: candidate.photo ? [candidate.photo] : []
        }))
      }))
    };

    const result = await votingActor.createElection(electionConfig);
    
    if ('ok' in result) {
      res.json({
        success: true,
        electionId: electionConfig.electionId,
        message: 'Election created on blockchain'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.err
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 2. Cast Vote
router.post('/vote',
  checkBlockchainConnection,
  validateVoteData,
  rateLimitVoting,
  auditLog('CAST_VOTE'),
  async (req, res) => {
  try {
    const { electionId, memberId, nationalId, positionId, candidateId, userBranch } = req.body;
    
    // Hash voter identity for anonymity
    const voterHash = hashVoter(memberId, nationalId);
    
    // Check if already voted
    const hasVoted = await votingActor.hasVoterVoted(voterHash, electionId);
    if (hasVoted) {
      return res.status(400).json({
        success: false,
        error: 'You have already voted in this election'
      });
    }

    const result = await votingActor.castVote(
      electionId,
      voterHash,
      positionId,
      candidateId,
      userBranch
    );
    
    if ('ok' in result) {
      res.json({
        success: true,
        voteId: result.ok,
        message: 'Vote cast successfully on blockchain'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.err
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. Check Voting Status
router.get('/vote-status/:electionId',
  checkBlockchainConnection,
  auditLog('CHECK_VOTE_STATUS'),
  async (req, res) => {
  try {
    const { electionId } = req.params;
    const { memberId, nationalId } = req.query;
    
    const voterHash = hashVoter(memberId, nationalId);
    const hasVoted = await votingActor.hasVoterVoted(voterHash, electionId);
    
    res.json({
      success: true,
      hasVoted,
      voterHash: voterHash.substring(0, 8) + '...' // Partial hash for verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 4. Get Election Results
router.get('/results/:electionId',
  checkBlockchainConnection,
  auditLog('GET_RESULTS'),
  async (req, res) => {
  try {
    const results = await votingActor.getResults();
    
    // Format results for frontend
    const formattedResults = results.map(([candidateId, positionId, count]) => ({
      candidateId,
      positionId,
      voteCount: Number(count)
    }));
    
    res.json({
      success: true,
      results: formattedResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 5. Get All Elections
router.get('/elections',
  checkBlockchainConnection,
  auditLog('GET_ELECTIONS'),
  async (req, res) => {
  try {
    const elections = await votingActor.getAllElections();
    
    res.json({
      success: true,
      elections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 6. Verify Vote
router.get('/verify/:voteId',
  checkBlockchainConnection,
  auditLog('VERIFY_VOTE'),
  async (req, res) => {
  try {
    const { voteId } = req.params;
    const vote = await votingActor.verifyVote(voteId);
    
    if (vote && vote.length > 0) {
      res.json({
        success: true,
        vote: {
          voteId: vote[0].voteId,
          electionId: vote[0].electionId,
          positionId: vote[0].positionId,
          candidateId: vote[0].candidateId,
          timestamp: Number(vote[0].timestamp),
          verified: vote[0].verified
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Vote not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;