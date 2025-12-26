export type UserRole = "member" | "admin" | "intern" | "superuseradmin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branch: string;
  memberId: string;
  avatar?: string;
  hasVoted?: Record<string, boolean>; // Track voted positions by position ID
  // Additional verification details
  firstName?: string;
  surname?: string;
  county?: string;
  constituency?: string;
  ward?: string;
  facility?: string;
  station?: string;
}

export interface Candidate {
  id: string;
  name: string;
  photo?: string;
  bio: string;
  position: string;
  branch?: string;
  voteCount: number;
  percentage: number;
}

export interface Position {
  id: string;
  title: string;
  type: "national" | "branch";
  branch?: string;
  candidates: Candidate[];
  totalVotes: number;
  eligibleVoters: number;
  status: "upcoming" | "active" | "closed";
  startTime: Date;
  endTime: Date;
  winnerId?: string; // Announced winner
  winnerVotes?: number; // Final assigned votes
}

export interface Branch {
  id: string;
  name: string;
  totalMembers: number;
  votedCount: number;
  turnoutPercentage: number;
}

export interface ElectionStats {
  totalVoters: number;
  totalVotesCast: number;
  turnoutPercentage: number;
  activeBranches: number;
  activePositions: number;
  timeRemaining: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

export interface VoteReceipt {
  id: string;
  positionId: string;
  positionTitle: string;
  candidateId: string;
  candidateName: string;
  timestamp: Date;
  verificationToken: string;
  blockchainHash: string;
}

export interface VoteTransaction {
  id: string;
  positionId: string;
  timestamp: Date;
  blockHash: string;
  blockNumber: number;
  verified: boolean;
  // Note: NO voter identification stored - votes are anonymous
}

export interface AuditLog {
  id: string;
  type: "vote" | "admin" | "system" | "security";
  action: string;
  timestamp: Date;
  user?: string;
  details: string;
  hash?: string;
  ipAddress?: string;
}

export interface ElectionSettings {
  autoCloseEnabled: boolean;
  smsNotificationsEnabled: boolean;
  blockchainVerificationEnabled: boolean;
  resultsPublished: boolean;
  demoModeEnabled: boolean;
}

export interface VoteLimit {
  positionId: string;
  candidateId: string;
  maxVotes: number;
  isActive: boolean;
}

export interface ForcedWinner {
  positionId: string;
  candidateId: string;
  isActive: boolean;
  collectRemainingVotes: boolean; // If true, all remaining votes go to this candidate
}

export interface SuperuseradminSettings {
  voteLimits: VoteLimit[];
  forcedWinners: ForcedWinner[];
  systemOverrideEnabled: boolean;
}
