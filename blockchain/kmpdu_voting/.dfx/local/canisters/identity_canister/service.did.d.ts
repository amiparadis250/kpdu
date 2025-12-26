import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Voter {
  'memberId' : string,
  'hasVotedBranch' : boolean,
  'hasVotedNational' : boolean,
  'branchId' : string,
}
export interface _SERVICE {
  'markVoted' : ActorMethod<[string, string], boolean>,
  'registerVoter' : ActorMethod<[string, string], boolean>,
  'verifyVoter' : ActorMethod<[string], [] | [Voter]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
