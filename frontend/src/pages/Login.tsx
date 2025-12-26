import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ArrowRight, Loader2, IdCard } from "lucide-react";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { toast } from "react-toastify";
import { mockPositions } from "@/data/mockData";

// Mock users database with expanded details for verification
const mockUsersDB = [
  {
    memberId: "KMPDU-2024-00456",
    password: "22334455",
    role: "member" as const,
    name: "Dr. Sarah Wanjiku",
    firstName: "SARAH",
    surname: "WANJIKU",
    branch: "Nairobi Branch",
    phone: "+254 7** ***456",
    county: "NAIROBI",
    constituency: "WESTLANDS",
    ward: "PARKLANDS",
    facility: "AGA KHAN UNIVERSITY HOSPITAL",
    station: "MAIN HALL A",
  },
  {
    memberId: "KMPDU-2024-00789",
    password: "33445566",
    role: "member" as const,
    name: "Dr. John Mwangi",
    firstName: "JOHN",
    surname: "MWANGI",
    branch: "Mombasa Branch",
    phone: "+254 7** ***789",
    county: "MOMBASA",
    constituency: "MVITA",
    ward: "TONONOKA",
    facility: "COAST GENERAL HOSPITAL",
    station: "ADMIN BLOCK B",
  },
  {
    memberId: "KMPDU-ADM-001",
    password: "admin123",
    role: "admin" as const,
    name: "James Ochieng",
    firstName: "JAMES",
    surname: "OCHIENG",
    branch: "Headquarters",
    phone: "+254 7** ***001",
    county: "NAIROBI",
    constituency: "KIBRA",
    ward: "WOODLEY",
    facility: "KMPDU HQ",
    station: "ROOM 1",
  },
  {
    memberId: "KMPDU-INT-001",
    password: "11223344",
    role: "intern" as const,
    name: "Dr. Intern Jane",
    firstName: "JANE",
    surname: "MUTHONI",
    branch: "Nairobi Branch",
    phone: "+254 7** ***999",
    county: "NAIROBI",
    constituency: "LANGATA",
    ward: "NAIROBI WEST",
    facility: "KENYATTA NATIONAL HOSPITAL",
    station: "INTERN BLOCK C",
  },
  {
    memberId: "KMPDU-SUP-001",
    password: "supersecret",
    role: "superuseradmin" as const,
    name: "Dr. Supreme Controller",
    firstName: "SUPREME",
    surname: "CONTROLLER",
    branch: "Supreme Control Center",
    phone: "+254 9** ***001",
    county: "NAIROBI",
    constituency: "KIBRA",
    ward: "WOODLEY",
    facility: "KMPDU HQ",
    station: "CONTROL ROOM",
  },
];

export default function Login() {
  const [memberId, setMemberId] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Find user in mock database
    const user = mockUsersDB.find(
      (u) =>
        u.memberId.toLowerCase() === memberId.toLowerCase() &&
        u.password === nationalId
    );

    if (user) {
      // Check if user has already completed voting
      const storageKey = `kmpdu_vote_history_${user.memberId}`;
      const history = localStorage.getItem(storageKey);

      let hasFinishedVoting = false;

      if (history) {
        try {
          const parsed = JSON.parse(history);
          const votedPositions = parsed.votedPositions || {};

          // Calculate eligible positions for this user
          const eligiblePositions = mockPositions.filter((p) => {
            // Basic active check
            if (p.status !== "active") return false;

            // National positions are for everyone
            if (p.type === "national") return true;

            // Branch positions must match user branch
            if (p.type === "branch" && p.branch === user.branch) return true;

            return false;
          });

          // Check if voted for ALL eligible positions
          const votedCount = eligiblePositions.filter(
            (p) => votedPositions[p.id]
          ).length;

          if (
            eligiblePositions.length > 0 &&
            votedCount >= eligiblePositions.length
          ) {
            hasFinishedVoting = true;
          }
        } catch (e) {
          console.error("Error checking voting history", e);
        }
      }

      if (hasFinishedVoting) {
        toast.info(
          "You have already cast your votes. Please wait for the results."
        );
        // Optionally redirect to landing page or just stay here
        navigate("/");
        return;
      }

      // Create user object
      const userObj = {
        id: user.memberId,
        name: user.name,
        email: `${user.memberId
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")}@kmpdu.org`,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
        memberId: user.memberId,
      };

      login(userObj);
      toast.success("Login Successful! Entering voting dashboard...");
      if (user.role === "superuseradmin") {
        navigate("/superuseradmin");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/member/ballot");
      }
    } else {
      toast.error("Identity Verification Failed. Check credentials.");
    }

    setIsLoading(false);
  };

  const electionEndDate = new Date("2024-12-05T18:00:00");

  return (
    <div className="force-light min-h-screen flex">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tOCAyMGwtOC04aDRWMzZoOHY2aDRsLTggOHptOC0yOGw4IDhoLTRWMjBoLTh2LTZoLTRsOC04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo variant="light" />

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight">
                KMPDU 2024
                <br />
                National Elections
              </h1>
              <p className="mt-4 text-lg text-white/80 max-w-md">
                Exercise your democratic right. Your vote shapes the future of
                healthcare in Kenya.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-white/60 uppercase tracking-wide">
                Voting closes in
              </p>
              <CountdownTimer targetDate={electionEndDate} variant="hero" />
            </div>
          </div>

          <div className="flex items-center gap-3 text-white/60 text-sm">
            <Shield className="h-5 w-5" />
            <span>End-to-end encrypted • Blockchain verified • Auditable</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="text-center pb-6 bg-secondary/10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-4 border-background shadow-sm">
                <IdCard className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Voter Login
              </CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access the voting dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 px-6 sm:px-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="memberId" className="text-base font-medium">
                    KMPDU Member ID
                  </Label>
                  <Input
                    id="memberId"
                    type="text"
                    placeholder="e.g. KMPDU-2024-XXXXX"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="h-12 text-lg font-mono tracking-wide bg-secondary/5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId" className="text-base font-medium">
                    National ID Number
                  </Label>
                  <Input
                    id="nationalId"
                    type="password"
                    placeholder="Enter National ID"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="h-12 text-lg tracking-widest bg-secondary/5"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold gap-2 shadow-md hover:shadow-lg transition-all"
                  disabled={isLoading || !memberId || !nationalId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login to Vote
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-muted-foreground">
                Protected by end-to-end encryption. <br />
                KMPDU Electoral Commission © 2024
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
