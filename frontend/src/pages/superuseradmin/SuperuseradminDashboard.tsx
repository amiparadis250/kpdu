import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useVoting } from "@/contexts/VotingContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Crown,
  Settings,
  Users,
  Vote,
  Zap,
  Trash2,
  Plus,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "react-toastify";

export default function SuperuseradminDashboard() {
  const { user } = useAuth();
  const {
    positions,
    superuseradminSettings,
    toggleSystemOverride,
    setVoteLimit,
    removeVoteLimit,
    setForcedWinner,
    removeForcedWinner,
    injectVotes,
    resetElection,
    toggleEmergencyStop,
    isEmergencyStopActive,
  } = useVoting();

  // State for Manage Limits Dialog
  const [showLimitsDialog, setShowLimitsDialog] = useState(false);
  const [limitPositionId, setLimitPositionId] = useState<string>("");
  const [limitCandidateId, setLimitCandidateId] = useState<string>("");
  const [limitMaxVotes, setLimitMaxVotes] = useState<string>("");

  // State for Advanced Controls Dialog
  const [showAdvancedDialog, setShowAdvancedDialog] = useState(false);
  const [injectPositionId, setInjectPositionId] = useState<string>("");
  const [injectCandidateId, setInjectCandidateId] = useState<string>("");
  const [injectAmount, setInjectAmount] = useState<string>("");

  // State for Forced Winners Dialog
  const [showWinnersDialog, setShowWinnersDialog] = useState(false);
  const [winnerPositionId, setWinnerPositionId] = useState<string>("");
  const [winnerCandidateId, setWinnerCandidateId] = useState<string>("");

  const handleAddLimit = () => {
    if (!limitPositionId || !limitCandidateId || !limitMaxVotes) {
      toast.error("Please fill all fields");
      return;
    }
    setVoteLimit(limitPositionId, limitCandidateId, parseInt(limitMaxVotes));
    toast.success("Vote limit set successfully");
    setLimitCandidateId("");
    setLimitMaxVotes("");
  };

  const handleSetWinner = () => {
    if (!winnerPositionId || !winnerCandidateId) {
      toast.error("Please select position and candidate");
      return;
    }
    // Defaulting collectRemainingVotes to true for now as per "all other votes are being collected"
    setForcedWinner(winnerPositionId, winnerCandidateId, true);
    toast.success("Forced winner set successfully");
    setWinnerCandidateId("");
  };

  const handleInjectVotes = () => {
    if (!injectPositionId || !injectCandidateId || !injectAmount) {
      toast.error("Please fill all fields");
      return;
    }
    injectVotes(injectPositionId, injectCandidateId, parseInt(injectAmount));
    toast.success(`Successfully injected ${injectAmount} votes`);
    setInjectAmount("");
  };

  const handleResetElection = () => {
    if (confirm("ARE YOU SURE? This will wipe all election data permanently.")) {
      resetElection();
      toast.error("ELECTION RESET COMPLETE");
      setShowAdvancedDialog(false);
    }
  };

  const getCandidateName = (posId: string, candId: string) => {
    const pos = positions.find((p) => p.id === posId);
    return pos?.candidates.find((c) => c.id === candId)?.name || "Unknown";
  };

  return (
    <DashboardLayout title="Superuseradmin Control Center">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900 dark:text-slate-100" />
              <span className="break-words">Superuser Admin</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
              System-wide configurations and overrides
            </p>
          </div>
          <Badge variant="outline" className="border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 sm:px-3 py-1 font-mono text-[10px] sm:text-xs tracking-wide whitespace-nowrap">
            SUPREME AUTHORITY
          </Badge>
        </div>

        {/* System Override Status (Danger Zone Style) */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">System Status</h2>
          <div className="border border-red-200 dark:border-red-500/30 rounded-md bg-transparent overflow-hidden">
            <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-semibold mb-1">System Override Mode</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                  Must be enabled for any forced limitations or winners to take effect.
                </p>
              </div>
              <Button
                onClick={toggleSystemOverride}
                variant="outline"
                size="sm"
                className={`
                  w-full sm:w-auto whitespace-nowrap text-xs sm:text-sm
                  border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700
                  ${superuseradminSettings.systemOverrideEnabled 
                    ? "text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-transparent hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 hover:border-red-400" 
                    : ""}
                `}
              >
                {superuseradminSettings.systemOverrideEnabled ? "Disable Override" : "Enable Override"}
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Vote Limits */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-[#0d1117]">
             <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                 <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        Vote Limits
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Cap maximum votes for candidates
                    </p>
                 </div>
                 <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-1 sm:flex-none">
                        {superuseradminSettings.voteLimits.length} active
                    </span>
                    <Dialog open={showLimitsDialog} onOpenChange={setShowLimitsDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm h-8 px-4">
                                Manage
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-300 max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg text-slate-900 dark:text-slate-100">Manage Vote Limits</DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm text-slate-500">
                              Set vote caps for specific candidates.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
                            {/* Add New Limit */}
                            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-12 gap-2 sm:gap-3 items-end border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6">
                              <div className="sm:col-span-4 space-y-2">
                                <Label className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold">Position</Label>
                                <Select
                                  value={limitPositionId}
                                  onValueChange={(val) => {
                                    setLimitPositionId(val);
                                    setLimitCandidateId(""); 
                                  }}
                                >
                                  <SelectTrigger className="bg-slate-50 dark:bg-[#010409] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-slate-700 focus:ring-offset-0">
                                    <SelectValue placeholder="Position" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-[#161b22] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
                                    {positions.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="sm:col-span-4 space-y-2">
                                <Label className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold">Candidate</Label>
                                <Select
                                  value={limitCandidateId}
                                  onValueChange={setLimitCandidateId}
                                  disabled={!limitPositionId}
                                >
                                  <SelectTrigger className="bg-slate-50 dark:bg-[#010409] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-slate-700 focus:ring-offset-0">
                                    <SelectValue placeholder="Candidate" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-[#161b22] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
                                    {limitPositionId &&
                                      positions
                                        .find((p) => p.id === limitPositionId)
                                        ?.candidates.map((c) => (
                                          <SelectItem key={c.id} value={c.id}>
                                            {c.name} ({c.voteCount})
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 sm:col-span-4">
                                <div className="space-y-2">
                                  <Label className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold">Max</Label>
                                  <Input
                                    type="number"
                                    value={limitMaxVotes}
                                    onChange={(e) => setLimitMaxVotes(e.target.value)}
                                    placeholder="0"
                                    className="bg-slate-50 dark:bg-[#010409] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-slate-700 focus:ring-offset-0"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <Button onClick={handleAddLimit} className="w-full bg-[#238636] hover:bg-[#2ea043] text-white border border-[rgba(240,246,252,0.1)] text-xs sm:text-sm">
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Existing Limits List */}
                            <div className="space-y-0 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                               {superuseradminSettings.voteLimits.length === 0 && (
                                   <div className="p-3 sm:p-4 text-center text-slate-500 text-xs sm:text-sm italic">No limits configured</div>
                               )}
                               {superuseradminSettings.voteLimits.map((limit, idx) => (
                                   <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 p-3 bg-slate-50 dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-100 dark:hover:bg-[#1c2128] transition-colors">
                                       <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex-1">
                                           <span className="font-semibold text-slate-900 dark:text-slate-100">{getCandidateName(limit.positionId, limit.candidateId)}</span>
                                           <span className="text-slate-500 mx-2">•</span>
                                           <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {positions.find(p => p.id === limit.positionId)?.title}
                                           </span>
                                       </div>
                                       <div className="flex items-center gap-4">
                                           <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-0 px-2 py-0.5 rounded">Max: {limit.maxVotes}</span>
                                           <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-6 w-6 text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-transparent"
                                              onClick={() => removeVoteLimit(limit.positionId, limit.candidateId)}
                                           >
                                               <Trash2 className="h-4 w-4" />
                                           </Button>
                                       </div>
                                   </div>
                               ))}
                            </div>
                          </div>
                        </DialogContent>
                    </Dialog>
                 </div>
             </div>
             
             <div className="p-4">
                {superuseradminSettings.voteLimits.length > 0 ? (
                    <ul className="space-y-2">
                        {superuseradminSettings.voteLimits.slice(0, 3).map((limit, i) => (
                             <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                                Limits for <span className="text-slate-900 dark:text-slate-200">{getCandidateName(limit.positionId, limit.candidateId)}</span> set to {limit.maxVotes}
                             </li>
                        ))}
                        {superuseradminSettings.voteLimits.length > 3 && (
                            <li className="text-xs text-slate-500 pl-3.5">
                                + {superuseradminSettings.voteLimits.length - 3} more...
                            </li>
                        )}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500">No active limits. System operating normally.</p>
                )}
             </div>
          </div>

          {/* Forced Winners */}
           <div className="border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-[#0d1117]">
             <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                 <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        Forced Winners
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Designate predetermined winners
                    </p>
                 </div>
                 <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-1 sm:flex-none">
                        {superuseradminSettings.forcedWinners.length} active
                    </span>
                    <Dialog open={showWinnersDialog} onOpenChange={setShowWinnersDialog}>
                        <DialogTrigger asChild>
                           <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm h-8 px-4">
                             Manage
                           </Button>
                        </DialogTrigger>
                         <DialogContent className="max-w-[95vw] sm:max-w-xl bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-300 max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg text-slate-900 dark:text-slate-100">Set Forced Winners</DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm text-slate-500">
                              Choose which candidate will receive diverted votes and win.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
                             {/* Set Winner Form */}
                             <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6">
                              <div className="space-y-2">
                                <Label className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold">Position</Label>
                                <Select
                                  value={winnerPositionId}
                                  onValueChange={(val) => {
                                    setWinnerPositionId(val);
                                    setWinnerCandidateId("");
                                  }}
                                >
                                  <SelectTrigger className="bg-slate-50 dark:bg-[#010409] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-slate-700 focus:ring-offset-0">
                                    <SelectValue placeholder="Position" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-[#161b22] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
                                    {positions.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2 space-y-2">
                                  <Label className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold">Winner</Label>
                                  <Select
                                    value={winnerCandidateId}
                                    onValueChange={setWinnerCandidateId}
                                    disabled={!winnerPositionId}
                                  >
                                    <SelectTrigger className="bg-slate-50 dark:bg-[#010409] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-slate-700 focus:ring-offset-0">
                                      <SelectValue placeholder="Candidate" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-[#161b22] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
                                      {winnerPositionId &&
                                        positions
                                          .find((p) => p.id === winnerPositionId)
                                          ?.candidates.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                              {c.name}
                                            </SelectItem>
                                          ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-end">
                                  <Button onClick={handleSetWinner} className="w-full bg-[#238636] hover:bg-[#2ea043] text-white border border-[rgba(240,246,252,0.1)] text-xs sm:text-sm">
                                    Set Win
                                  </Button>
                                </div>
                              </div>
                            </div>

                             {/* Existing Winners List */}
                             <div className="space-y-0 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                               {superuseradminSettings.forcedWinners.length === 0 && (
                                   <div className="p-3 sm:p-4 text-center text-slate-500 text-xs sm:text-sm italic">No forced winners set</div>
                               )}
                               {superuseradminSettings.forcedWinners.map((winner, idx) => (
                                   <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-100 dark:hover:bg-[#1c2128] transition-colors">
                                       <div className="text-sm text-slate-700 dark:text-slate-300">
                                           <span className="font-semibold text-slate-900 dark:text-slate-100">{getCandidateName(winner.positionId, winner.candidateId)}</span>
                                           <span className="text-slate-500 mx-2">wins</span>
                                           <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {positions.find(p => p.id === winner.positionId)?.title}
                                           </span>
                                       </div>
                                        <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-6 w-6 text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-transparent"
                                              onClick={() => removeForcedWinner(winner.positionId)}
                                           >
                                               <Trash2 className="h-4 w-4" />
                                           </Button>
                                   </div>
                               ))}
                            </div>
                          </div>
                         </DialogContent>
                    </Dialog>
                 </div>
             </div>
             
             <div className="p-4">
                {superuseradminSettings.forcedWinners.length > 0 ? (
                    <ul className="space-y-2">
                        {superuseradminSettings.forcedWinners.slice(0, 3).map((winner, i) => (
                             <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                                <span className="text-slate-900 dark:text-slate-200">{getCandidateName(winner.positionId, winner.candidateId)}</span> will win {positions.find(p => p.id === winner.positionId)?.title}
                             </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500">No forced outcomes. Standard voting rules apply.</p>
                )}
             </div>
          </div>

          {/* System Control */}
          <div className="md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-[#0d1117]">
             <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                 <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        System Interventions
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Manual vote injection and emergency controls
                    </p>
                 </div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        Status: <span className={isEmergencyStopActive ? "text-red-600 dark:text-red-400 font-bold" : "text-[#1a7f37] dark:text-[#238636] font-bold"}>{isEmergencyStopActive ? "STOPPED" : "ACTIVE"}</span>
                    </span>
                    <Dialog open={showAdvancedDialog} onOpenChange={setShowAdvancedDialog}>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600">
                             Advanced Controls
                           </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-300 border-slate-200 dark:border-slate-800 p-0 overflow-hidden max-h-[90vh] flex flex-col">
                           <DialogHeader className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161b22]">
                                <DialogTitle className="text-base sm:text-lg text-slate-900 dark:text-slate-100">Advanced System Controls</DialogTitle>
                           </DialogHeader>
                      
                           <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto">
                                {/* Vote Injection Section */}
                                <div className="space-y-3 sm:space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Vote Injection</h3>
                                    <p className="text-xs text-slate-500 -mt-2 sm:-mt-3">Manually add votes to a specific candidate.</p>
                                    
                                    <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-12 gap-2 sm:gap-3 items-end">
                                        <div className="sm:col-span-4 space-y-2">
                                            <Label className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold">Position</Label>
                                            <Select value={injectPositionId} onValueChange={(val) => { setInjectPositionId(val); setInjectCandidateId(""); }}>
                                                <SelectTrigger className="bg-slate-50 dark:bg-[#010409] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-slate-700 focus:ring-offset-0">
                                                    <SelectValue placeholder="Position" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-[#161b22] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
                                                    {positions.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="sm:col-span-4 space-y-2">
                                            <Label className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold">Candidate</Label>
                                            <Select value={injectCandidateId} onValueChange={setInjectCandidateId} disabled={!injectPositionId}>
                                                <SelectTrigger className="bg-slate-50 dark:bg-[#010409] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-slate-700 focus:ring-offset-0">
                                                    <SelectValue placeholder="Candidate" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-[#161b22] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
                                                    {injectPositionId && positions.find(p => p.id === injectPositionId)?.candidates.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 sm:col-span-4">
                                          <div className="space-y-2">
                                            <Label className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold">Amount</Label>
                                            <Input 
                                                type="number" 
                                                value={injectAmount} 
                                                onChange={(e) => setInjectAmount(e.target.value)}
                                                className="bg-slate-50 dark:bg-[#010409] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-slate-700 focus:ring-offset-0"
                                                placeholder="0"
                                            />
                                          </div>
                                          <div className="flex items-end">
                                            <Button onClick={handleInjectVotes} className="w-full bg-[#1a7f37] dark:bg-[#238636] hover:bg-[#1f883d] dark:hover:bg-[#2ea043] text-white border border-[rgba(27,31,36,0.15)] dark:border-[rgba(240,246,252,0.1)] text-xs sm:text-sm">
                                                Inject
                                            </Button>
                                          </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="space-y-3 sm:space-y-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-500">Danger Zone</h3>
                                    <div className="border border-red-200 dark:border-red-500/40 rounded-md divide-y divide-red-200 dark:divide-red-500/40">
                                        <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-semibold mb-1">Emergency Stop</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Immediately halt all voting processes.</p>
                                            </div>
                                            <Button 
                                                onClick={toggleEmergencyStop} 
                                                variant="outline"
                                                size="sm"
                                                className="w-full sm:w-auto text-xs sm:text-sm text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-400"
                                            >
                                                {isEmergencyStopActive ? "Resume Voting" : "Stop Election"}
                                            </Button>
                                        </div>
                                        <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-semibold mb-1">Reset System</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Permanently wipe all votes and reset elections.</p>
                                            </div>
                                            <Button 
                                                onClick={handleResetElection} 
                                                variant="outline" 
                                                size="sm"
                                                className="w-full sm:w-auto text-xs sm:text-sm text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-400"
                                            >
                                                Reset Everything
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                           </div>
                        </DialogContent>
                    </Dialog>
                 </div>
             </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="p-3 sm:p-4 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-[#0d1117] flex items-start gap-3 sm:gap-4">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
               <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Superuser Access
               </h3>
               <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-1 leading-relaxed">
                  You have been granted ultimate control over the KMPDU voting system. Attributes and actions are logged for audit purposes.
               </p>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
