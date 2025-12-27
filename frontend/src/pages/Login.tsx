import { useState, useEffect } from "react";
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

export default function Login() {
  const [memberId, setMemberId] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { login, verifyOTP, isLoading, user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'SUPERUSERADMIN') {
        navigate('/superuseradmin');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/member/ballot');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(memberId, nationalId);
      setShowOTP(true);
      setEmail(`${memberId.toLowerCase().replace(/[^a-z0-9]/g, "")}@kmpdu.org`);
    } catch (error) {
      // Error handled in AuthContext
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOTP(memberId, otp);
    } catch (error) {
      // Error handled in AuthContext
    }
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
              {!showOTP ? (
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
              ) : (
                <form onSubmit={handleOTPVerification} className="space-y-5">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">
                      We've sent a verification code to
                    </p>
                    <p className="font-medium text-primary">{email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-base font-medium">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-12 text-lg font-mono tracking-widest text-center bg-secondary/5"
                      maxLength={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold gap-2 shadow-md hover:shadow-lg transition-all"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Continue
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowOTP(false)}
                  >
                    Back to Login
                  </Button>
                </form>
              )}

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
