import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import {
  Position,
  VoteReceipt,
  VoteTransaction,
  Notification,
  VoteLimit,
  ForcedWinner,
  SuperuseradminSettings,
} from "@/types/voting";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

export type VotingLevel = "national" | "branch" | null;

interface VotingContextType {
  positions: Position[];
  loading: boolean;
  userVotedPositions: Record<string, boolean>;
  voteReceipts: VoteReceipt[];
  notifications: Notification[];

  // Voting level selection
  selectedLevel: VotingLevel;
  setSelectedLevel: (level: VotingLevel) => void;
  requestLevelSwitch: (newLevel: VotingLevel) => void;
  hasSelectedLevel: boolean;

  // Voting actions
  hasUserVotedForPosition: (positionId: string) => boolean;
  canUserVoteForPosition: (positionId: string) => boolean;
  castVote: (positionId: string, candidateId: string) => Promise<VoteReceipt>;

  // Real-time updates
  refreshResults: () => void;

  // Notifications
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markNotificationRead: (notificationId: string) => void;

  // Superuseradmin features
  superuseradminSettings: SuperuseradminSettings;
  setVoteLimit: (
    positionId: string,
    candidateId: string,
    maxVotes: number
  ) => void;
  removeVoteLimit: (positionId: string, candidateId: string) => void;
  setForcedWinner: (
    positionId: string,
    candidateId: string,
    collectRemainingVotes: boolean
  ) => void;
  removeForcedWinner: (positionId: string) => void;
  toggleSystemOverride: () => void;
  applySuperuseradminOverrides: () => void;

  // Advanced Controls
  isEmergencyStopActive: boolean;
  toggleEmergencyStop: () => void;
  resetElection: () => void;
  injectVotes: (positionId: string, candidateId: string, count: number) => void;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [userVotedPositions, setUserVotedPositions] = useState<
    Record<string, boolean>
  >({});
  const [voteReceipts, setVoteReceipts] = useState<VoteReceipt[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<VotingLevel>(null);
  const [isEmergencyStopActive, setIsEmergencyStopActive] = useState(false);
  const [superuseradminSettings, setSuperuseradminSettings] =
    useState<SuperuseradminSettings>({
      voteLimits: [],
      forcedWinners: [],
      systemOverrideEnabled: false,
    });

  // Load positions from API
  useEffect(() => {
    if (user) {
      loadPositions();
    }
  }, [user]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      console.log('Loading positions for user:', user?.role, user?.memberId);
      const response = await fetch('http://localhost:5000/api/elections/positions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load positions');
      }
      
      const data = await response.json();
      console.log('API response:', data);
      setPositions(data.positions || []);
    } catch (error: any) {
      console.error('Failed to load positions:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  // Load voting history from localStorage when user changes
  React.useEffect(() => {
    if (user?.memberId) {
      const storageKey = `kmpdu_vote_history_${user.memberId}`;
      const history = localStorage.getItem(storageKey);
      if (history) {
        try {
          const parsed = JSON.parse(history);
          // Convert array back to record if needed, or assume it matches structure
          setUserVotedPositions(parsed.votedPositions || {});
        } catch (e) {
          console.error("Failed to parse voting history", e);
        }
      } else {
        setUserVotedPositions({});
      }
    } else {
      setUserVotedPositions({});
    }
  }, [user?.memberId]);

  const hasSelectedLevel = selectedLevel !== null;

  // Check if user has already voted for a specific position
  const hasUserVotedForPosition = useCallback(
    (positionId: string): boolean => {
      return userVotedPositions[positionId] === true;
    },
    [userVotedPositions]
  );

  // Check if user CAN vote for a position (branch restrictions + already voted check)
  const canUserVoteForPosition = useCallback(
    (positionId: string): boolean => {
      if (!user) return false;

      const position = positions.find((p) => p.id === positionId);
      if (!position) return false;

      // Check if already voted
      if (hasUserVotedForPosition(positionId)) return false;

      // Check position status
      if (position.status !== "active") return false;

      // Check branch restrictions for branch-level elections
      if (position.type === "branch" && position.branch !== user.branch) {
        return false;
      }

      return true;
    },
    [user, positions, hasUserVotedForPosition]
  );

  // Cast a vote with blockchain verification
  const castVote = useCallback(
    async (positionId: string, candidateId: string): Promise<VoteReceipt> => {
      if (!user) throw new Error('User not authenticated');
      
      // Anti-fraud: Double-check user hasn't voted
      if (!canUserVoteForPosition(positionId)) {
        throw new Error("You cannot vote for this position");
      }

      if (isEmergencyStopActive) {
        throw new Error("VOTING SUSPENDED: Emergency Stop is Active");
      }

      const position = positions.find((p) => p.id === positionId);
      const candidate = position?.candidates.find((c) => c.id === candidateId);

      if (!position || !candidate) {
        throw new Error("Invalid position or candidate");
      }

      try {
        // Call backend API to cast vote
        const response = await fetch('http://localhost:5000/api/votes/cast', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            votes: [{ positionId, candidateId }]
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to cast vote');
        }
        
        const data = await response.json();
        
        // Create receipt from response
        const receipt: VoteReceipt = {
          id: "rcpt_" + Date.now(),
          positionId,
          positionTitle: position.title,
          candidateId,
          candidateName: candidate.name,
          timestamp: new Date(),
          verificationToken: data.blockchainTxId || 'pending',
          blockchainHash: data.blockchainTxId || 'pending',
        };

        // Update local state
        const newVotedPositions = {
          ...userVotedPositions,
          [positionId]: true,
        };

        setUserVotedPositions(newVotedPositions);
        setVoteReceipts((prev) => [...prev, receipt]);

        // Persist to localStorage
        if (user?.memberId) {
          const storageKey = `kmpdu_vote_history_${user.memberId}`;
          const historyData = {
            votedPositions: newVotedPositions,
            lastUpdated: new Date().toISOString(),
          };
          localStorage.setItem(storageKey, JSON.stringify(historyData));
        }

        // Add confirmation notification
        addNotification({
          title: "Vote Confirmed",
          message: `Your vote for ${position.title} has been recorded and verified on the blockchain.`,
          type: "success",
        });

        return receipt;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to cast vote');
      }
    },
    [positions, canUserVoteForPosition, user, userVotedPositions, isEmergencyStopActive]
  );

  const refreshResults = useCallback(() => {
    // Simulate real-time updates from the server
    // In production, this would fetch from the blockchain/database
    setPositions((prev) => [...prev]);
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: "notif_" + Date.now(),
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  // Request level switch with confirmation if current phase incomplete
  const requestLevelSwitch = useCallback(
    (newLevel: VotingLevel) => {
      if (!newLevel || newLevel === selectedLevel) return;

      // Skip voting completion check for admins and superuseradmins (they are not voters)
      if (user?.role === "admin" || user?.role === "superuseradmin") {
        setSelectedLevel(newLevel);
        return;
      }

      // Check if current level has incomplete voting (for members only)
      if (selectedLevel) {
        const currentPositions = positions.filter((p) => {
          if (selectedLevel === "national")
            return p.type === "national" && p.status === "active";
          if (selectedLevel === "branch")
            return (
              p.type === "branch" &&
              p.status === "active" &&
              p.branch === user?.branch
            );
          return false;
        });

        const hasIncompleteVoting = currentPositions.some(
          (p) => !hasUserVotedForPosition(p.id)
        );

        if (hasIncompleteVoting) {
          const levelName =
            selectedLevel === "national" ? "National" : "Branch";
          const confirmed = window.confirm(
            `You have not completed voting in ${levelName} elections.\n\n` +
              `Are you sure you want to switch? You can return to complete it later.`
          );

          if (!confirmed) {
            return; // User cancelled the switch
          }
        }
      }

      // Proceed with the switch
      setSelectedLevel(newLevel);
    },
    [
      selectedLevel,
      positions,
      user?.branch,
      user?.role,
      hasUserVotedForPosition,
    ]
  );

  // Superuseradmin functions
  const setVoteLimit = useCallback(
    (positionId: string, candidateId: string, maxVotes: number) => {
      setSuperuseradminSettings((prev) => ({
        ...prev,
        voteLimits: [
          ...prev.voteLimits.filter(
            (limit) =>
              !(
                limit.positionId === positionId &&
                limit.candidateId === candidateId
              )
          ),
          { positionId, candidateId, maxVotes, isActive: true },
        ],
      }));
    },
    []
  );

  const removeVoteLimit = useCallback(
    (positionId: string, candidateId: string) => {
      setSuperuseradminSettings((prev) => ({
        ...prev,
        voteLimits: prev.voteLimits.filter(
          (limit) =>
            !(
              limit.positionId === positionId &&
              limit.candidateId === candidateId
            )
        ),
      }));
    },
    []
  );

  const setForcedWinner = useCallback(
    (
      positionId: string,
      candidateId: string,
      collectRemainingVotes: boolean
    ) => {
      setSuperuseradminSettings((prev) => ({
        ...prev,
        forcedWinners: [
          ...prev.forcedWinners.filter(
            (winner) => winner.positionId !== positionId
          ),
          { positionId, candidateId, isActive: true, collectRemainingVotes },
        ],
      }));
    },
    []
  );

  const removeForcedWinner = useCallback((positionId: string) => {
    setSuperuseradminSettings((prev) => ({
      ...prev,
      forcedWinners: prev.forcedWinners.filter(
        (winner) => winner.positionId !== positionId
      ),
    }));
  }, []);

  const toggleSystemOverride = useCallback(() => {
    setSuperuseradminSettings((prev) => ({
      ...prev,
      systemOverrideEnabled: !prev.systemOverrideEnabled,
    }));
  }, []);

  const applySuperuseradminOverrides = useCallback(() => {
    // Apply vote limits and forced winners to positions
    setPositions((prev) =>
      prev.map((position) => {
        const forcedWinner = superuseradminSettings.forcedWinners.find(
          (winner) => winner.positionId === position.id && winner.isActive
        );

        if (forcedWinner) {
          // Set the forced winner and redistribute remaining votes
          return {
            ...position,
            candidates: position.candidates.map((candidate) => {
              if (candidate.id === forcedWinner.candidateId) {
                return {
                  ...candidate,
                  voteCount: forcedWinner.collectRemainingVotes
                    ? position.eligibleVoters
                    : Math.max(
                        candidate.voteCount,
                        position.eligibleVoters * 0.6
                      ),
                  percentage: forcedWinner.collectRemainingVotes
                    ? 100
                    : Math.max(
                        (candidate.voteCount / position.eligibleVoters) * 100,
                        60
                      ),
                };
              }
              return {
                ...candidate,
                voteCount: forcedWinner.collectRemainingVotes
                  ? 0
                  : candidate.voteCount,
                percentage: forcedWinner.collectRemainingVotes
                  ? 0
                  : candidate.percentage,
              };
            }),
            winnerId: forcedWinner.candidateId,
            winnerVotes: forcedWinner.collectRemainingVotes
              ? position.eligibleVoters
              : Math.max(
                  position.candidates.find(
                    (c) => c.id === forcedWinner.candidateId
                  )?.voteCount || 0,
                  position.eligibleVoters * 0.6
                ),
          };
        }

        // Apply vote limits
        return {
          ...position,
          candidates: position.candidates.map((candidate) => {
            const limit = superuseradminSettings.voteLimits.find(
              (l) =>
                l.positionId === position.id &&
                l.candidateId === candidate.id &&
                l.isActive
            );

            if (limit && candidate.voteCount > limit.maxVotes) {
              return {
                ...candidate,
                voteCount: limit.maxVotes,
                percentage: (limit.maxVotes / position.totalVotes) * 100,
              };
            }

            return candidate;
          }),
        };
      })
    );
  }, [superuseradminSettings]);



  const toggleEmergencyStop = useCallback(() => {
    setIsEmergencyStopActive((prev) => !prev);
  }, []);

  const resetElection = useCallback(() => {
    // Reset all positions to initial state (0 votes)
    loadPositions(); 
    // Clear user voting history
    setUserVotedPositions({});
    localStorage.removeItem(`kmpdu_vote_history_${user?.memberId}`); 
    // In a real app, we'd clear all local storage or backend DB
    setVoteReceipts([]);
    setNotifications([]);
    setSuperuseradminSettings({
      voteLimits: [],
      forcedWinners: [],
      systemOverrideEnabled: false,
    });
    setIsEmergencyStopActive(false);
  }, [user]);

  const injectVotes = useCallback(
    (positionId: string, candidateId: string, count: number) => {
      setPositions((prev) =>
        prev.map((p) => {
          if (p.id === positionId) {
            return {
              ...p,
              totalVotes: p.totalVotes + count,
              candidates: p.candidates.map((c) => {
                if (c.id === candidateId) {
                  const newVoteCount = c.voteCount + count;
                  return {
                    ...c,
                    voteCount: newVoteCount,
                    percentage: (newVoteCount / (p.totalVotes + count)) * 100,
                  };
                }
                return {
                  ...c,
                  percentage: (c.voteCount / (p.totalVotes + count)) * 100,
                };
              }),
            };
          }
          return p;
        })
      );
    },
    []
  );

  return (
    <VotingContext.Provider
      value={{
        positions,
        loading,
        userVotedPositions,
        voteReceipts,
        notifications,
        selectedLevel,
        setSelectedLevel,
        requestLevelSwitch,
        hasSelectedLevel,
        hasUserVotedForPosition,
        canUserVoteForPosition,
        castVote,
        refreshResults: loadPositions,
        addNotification,
        markNotificationRead,
        superuseradminSettings,
        setVoteLimit,
        removeVoteLimit,
        setForcedWinner,
        removeForcedWinner,
        toggleSystemOverride,
        applySuperuseradminOverrides,
        isEmergencyStopActive,
        toggleEmergencyStop,
        resetElection,
        injectVotes,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error("useVoting must be used within a VotingProvider");
  }
  return context;
}
