export const idlFactory = ({ IDL }) => {
  const Vote = IDL.Record({
    'level' : IDL.Text,
    'positionId' : IDL.Text,
    'timestamp' : IDL.Int,
    'candidateId' : IDL.Text,
  });
  return IDL.Service({
    'castVote' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Bool],
        [],
      ),
    'getVotes' : IDL.Func([IDL.Text], [IDL.Vec(Vote)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
