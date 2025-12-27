export const idlFactory = ({ IDL }) => {
  const Voter = IDL.Record({
    'memberId' : IDL.Text,
    'hasVotedBranch' : IDL.Bool,
    'hasVotedNational' : IDL.Bool,
    'branchId' : IDL.Text,
  });
  return IDL.Service({
    'markVoted' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'registerVoter' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'verifyVoter' : IDL.Func([IDL.Text], [IDL.Opt(Voter)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
