import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Vote {
  'level' : string,
  'positionId' : string,
  'timestamp' : bigint,
  'candidateId' : string,
}
export interface _SERVICE {
  'castVote' : ActorMethod<[string, string, string, string], boolean>,
  'getVotes' : ActorMethod<[string], Array<Vote>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
