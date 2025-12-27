import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";

persistent actor Results {

  transient let results = HashMap.HashMap<Text, HashMap.HashMap<Text, Nat>>(
    14000, Text.equal, Text.hash
  );

  public func addVote(positionId: Text, candidateId: Text) {
    let pos = switch (results.get(positionId)) {
      case null {
        let m = HashMap.HashMap<Text, Nat>(10, Text.equal, Text.hash);
        results.put(positionId, m);
        m;
      };
      case (?m) m;
    };

    let count = switch (pos.get(candidateId)) {
      case null 0;
      case (?c) c;
    };

    pos.put(candidateId, count + 1);
  };

  public query func getResults(positionId: Text) : async [(Text, Nat)] {
    switch (results.get(positionId)) {
      case null [];
      case (?m) Iter.toArray(m.entries());
    }
  };
}
