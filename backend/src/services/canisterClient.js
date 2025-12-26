const { Actor, HttpAgent } = require('@dfinity/agent');

// Import IDL from declarations - using absolute paths
const { idlFactory: identityIdl } = require('/home/benjamin/programming/kpdu/blockchain/kmpdu_voting/src/declarations/identity_canister/identity_canister.did.js');
const { idlFactory: votingIdl } = require('/home/benjamin/programming/kpdu/blockchain/kmpdu_voting/src/declarations/voting_canister/voting_canister.did.js');
const { idlFactory: resultsIdl } = require('/home/benjamin/programming/kpdu/blockchain/kmpdu_voting/src/declarations/results_canister/results_canister.did.js');

// Canister IDs from your deployment
const CANISTER_IDS = {
  identity: 'uxrrr-q7777-77774-qaaaq-cai',
  voting: 'uzt4z-lp777-77774-qaabq-cai',
  results: 'u6s2n-gx777-77774-qaaba-cai'
};

const IC_HOST = 'http://127.0.0.1:4943';

class CanisterClient {
  constructor() {
    this.agent = null;
    this.actors = {};
  }

  async init() {
    try {
      this.agent = new HttpAgent({ host: IC_HOST });
      await this.agent.fetchRootKey(); // For local development

      this.actors.identity = Actor.createActor(identityIdl, {
        agent: this.agent,
        canisterId: CANISTER_IDS.identity,
      });

      this.actors.voting = Actor.createActor(votingIdl, {
        agent: this.agent,
        canisterId: CANISTER_IDS.voting,
      });

      this.actors.results = Actor.createActor(resultsIdl, {
        agent: this.agent,
        canisterId: CANISTER_IDS.results,
      });

      console.log('✅ Canister client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize canister client:', error);
      throw error;
    }
  }

  getActor(canister) {
    if (!this.actors[canister]) {
      throw new Error(`Actor ${canister} not initialized`);
    }
    return this.actors[canister];
  }
}

module.exports = new CanisterClient();