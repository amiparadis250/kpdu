import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Int "mo:base/Int";

persistent actor ElectionVoting {

  type ElectionType = { #NATIONAL; #BRANCH };
  type ElectionStatus = { #DRAFT; #ACTIVE; #COMPLETED; #CANCELLED };
  type VoteResult = Result.Result<Text, Text>;

  type ElectionConfig = {
    electionId : Text;
    title : Text;
    description : ?Text;
    electionType : ElectionType;
    branchId : ?Text;
    startDate : Int;
    endDate : Int;
    status : ElectionStatus;
    positions : [Position];
  };

  type Position = {
    positionId : Text;
    title : Text;
    description : ?Text;
    maxVotesPerVoter : Nat;
    candidates : [Candidate];
  };

  type Candidate = {
    candidateId : Text;
    name : Text;
    bio : ?Text;
    photo : ?Text;
  };

  type Vote = {
    voteId : Text;
    voterHash : Text;
    positionId : Text;
    candidateId : Text;
    timestamp : Int;
    verified : Bool;
  };

  type VoterRecord = {
    voterHash : Text;
    votedPositions : [Text];
    totalVotes : Nat;
    lastVoteTime : Int;
  };

  type VoteCount = {
    candidateId : Text;
    positionId : Text;
    count : Nat;
  };

  // State variables - using arrays for stability
  var config : ?ElectionConfig = null;
  var votes : [Vote] = [];
  var voterRecords : [VoterRecord] = [];
  var voteCounts : [VoteCount] = [];
  var totalVoters : Nat = 0;
  var totalVotesCast : Nat = 0;

  // Initialize election with complete configuration
  public shared func initElection(cfg : ElectionConfig) : async VoteResult {
    switch (config) {
      case (?_) { #err("Election already initialized") };
      case null {
        config := ?cfg;
        #ok("Election initialized successfully")
      };
    };
  };

  // Smart voting with comprehensive validation
  public shared func castVote(
    voterHash : Text,
    positionId : Text,
    candidateId : Text,
    userBranch : Text
  ) : async VoteResult {

    // Validate election exists and is active
    let cfg = switch (config) {
      case null { return #err("Election not initialized") };
      case (?c) {
        if (c.status != #ACTIVE) {
          return #err("Election is not active");
        };
        c
      };
    };

    // Check election timing
    let now = Time.now();
    if (now < cfg.startDate) {
      return #err("Election has not started yet");
    };
    if (now > cfg.endDate) {
      return #err("Election has ended");
    };

    // Validate branch eligibility
    switch (cfg.electionType) {
      case (#BRANCH) {
        switch (cfg.branchId) {
          case (?branchId) {
            if (branchId != userBranch) {
              return #err("Not eligible to vote in this branch election");
            };
          };
          case null { return #err("Branch ID not set for branch election") };
        };
      };
      case (#NATIONAL) { /* All branches can vote */ };
    };

    // Validate position exists
    let position = switch (findPosition(cfg.positions, positionId)) {
      case null { return #err("Position not found") };
      case (?p) p;
    };

    // Validate candidate exists
    if (not candidateExists(position.candidates, candidateId)) {
      return #err("Candidate not found in this position");
    };

    // ONE-PERSON-ONE-VOTE enforcement
    switch (findVoterRecord(voterHash)) {
      case (?record) {
        // Check if already voted for this position
        for (votedPos in record.votedPositions.vals()) {
          if (votedPos == positionId) {
            return #err("Already voted for this position");
          };
        };
        
        // Check vote limit per position
        if (record.totalVotes >= position.maxVotesPerVoter) {
          return #err("Maximum votes reached for this position");
        };
      };
      case null { /* First time voter */ };
    };

    // Cast the vote
    let voteId = generateVoteId(voterHash, positionId, now);
    let newVote : Vote = {
      voteId = voteId;
      voterHash = voterHash;
      positionId = positionId;
      candidateId = candidateId;
      timestamp = now;
      verified = true;
    };

    // Update vote records
    votes := Array.append(votes, [newVote]);
    updateVoterRecord(voterHash, positionId, now);
    updateVoteCount(candidateId, positionId);
    totalVotesCast += 1;

    #ok("Vote cast successfully: " # voteId)
  };

  // Get real-time results with vote counts
  public query func getResults() : async [(Text, Text, Nat)] {
    let results = Array.init<(Text, Text, Nat)>(voteCounts.size(), ("", "", 0));
    var i = 0;
    
    for (voteCount in voteCounts.vals()) {
      results[i] := (voteCount.candidateId, voteCount.positionId, voteCount.count);
      i += 1;
    };
    
    Array.freeze(results)
  };

  // Get election statistics
  public query func getElectionStats() : async {
    totalVoters : Nat;
    totalVotes : Nat;
    positions : Nat;
    candidates : Nat;
    status : ElectionStatus;
  } {
    let cfg = switch (config) {
      case null {
        {
          totalVoters = 0;
          totalVotes = 0;
          positions = 0;
          candidates = 0;
          status = #DRAFT;
        }
      };
      case (?c) {
        let totalCandidates = Array.foldLeft<Position, Nat>(
          c.positions, 0, func(acc, pos) = acc + pos.candidates.size()
        );
        {
          totalVoters = voterRecords.size();
          totalVotes = totalVotesCast;
          positions = c.positions.size();
          candidates = totalCandidates;
          status = c.status;
        }
      };
    };
  };

  // Verify vote integrity
  public query func verifyVote(voteId : Text) : async ?Vote {
    for (vote in votes.vals()) {
      if (vote.voteId == voteId) {
        return ?vote;
      };
    };
    null
  };

  // Admin functions
  public shared func updateElectionStatus(newStatus : ElectionStatus) : async VoteResult {
    switch (config) {
      case null { #err("Election not initialized") };
      case (?cfg) {
        let updatedConfig = {
          cfg with status = newStatus
        };
        config := ?updatedConfig;
        #ok("Election status updated")
      };
    };
  };

  // Helper functions
  private func findPosition(positions : [Position], positionId : Text) : ?Position {
    for (pos in positions.vals()) {
      if (pos.positionId == positionId) {
        return ?pos;
      };
    };
    null
  };

  private func candidateExists(candidates : [Candidate], candidateId : Text) : Bool {
    for (candidate in candidates.vals()) {
      if (candidate.candidateId == candidateId) {
        return true;
      };
    };
    false
  };

  private func findVoterRecord(voterHash : Text) : ?VoterRecord {
    for (record in voterRecords.vals()) {
      if (record.voterHash == voterHash) {
        return ?record;
      };
    };
    null
  };

  private func generateVoteId(voterHash : Text, positionId : Text, timestamp : Int) : Text {
    voterHash # "-" # positionId # "-" # Int.toText(timestamp)
  };

  private func updateVoterRecord(voterHash : Text, positionId : Text, timestamp : Int) {
    switch (findVoterRecord(voterHash)) {
      case (?record) {
        let updatedRecord = {
          voterHash = record.voterHash;
          votedPositions = Array.append(record.votedPositions, [positionId]);
          totalVotes = record.totalVotes + 1;
          lastVoteTime = timestamp;
        };
        voterRecords := Array.filter<VoterRecord>(voterRecords, func(r) = r.voterHash != voterHash);
        voterRecords := Array.append(voterRecords, [updatedRecord]);
      };
      case null {
        let newRecord = {
          voterHash = voterHash;
          votedPositions = [positionId];
          totalVotes = 1;
          lastVoteTime = timestamp;
        };
        voterRecords := Array.append(voterRecords, [newRecord]);
        totalVoters += 1;
      };
    };
  };

  private func updateVoteCount(candidateId : Text, positionId : Text) {
    var found = false;
    let updatedCounts = Array.map<VoteCount, VoteCount>(voteCounts, func(vc) {
      if (vc.candidateId == candidateId and vc.positionId == positionId) {
        found := true;
        { vc with count = vc.count + 1 }
      } else {
        vc
      }
    });
    
    if (found) {
      voteCounts := updatedCounts;
    } else {
      let newCount = {
        candidateId = candidateId;
        positionId = positionId;
        count = 1;
      };
      voteCounts := Array.append(voteCounts, [newCount]);
    };
  };

  // Query functions
  public query func getElectionConfig() : async ?ElectionConfig {
    config
  };

  public query func getVoterRecord(voterHash : Text) : async ?VoterRecord {
    findVoterRecord(voterHash)
  };

  public query func getAllVotes() : async [Vote] {
    votes
  };
}
