import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

persistent actor Identity {

  type Voter = {
    memberId : Text;
    branchId : Text;
    hasVotedNational : Bool;
    hasVotedBranch : Bool;
  };

  transient let voters =
    HashMap.HashMap<Text, Voter>(20000, Text.equal, Text.hash);

  public shared func registerVoter(
    memberId : Text,
    branchId : Text
  ) : async Bool {
    if (voters.get(memberId) != null) {
      return false;
    };

    voters.put(memberId, {
      memberId = memberId;
      branchId = branchId;
      hasVotedNational = false;
      hasVotedBranch = false;
    });

    return true;
  };

  public query func verifyVoter(memberId : Text) : async ?Voter {
    voters.get(memberId)
  };

  public shared func markVoted(
    memberId : Text,
    level : Text
  ) : async Bool {
    switch (voters.get(memberId)) {
      case null { return false };
      case (?voter) {
        let updated =
          if (level == "national") {
            {
              memberId = voter.memberId;
              branchId = voter.branchId;
              hasVotedNational = true;
              hasVotedBranch = voter.hasVotedBranch;
            }
          } else {
            {
              memberId = voter.memberId;
              branchId = voter.branchId;
              hasVotedNational = voter.hasVotedNational;
              hasVotedBranch = true;
            }
          };

        voters.put(memberId, updated);
        return true;
      };
    };
  };
}
