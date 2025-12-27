import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ElectionInfo {
  'status' : ElectionStatus,
  'title' : string,
  'endDate' : bigint,
  'createdAt' : bigint,
  'createdBy' : Principal,
  'electionId' : string,
  'electionType' : ElectionType,
  'branchId' : [] | [string],
  'canisterId' : Principal,
  'startDate' : bigint,
}
export interface ElectionStats {
  'totalElections' : bigint,
  'completedElections' : bigint,
  'branchElections' : bigint,
  'nationalElections' : bigint,
  'activeElections' : bigint,
}
export type ElectionStatus = { 'CANCELLED' : null } |
  { 'COMPLETED' : null } |
  { 'DRAFT' : null } |
  { 'ACTIVE' : null };
export type ElectionType = { 'BRANCH' : null } |
  { 'NATIONAL' : null };
export type FactoryResult = { 'ok' : string } |
  { 'err' : string };
export interface _SERVICE {
  'addAdmin' : ActorMethod<[Principal], boolean>,
  'createElection' : ActorMethod<
    [string, string, Principal, ElectionType, [] | [string], bigint, bigint],
    FactoryResult
  >,
  'getActiveElections' : ActorMethod<[], Array<ElectionInfo>>,
  'getElectionInfo' : ActorMethod<[string], [] | [ElectionInfo]>,
  'getStats' : ActorMethod<[], ElectionStats>,
  'updateElectionStatus' : ActorMethod<[string, ElectionStatus], FactoryResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
