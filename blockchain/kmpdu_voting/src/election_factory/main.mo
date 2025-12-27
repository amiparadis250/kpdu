import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Result "mo:base/Result";

persistent actor ElectionFactory {

  type ElectionType = { #NATIONAL; #BRANCH };
  type ElectionStatus = { #DRAFT; #ACTIVE; #COMPLETED; #CANCELLED };
  type FactoryResult = Result.Result<Text, Text>;

  type ElectionInfo = {
    electionId : Text;
    title : Text;
    canisterId : Principal;
    electionType : ElectionType;
    branchId : ?Text;
    startDate : Int;
    endDate : Int;
    status : ElectionStatus;
    createdAt : Int;
    createdBy : Principal;
  };

  type ElectionStats = {
    totalElections : Nat;
    activeElections : Nat;
    completedElections : Nat;
    nationalElections : Nat;
    branchElections : Nat;
  };

  // ✅ Make admins configurable & stable
  stable var admins : [Principal] = [];

  // ✅ Make elections stable
  stable var elections : [ElectionInfo] = [];
  stable var totalElectionsCreated : Nat = 0;

  // ---- ADMIN MANAGEMENT ----
  public shared(msg) func addAdmin(p : Principal) : async Bool {
    if (admins.size() == 0 or isAdmin(msg.caller)) {
      admins := Array.append(admins, [p]);
      true
    } else {
      false
    }
  };

  private func isAdmin(caller : Principal) : Bool {
    Array.find<Principal>(admins, func(a) { Principal.equal(a, caller) }) != null
  };

  // ---- ELECTION CREATION ----
  public shared(msg) func createElection(
    electionId : Text,
    title : Text,
    canisterId : Principal,
    electionType : ElectionType,
    branchId : ?Text,
    startDate : Int,
    endDate : Int
  ) : async FactoryResult {

    if (not isAdmin(msg.caller)) {
      return #err("Unauthorized");
    };

    if (startDate >= endDate) {
      return #err("Invalid date range");
    };

    if (Array.find<ElectionInfo>(elections, func(e) { e.electionId == electionId }) != null) {
      return #err("Election already exists");
    };

    let now = Time.now();

    let info : ElectionInfo = {
      electionId;
      title;
      canisterId;
      electionType;
      branchId;
      startDate;
      endDate;
      status = #DRAFT;
      createdAt = now;
      createdBy = msg.caller;
    };

    elections := Array.append(elections, [info]);
    totalElectionsCreated += 1;

    #ok("Election created")
  };

  // ---- STATUS UPDATE ----
  public shared(msg) func updateElectionStatus(
    electionId : Text,
    newStatus : ElectionStatus
  ) : async FactoryResult {

    if (not isAdmin(msg.caller)) {
      return #err("Unauthorized");
    };

    var found = false;

    elections := Array.map<ElectionInfo, ElectionInfo>(elections, func(e) {
      if (e.electionId == electionId) {
        found := true;
        { e with status = newStatus }
      } else e
    });

    if (not found) {
      return #err("Election not found");
    };

    #ok("Status updated")
  };

  // ---- QUERIES ----
  public query func getElectionInfo(id : Text) : async ?ElectionInfo {
    Array.find<ElectionInfo>(elections, func(e) { e.electionId == id })
  };

  public query func getActiveElections() : async [ElectionInfo] {
    let now = Time.now();
    Array.filter(elections, func(e) {
      e.status == #ACTIVE and now >= e.startDate and now <= e.endDate
    })
  };

  public query func getStats() : async ElectionStats {
    var active = 0;
    var completed = 0;
    var national = 0;
    var branch = 0;

    for (e in elections.vals()) {
      if (e.status == #ACTIVE) active += 1;
      if (e.status == #COMPLETED) completed += 1;
      if (e.electionType == #NATIONAL) national += 1;
      if (e.electionType == #BRANCH) branch += 1;
    };

    {
      totalElections = elections.size();
      activeElections = active;
      completedElections = completed;
      nationalElections = national;
      branchElections = branch;
    }
  };
}
