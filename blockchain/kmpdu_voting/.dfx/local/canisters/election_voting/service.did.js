export const idlFactory = ({ IDL }) => {
  const VoteResult = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Vote = IDL.Record({
    'verified' : IDL.Bool,
    'voterHash' : IDL.Text,
    'voteId' : IDL.Text,
    'positionId' : IDL.Text,
    'timestamp' : IDL.Int,
    'candidateId' : IDL.Text,
  });
  const ElectionStatus = IDL.Variant({
    'CANCELLED' : IDL.Null,
    'COMPLETED' : IDL.Null,
    'DRAFT' : IDL.Null,
    'ACTIVE' : IDL.Null,
  });
  const ElectionType = IDL.Variant({
    'BRANCH' : IDL.Null,
    'NATIONAL' : IDL.Null,
  });
  const Candidate = IDL.Record({
    'bio' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'photo' : IDL.Opt(IDL.Text),
    'candidateId' : IDL.Text,
  });
  const Position = IDL.Record({
    'title' : IDL.Text,
    'maxVotesPerVoter' : IDL.Nat,
    'description' : IDL.Opt(IDL.Text),
    'positionId' : IDL.Text,
    'candidates' : IDL.Vec(Candidate),
  });
  const ElectionConfig = IDL.Record({
    'status' : ElectionStatus,
    'title' : IDL.Text,
    'endDate' : IDL.Int,
    'description' : IDL.Opt(IDL.Text),
    'electionId' : IDL.Text,
    'electionType' : ElectionType,
    'branchId' : IDL.Opt(IDL.Text),
    'positions' : IDL.Vec(Position),
    'startDate' : IDL.Int,
  });
  const VoterRecord = IDL.Record({
    'voterHash' : IDL.Text,
    'votedPositions' : IDL.Vec(IDL.Text),
    'totalVotes' : IDL.Nat,
    'lastVoteTime' : IDL.Int,
  });
  return IDL.Service({
    'castVote' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [VoteResult],
        [],
      ),
    'getAllVotes' : IDL.Func([], [IDL.Vec(Vote)], ['query']),
    'getElectionConfig' : IDL.Func([], [IDL.Opt(ElectionConfig)], ['query']),
    'getElectionStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'status' : ElectionStatus,
            'totalVoters' : IDL.Nat,
            'totalVotes' : IDL.Nat,
            'positions' : IDL.Nat,
            'candidates' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getResults' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'getVoterRecord' : IDL.Func([IDL.Text], [IDL.Opt(VoterRecord)], ['query']),
    'initElection' : IDL.Func([ElectionConfig], [VoteResult], []),
    'updateElectionStatus' : IDL.Func([ElectionStatus], [VoteResult], []),
    'verifyVote' : IDL.Func([IDL.Text], [IDL.Opt(Vote)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
