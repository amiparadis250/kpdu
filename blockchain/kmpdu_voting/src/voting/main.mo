import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

persistent actor Voting {

  type Vote = {
    positionId : Text;
    candidateId : Text;
    level : Text;
    timestamp : Int;
  };

  transient let votes = HashMap.HashMap<Text, Vote>(50000, Text.equal, Text.hash);

  public func castVote(
    hashedVoter : Text,
    positionId : Text,
    candidateId : Text,
    level : Text
  ) : async Bool {

    let voteKey = hashedVoter # "_" # positionId;

    if (votes.get(voteKey) != null) return false;

    votes.put(voteKey, {
      positionId = positionId;
      candidateId = candidateId;
      level = level;
      timestamp = Time.now();
    });

    return true;
  };

  public query func getVotes(positionId: Text) : async [Vote] {
    let filtered = Array.filter<Vote>(Iter.toArray(votes.vals()), func(v) { v.positionId == positionId });
    filtered
  };
}
