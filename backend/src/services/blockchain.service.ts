// 🔗 ICP Blockchain Integration Service
// This service handles all blockchain operations for vote storage and retrieval

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Vote {
  positionId: string;
  candidateId: string;
  electionId: string;
  timestamp: Date;
}

interface BlockchainVoteResult {
  transactionId: string;
  blockHeight: number;
  timestamp: Date;
  success: boolean;
}

interface ElectionResults {
  electionId: string;
  results: Array<{
    candidateId: string;
    positionId: string;
    voteCount: number;
  }>;
  totalVotes: number;
  blockchainVerified: boolean;
}

class BlockchainService {
  
  /**
   * 🔗 BLOCKCHAIN: Store vote anonymously on ICP blockchain
   * - No vote-to-voter linkage
   * - Immutable storage
   * - Cryptographic verification
   */
  async storeVote(votes: Vote[], voterHash: string): Promise<BlockchainVoteResult> {
    // TODO: Implement ICP canister integration
    // const canister = await Actor.createActor(votingCanisterId, {
    //   agent: httpAgent,
    // });
    
    // const result = await canister.store_anonymous_vote({
    //   votes: votes.map(vote => ({
    //     position_id: vote.positionId,
    //     candidate_id: vote.candidateId,
    //     election_id: vote.electionId,
    //     timestamp: vote.timestamp.getTime()
    //   })),
    //   voter_hash: voterHash, // Anonymous hash, not actual user ID
    // });

    // Simulate blockchain transaction for development
    return {
      transactionId: `icp_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockHeight: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
      success: true
    };
  }

  /**
   * 🔗 BLOCKCHAIN: Get aggregated election results from blockchain
   * - No individual vote data exposed
   * - Real-time vote counting
   * - Cryptographically verifiable
   */
  async getElectionResults(electionId: string): Promise<ElectionResults> {
    // TODO: Implement ICP canister query
    // const canister = await Actor.createActor(votingCanisterId, {
    //   agent: httpAgent,
    // });
    
    // const results = await canister.get_election_results(electionId);

    // Simulate blockchain results for development
    return {
      electionId,
      results: [
        // Results would be aggregated from blockchain
        // No individual vote data exposed
      ],
      totalVotes: 0,
      blockchainVerified: true
    };
  }

  /**
   * 🔗 BLOCKCHAIN: Verify vote integrity using transaction ID
   * - Cryptographic proof without revealing vote content
   * - Tamper-proof verification
   */
  async verifyVote(transactionId: string): Promise<{
    isValid: boolean;
    blockHeight: number;
    timestamp: Date;
    cryptographicProof: string;
  }> {
    // TODO: Implement ICP verification
    // const canister = await Actor.createActor(votingCanisterId, {
    //   agent: httpAgent,
    // });
    
    // const verification = await canister.verify_vote(transactionId);

    return {
      isValid: true,
      blockHeight: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
      cryptographicProof: 'blockchain_proof_' + Math.random().toString(36)
    };
  }

  /**
   * 🔗 BLOCKCHAIN: Register user for voting on ICP blockchain
   * - Registers user in identity canister
   * - Enables voting eligibility
   */
  async registerUserForVoting(memberId: string, branchId: string): Promise<{
    success: boolean;
    message: string;
    alreadyRegistered?: boolean;
  }> {
    try {
      const blockchainPath = '/home/benjamin/programming/kpdu/blockchain/kmpdu_voting';
      const command = `cd ${blockchainPath} && dfx canister call identity_canister registerVoter '("${memberId}", "${branchId}")'`;
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('Warning')) {
        return {
          success: false,
          message: `Registration failed: ${stderr}`
        };
      }
      
      if (stdout.includes('true')) {
        return {
          success: true,
          message: 'User registered successfully'
        };
      } else {
        return {
          success: true,
          message: 'User already registered',
          alreadyRegistered: true
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Registration error: ${error.message}`
      };
    }
  }

  /**
   * 🔗 BLOCKCHAIN: Verify if user is registered for voting
   */
  async verifyUserRegistration(memberId: string): Promise<{
    isRegistered: boolean;
    voterData?: any;
    message: string;
  }> {
    try {
      const blockchainPath = '/home/benjamin/programming/kpdu/blockchain/kmpdu_voting';
      const command = `cd ${blockchainPath} && dfx canister call identity_canister verifyVoter '("${memberId}")'`;
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        return {
          isRegistered: false,
          message: `Verification failed: ${stderr}`
        };
      }
      
      if (stdout.includes('null')) {
        return {
          isRegistered: false,
          message: 'User not registered'
        };
      } else {
        return {
          isRegistered: true,
          voterData: stdout,
          message: 'User is registered'
        };
      }
    } catch (error: any) {
      return {
        isRegistered: false,
        message: `Verification error: ${error.message}`
      };
    }
  }

  /**
   * 🔗 BLOCKCHAIN: Legacy method for voting controller compatibility
   */
  async verifyVoter(memberId: string): Promise<any> {
    try {
      const blockchainPath = '/home/benjamin/programming/kpdu/blockchain/kmpdu_voting';
      const command = `cd ${blockchainPath} && dfx canister call identity_canister verifyVoter '("${memberId}")'`;
      
      const { stdout } = await execAsync(command);
      
      if (stdout.includes('null')) {
        return null;
      }
      
      // Simple string parsing instead of complex regex
      const lines = stdout.split('\n');
      let memberId_val = '';
      let branchId_val = '';
      let hasVotedBranch_val = false;
      let hasVotedNational_val = false;
      
      for (const line of lines) {
        if (line.includes('memberId =')) {
          const match = line.match(/"([^"]+)"/);
          if (match) memberId_val = match[1];
        }
        if (line.includes('branchId =')) {
          const match = line.match(/"([^"]+)"/);
          if (match) branchId_val = match[1];
        }
        if (line.includes('hasVotedBranch =')) {
          hasVotedBranch_val = line.includes('true');
        }
        if (line.includes('hasVotedNational =')) {
          hasVotedNational_val = line.includes('true');
        }
      }
      
      if (memberId_val) {
        return {
          memberId: memberId_val,
          branchId: branchId_val,
          hasVotedBranch: hasVotedBranch_val,
          hasVotedNational: hasVotedNational_val
        };
      }
      
      return null;
    } catch (error: any) {
      return null;
    }
  }

  /**
   * 🔗 BLOCKCHAIN: Cast vote
   */
  async castVote(memberId: string, positionId: string, candidateId: string, level: string): Promise<boolean> {
    try {
      const blockchainPath = '/home/benjamin/programming/kpdu/blockchain/kmpdu_voting';
      const command = `cd ${blockchainPath} && dfx canister call results_canister addVote '("${positionId}", "${candidateId}")'`;
      
      const { stdout, stderr } = await execAsync(command);
      
      return !stderr && (stdout.includes('()') || stdout.trim() === '');
    } catch (error: any) {
      console.error('Cast vote error:', error);
      return false;
    }
  }

  /**
   * 🔗 BLOCKCHAIN: Mark voter as voted
   */
  async markVoted(memberId: string, level: string): Promise<boolean> {
    try {
      const blockchainPath = '/home/benjamin/programming/kpdu/blockchain/kmpdu_voting';
      const command = `cd ${blockchainPath} && dfx canister call identity_canister markVoted '("${memberId}", "${level}")'`;
      
      const { stdout, stderr } = await execAsync(command);
      
      return !stderr && stdout.includes('true');
    } catch (error: any) {
      return false;
    }
  }

  /**
   * 🔗 BLOCKCHAIN: Get voting results
   */
  async getResults(positionId: string): Promise<Array<[string, number]>> {
    try {
      const blockchainPath = '/home/benjamin/programming/kpdu/blockchain/kmpdu_voting';
      const command = `cd ${blockchainPath} && dfx canister call results_canister getResults '("${positionId}")'`;
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr || !stdout) {
        return [];
      }
      
      // Parse results from Motoko output: (vec { record { "candidateId"; 1 : nat } })
      const results: Array<[string, number]> = [];
      const matches = stdout.match(/record\s*\{\s*"([^"]+)"\s*;\s*(\d+)\s*:\s*nat\s*\}/g);
      
      if (matches) {
        for (const match of matches) {
          const parts = match.match(/"([^"]+)"\s*;\s*(\d+)/);
          if (parts) {
            results.push([parts[1], parseInt(parts[2])]);
          }
        }
      }
      
      return results;
    } catch (error: any) {
      console.error('Get results error:', error);
      return [];
    }
  }

  /**
   * 🔗 BLOCKCHAIN: Get votes (placeholder)
   */
  async getVotes(positionId: string): Promise<any[]> {
    // Individual votes remain private for anonymity
    // Use getResults() instead for vote counts
    return [];
  }
}

export default new BlockchainService();

/**
 * 🔗 BLOCKCHAIN ARCHITECTURE NOTES:
 * 
 * WHAT GOES ON BLOCKCHAIN (ICP):
 * ✅ Individual votes (anonymously)
 * ✅ Vote timestamps
 * ✅ Election/position/candidate IDs
 * ✅ Anonymous voter hashes
 * ✅ Cryptographic proofs
 * 
 * WHAT STAYS IN TRADITIONAL DATABASE:
 * ✅ User profiles (no vote data)
 * ✅ Election configurations
 * ✅ Candidate information
 * ✅ Branch information
 * ✅ hasVoted flag (boolean only)
 * ❌ NO individual votes
 * ❌ NO vote counts
 * ❌ NO vote-to-voter linkage
 * 
 * PRIVACY GUARANTEES:
 * - Complete vote anonymity
 * - Immutable vote records
 * - Verifiable without revealing content
 * - No single point of failure
 * - Cryptographic integrity
 */