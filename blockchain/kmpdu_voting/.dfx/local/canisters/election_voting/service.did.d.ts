import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Candidate {
  'bio' : [] | [string],
  'name' : string,
  'photo' : [] | [string],
  'candidateId' : string,
}
export interface ElectionConfig {
  'status' : ElectionStatus,
  'title' : string,
  'endDate' : bigint,
  'description' : [] | [string],
  'electionId' : string,
  'electionType' : ElectionType,
  'branchId' : [] | [string],
  'positions' : Array<Position>,
  'startDate' : bigint,
}
export type ElectionStatus = { 'CANCELLED' : null } |
  { 'COMPLETED' : null } |
  { 'DRAFT' : null } |
  { 'ACTIVE' : null };
export type ElectionType = { 'BRANCH' : null } |
  { 'NATIONAL' : null };
export interface Position {
  'title' : string,
  'maxVotesPerVoter' : bigint,
  'description' : [] | [string],
  'positionId' : string,
  'candidates' : Array<Candidate>,
}
export interface Vote {
  'verified' : boolean,
  'voterHash' : string,
  'voteId' : string,
  'positionId' : string,
  'timestamp' : bigint,
  'candidateId' : string,
}
export type VoteResult = { 'ok' : string } |
  { 'err' : string };
export interface VoterRecord {
  'voterHash' : string,
  'votedPositions' : Array<string>,
  'totalVotes' : bigint,
  'lastVoteTime' : bigint,
}
export interface _SERVICE {
  'castVote' : ActorMethod<[string, string, string, string], VoteResult>,
  'getAllVotes' : ActorMethod<[], Array<Vote>>,
  'getElectionConfig' : ActorMethod<[], [] | [ElectionConfig]>,
  'getElectionStats' : ActorMethod<
    [],
    {
      'status' : ElectionStatus,
      'totalVoters' : bigint,
      'totalVotes' : bigint,
      'positions' : bigint,
      'candidates' : bigint,
    }
  >,
  'getResults' : ActorMethod<[], Array<[string, string, bigint]>>,
  'getVoterRecord' : ActorMethod<[string], [] | [VoterRecord]>,
  'initElection' : ActorMethod<[ElectionConfig], VoteResult>,
  'updateElectionStatus' : ActorMethod<[ElectionStatus], VoteResult>,
  'verifyVote' : ActorMethod<[string], [] | [Vote]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
