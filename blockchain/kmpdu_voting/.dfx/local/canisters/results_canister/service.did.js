export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addVote' : IDL.Func([IDL.Text, IDL.Text], [], ['oneway']),
    'getResults' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
