export const idlFactory = ({ IDL }) => {
  const ElectionType = IDL.Variant({
    'BRANCH' : IDL.Null,
    'NATIONAL' : IDL.Null,
  });
  const FactoryResult = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const ElectionStatus = IDL.Variant({
    'CANCELLED' : IDL.Null,
    'COMPLETED' : IDL.Null,
    'DRAFT' : IDL.Null,
    'ACTIVE' : IDL.Null,
  });
  const ElectionInfo = IDL.Record({
    'status' : ElectionStatus,
    'title' : IDL.Text,
    'endDate' : IDL.Int,
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'electionId' : IDL.Text,
    'electionType' : ElectionType,
    'branchId' : IDL.Opt(IDL.Text),
    'canisterId' : IDL.Principal,
    'startDate' : IDL.Int,
  });
  const ElectionStats = IDL.Record({
    'totalElections' : IDL.Nat,
    'completedElections' : IDL.Nat,
    'branchElections' : IDL.Nat,
    'nationalElections' : IDL.Nat,
    'activeElections' : IDL.Nat,
  });
  return IDL.Service({
    'addAdmin' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'createElection' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Principal,
          ElectionType,
          IDL.Opt(IDL.Text),
          IDL.Int,
          IDL.Int,
        ],
        [FactoryResult],
        [],
      ),
    'getActiveElections' : IDL.Func([], [IDL.Vec(ElectionInfo)], ['query']),
    'getElectionInfo' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(ElectionInfo)],
        ['query'],
      ),
    'getStats' : IDL.Func([], [ElectionStats], ['query']),
    'updateElectionStatus' : IDL.Func(
        [IDL.Text, ElectionStatus],
        [FactoryResult],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
