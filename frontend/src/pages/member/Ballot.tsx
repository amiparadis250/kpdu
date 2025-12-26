import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useVoting } from "@/contexts/VotingContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  Shield,
  Lock,
  AlertTriangle,
  Loader2,
  LogOut,
  User as UserIcon,
  Pencil,
  Copy,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { Progress } from "@/components/ui/progress";

type VotingPhase = "national" | "branch" | "completed";

export default function Ballot() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    positions: allPositions,
    hasUserVotedForPosition,
    castVote,
    selectedLevel,
    userVotedPositions,
  } = useVoting();

  const [phase, setPhase] = useState<VotingPhase>("national");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingSelection, setProcessingSelection] = useState(false);
  const [isEditingFromReview, setIsEditingFromReview] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(5);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [receiptData] = useState({
    hash: `KMPDU-BLK-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`,
    token: `KMPDU-VRF-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`,
    timestamp: new Date().toLocaleString(),
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter positions based on current phase
  const currentPositions = allPositions
    .filter((p) => {
      if (phase === "national")
        return p.type === "national" && p.status === "active";
      if (phase === "branch")
        return (
          p.type === "branch" &&
          p.status === "active" &&
          p.branch === user?.branch
        );
      return false;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const currentPosition = currentPositions[currentIndex];

  // Reactive Phase Management
  useEffect(() => {
    if (allPositions.length === 0 || isSubmitting) return;

    const nationalPositions = allPositions.filter(
      (p) => p.type === "national" && p.status === "active"
    );
    const branchPositions = allPositions.filter(
      (p) =>
        p.type === "branch" &&
        p.status === "active" &&
        p.branch === user?.branch
    );

    const hasVotedAllNational =
      nationalPositions.length > 0
        ? nationalPositions.every((p) => hasUserVotedForPosition(p.id))
        : true;
    const hasVotedAllBranch =
      branchPositions.length > 0
        ? branchPositions.every((p) => hasUserVotedForPosition(p.id))
        : true;

    let nextPhase: VotingPhase = phase;

    if (user?.role === "member") {
      if (!hasVotedAllNational) {
        nextPhase = "national";
      } else if (!hasVotedAllBranch && branchPositions.length > 0) {
        nextPhase = "branch";
      } else {
        nextPhase = "completed";
      }
    } else {
      nextPhase = hasVotedAllNational ? "completed" : "national";
    }

    if (nextPhase !== phase) {
      // If transitioning between active voting phases, show info toast
      if (phase === "national" && nextPhase === "branch") {
        toast.info(
          <div>
            <strong>National Stage Complete</strong>
            <p className="text-sm mt-1">Proceeding to your branch elections.</p>
          </div>
        );
      }

      setPhase(nextPhase);
      handlePhaseCompletion();
    }
  }, [
    allPositions,
    userVotedPositions,
    user?.branch,
    user?.role,
    hasUserVotedForPosition,
    isSubmitting,
  ]);

  // Sync phase with selectedLevel from context (if user manually switches)
  useEffect(() => {
    if (selectedLevel && selectedLevel !== phase && phase !== "completed") {
      setPhase(selectedLevel as VotingPhase);
      handlePhaseCompletion();
    }
  }, [selectedLevel]);

  // Reset pagination when position changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentIndex]);

  // Auto-logout timer
  useEffect(() => {
    if (phase === "completed" && !isDownloading && !showThankYou) {
      const timer = setInterval(() => {
        setLogoutCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, isDownloading, showThankYou]);

  const handleSelectCandidate = async (candidateId: string) => {
    if (processingSelection) return;
    setProcessingSelection(true);

    // Update selection
    setSelections((prev) => ({
      ...prev,
      [currentPosition.id]: candidateId,
    }));

    // Visual feedback delay then auto-advance or return to review
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (isEditingFromReview) {
      setIsEditingFromReview(false);
      setShowConfirmDialog(true);
    } else if (currentIndex < currentPositions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowConfirmDialog(true);
    }
    setProcessingSelection(false);
  };

  const handleJumpToPosition = (positionId: string) => {
    const index = currentPositions.findIndex((p) => p.id === positionId);
    if (index !== -1) {
      setCurrentIndex(index);
      setIsEditingFromReview(true);
      setShowConfirmDialog(false);
    }
  };

  const handleSubmitPhase = async () => {
    setIsSubmitting(true);

    try {
      // Submit votes for current phase
      for (const position of currentPositions) {
        const candidateId = selections[position.id];
        if (candidateId && !hasUserVotedForPosition(position.id)) {
          await castVote(position.id, candidateId);
        }
      }

      setShowConfirmDialog(false);
      setIsEditingFromReview(false);
    } catch (error) {
      toast.error("Failed to submit votes. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhaseCompletion = () => {
    setSelections({});
    setCurrentIndex(0);
    setCurrentPage(1);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.info("Logged out successfully");
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(receiptData.hash);
    toast.success("Blockchain hash copied to clipboard");
  };

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    // Simulate download delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Receipt downloaded successfully");
    setIsDownloading(false);
    setShowThankYou(true);

    // Final wait before logout
    setTimeout(() => {
      handleLogout();
    }, 2000);
  };

  if (phase === "completed") {
    return (
      <DashboardLayout title="Voting Complete">
        <div className="max-w-xl mx-auto py-8 px-4 animate-fade-in text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center check-animate">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Vote Submitted!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-8">
            Your vote has been securely recorded and verified on the blockchain.
          </p>

          <Card className="text-left border-dashed border-2 overflow-hidden mb-6">
            <CardHeader className="bg-muted/30 pb-3 p-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <ShieldCheck className="h-4 w-4" />
                Vote Receipt
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Status
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-success">
                    All Votes Successfully Cast
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Blockchain Hash
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-muted/50 p-2 rounded text-[10px] sm:text-xs font-mono break-all leading-tight">
                    <span className="flex-1 opacity-80">
                      {receiptData.hash}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={handleCopyHash}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                      Verification Token
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono opacity-80">
                      {receiptData.token}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                      Timestamp
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono opacity-80">
                      {receiptData.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-2">
                <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                  <Lock className="h-3 w-3 mt-0.5 shrink-0" />
                  <p>Votes are immutable and cannot be edited or deleted</p>
                </div>
                <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                  <Shield className="h-3 w-3 mt-0.5 shrink-0" />
                  <p>Your identity is separated from your vote (anonymous)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-[10px] sm:text-xs text-muted-foreground mb-6">
            An SMS confirmation has been sent to your registered phone number.
          </p>

          <div className="space-y-4">
            {showThankYou ? (
              <div className="py-4 animate-bounce">
                <h2 className="text-xl font-bold text-primary">
                  Thank you for voting!
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Logging you out securely...
                </p>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-xs sm:text-sm h-10"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Receipt...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF Receipt
                    </>
                  )}
                </Button>

                <div className="flex flex-col items-center gap-2 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Sign Out Now
                  </Button>
                  <div className="text-[10px] text-muted-foreground/60 flex items-center gap-2">
                    Auto-logout in{" "}
                    <span className="font-bold text-primary w-4">
                      {logoutCountdown}s
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentPosition) {
    return (
      <DashboardLayout title="Ballot">
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil(
    currentPosition.candidates.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCandidates = currentPosition.candidates.slice(
    startIndex,
    endIndex
  );

  return (
    <DashboardLayout
      title={`${phase === "national" ? "National" : "Branch"} Elections`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Progress System */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-2">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">
                {phase === "national"
                  ? "National Positions"
                  : `${user?.branch} Positions`}
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground">
                Position {currentIndex + 1} of {currentPositions.length}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs sm:text-sm font-medium text-primary">
                Step {Object.keys(selections).length}/{currentPositions.length}
              </div>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{
                width: `${
                  (Object.keys(selections).length / currentPositions.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Voting Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant={phase === "national" ? "default" : "secondary"}
                className="text-[10px] sm:text-xs"
              >
                {phase.toUpperCase()}
              </Badge>
              <span className="text-[10px] sm:text-sm text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure Ballot
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl sm:text-3xl">
                  {currentPosition.title}
                </CardTitle>
                <CardDescription className="text-sm sm:text-lg">
                  Select your preferred candidate from the list below to proceed
                </CardDescription>
              </div>
              {isEditingFromReview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingFromReview(false);
                    setShowConfirmDialog(true);
                  }}
                  className="shrink-0 gap-2 border-primary/20 hover:bg-primary/5 h-9"
                >
                  <Check className="h-4 w-4" />
                  Return to Review
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden sm:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Candidate</TableHead>
                    <TableHead className="w-[120px] text-center">Status</TableHead>
                    <TableHead className="w-[150px] text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCandidates.map((candidate) => {
                    const isSelected =
                      selections[currentPosition.id] === candidate.id;
                    return (
                      <TableRow
                        key={candidate.id}
                        className={isSelected ? "bg-primary/5" : ""}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                              {candidate.photo ? (
                                <img
                                  src={candidate.photo}
                                  alt={candidate.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <UserIcon className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {candidate.name}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                              Active
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            disabled={processingSelection}
                            onClick={() => handleSelectCandidate(candidate.id)}
                            className={
                              isSelected
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                          >
                            {isSelected ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Selected
                              </>
                            ) : (
                              "Select"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-3 sm:hidden block">
              {currentCandidates.map((candidate) => {
                const isSelected =
                  selections[currentPosition.id] === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    className={`rounded-lg border p-2 flex flex-col gap-2 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                        {candidate.photo ? (
                          <img
                            src={candidate.photo}
                            alt={candidate.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="font-semibold text-xs truncate">
                            {candidate.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4 min-w-fit border-emerald-200 text-emerald-700 bg-emerald-50"
                          >
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      disabled={processingSelection}
                      onClick={() => handleSelectCandidate(candidate.id)}
                      className={`w-full h-8 text-xs ${
                        isSelected ? "bg-green-600 hover:bg-green-700" : ""
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Selected
                        </>
                      ) : (
                        "Select"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="w-[90vw] max-w-sm rounded-xl p-4 gap-3">
          <DialogHeader className="space-y-1 text-left pr-10">
            <DialogTitle className="flex items-start gap-2 text-base leading-tight">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <span>Confirm Selections</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-left">
              Review your votes. Once submitted, they cannot be changed.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-2 py-1">
            {currentPositions.map((position) => {
              const candidate = position.candidates.find(
                (c) => c.id === selections[position.id]
              );
              return (
                <div
                  key={position.id}
                  className="flex flex-col gap-0.5 py-2 px-3 border border-border/40 bg-muted/20 rounded-lg text-left"
                >
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {position.title}
                  </span>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm font-bold text-primary break-words leading-tight">
                      {candidate?.name || "Abstained"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                      onClick={() => handleJumpToPosition(position.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="sm:justify-between gap-0 pt-2">
            <Button
              onClick={handleSubmitPhase}
              className="w-full h-9 text-xs font-medium gap-2 shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Confirm & Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
