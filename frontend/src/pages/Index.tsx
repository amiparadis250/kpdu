import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/shared/Logo';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { mockUser, mockVoters } from '@/data/mockData';
import {
  Shield,
  Vote,
  Users,
  Lock,
  BarChart3,
  Bell,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
  Search,
  User,
  MapPin,
  Mail,
  Phone,
  Star,
  Play,
  Menu,
  X,
  ChevronUp,
  AlertCircle,
  Send,
  Edit,
  Save,
  Loader2,
} from 'lucide-react';

const Index = () => {
  const [verificationNumber, setVerificationNumber] = useState('');
  const [verifiedVoter, setVerifiedVoter] = useState<typeof mockUser | null>(null);
  const [verificationError, setVerificationError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportReason, setSupportReason] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedVoter, setEditedVoter] = useState<typeof mockUser | null>(null);

  // Handle scroll event to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleVerify = async () => {
    setVerificationError('');
    setVerifiedVoter(null);
    setShowSupportForm(false);
    setSupportReason('');
    setIsEditMode(false);
    setEditedVoter(null);
    
    if (!verificationNumber.trim()) {
      setVerificationError('Please enter your National ID number');
      return;
    }

    // Set loading state
    setIsVerifying(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock verification - in production this would check against a database
    const foundVoter = mockVoters[verificationNumber];
    
    if (foundVoter) {
      setVerifiedVoter(foundVoter);
      setEditedVoter(foundVoter);
    } else {
      setVerificationError('No voter found with this National ID number');
    }

    setIsVerifying(false);
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setEditedVoter(verifiedVoter);
  };

  const handleSaveChanges = () => {
    if (!editedVoter) return;
    
    // In production, this would update the database
    setVerifiedVoter(editedVoter);
    setIsEditMode(false);
    alert('Voter details updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedVoter(verifiedVoter);
  };

  const handleFieldChange = (field: keyof typeof mockUser, value: string) => {
    if (!editedVoter) return;
    setEditedVoter({ ...editedVoter, [field]: value });
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportReason.trim()) return;
    
    // In production, this would send the notification to KMPDU support
    alert(`Support notification sent!\n\nReason: ${supportReason}\n\nKMPDU support will contact you shortly.`);
    
    // Reset form
    setSupportReason('');
    setShowSupportForm(false);
  };

  const features = [
    {
      icon: CheckCircle2,
      title: 'Blockchain Verified',
      description: 'Every Vote is recorded on an immutable blockchain ledger, ensuring complete transparency and preventing any tampering or fraud.',
      color: 'bg-blue-500',
      borderColor: 'border-blue-200',
    },
    {
      icon: Lock,
      title: 'Blockchain Verified',
      description: 'Your vote is completely anonymous and encrypted. Even system administrators cannot see who you voted for.',
      color: 'bg-green-500',
      borderColor: 'border-green-200',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Results',
      description: 'Watch live vote counts and statistics update every second. Full transparency with instant result visualization.',
      color: 'bg-orange-500',
      borderColor: 'border-orange-200',
    },
    {
      icon: Users,
      title: 'Two-Level Voting',
      description: 'Vote For national leadership and your specific branch representatives. Smart system prevents cross-branch voting.',
      color: 'bg-purple-500',
      borderColor: 'border-purple-200',
    },
    {
      icon: Bell,
      title: 'SMS Notifications',
      description: 'Receive instant confirmation via SMS when you vote, plus updates on election announcements and results.',
      color: 'bg-pink-500',
      borderColor: 'border-pink-200',
    },
    {
      icon: Shield,
      title: 'Anti-Fraud System',
      description: 'one vote per person per position. Votes cannot Be altered or deleted. Complete audit trail for verification.',
      color: 'bg-cyan-500',
      borderColor: 'border-cyan-200',
    },
  ];

  const stats = [
    { value: '15,247+', label: 'Registered Voters' },
    { value: '12,891+', label: 'Voters Cast' },
    { value: '47', label: 'Active Branches' },
    { value: '100%', label: 'Secure & Private' },
  ];

  const steps = [
    {
      number: '1',
      title: 'Login & Verify',
      description: 'Login with your unique KMPDU membership number and verify your identity securely',
      color: 'text-blue-500 border-blue-500',
    },
    {
      number: '2',
      title: 'Select Candidates',
      description: 'Review candidates for national and branch position. Read profiles and manifestos',
      color: 'text-green-500 border-green-500',
    },
    {
      number: '3',
      title: 'Cast Your Vote',
      description: 'Submit your encrypted vote. Your choice is recorded on the blockchain instantly.',
      color: 'text-orange-500 border-orange-500',
    },
    {
      number: '4',
      title: 'Get Confirmation',
      description: 'Receive SMS confirmation and view your blockchain verification receipt.',
      color: 'text-purple-500 border-purple-500',
    },
  ];



  return (
    <div className="force-light min-h-screen bg-background">

      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Logo variant="light" className="w-14 sm:w-auto" />
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-white hover:text-white/80 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-white hover:text-white/80 transition-colors">
                How It Works
              </a>
              <a href="#demo" className="text-sm font-medium text-white hover:text-white/80 transition-colors">
                Demo
              </a>
              <a href="#verify" className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
                Verify Details
              </a>
              <a href="#contact" className="text-sm font-medium text-white hover:text-white/80 transition-colors">
                Contact
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden md:block">
                <Button className="bg-white hover:bg-gray-100 text-[#3B5998] font-semibold px-10 py-2 h-auto rounded-md text-sm">
                  Login
                </Button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white p-2 hover:bg-white/10 rounded-md transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#163269] border-t border-white/10">
              <div className="px-4 py-6 space-y-4">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-white hover:text-white/80 transition-colors py-2"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-white hover:text-white/80 transition-colors py-2"
                >
                  How It Works
                </a>
                <a
                  href="#demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-white hover:text-white/80 transition-colors py-2"
                >
                  Demo
                </a>
                <a
                  href="#verify"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors py-2"
                >
                  Verify Details
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-white hover:text-white/80 transition-colors py-2"
                >
                  Contact
                </a>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block pt-2">
                  <Button className="w-full bg-white hover:bg-gray-100 text-[#3B5998] font-semibold px-10 py-2 h-auto rounded-md text-sm">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="relative pt-24 pb-16 md:pt-40 md:pb-28 overflow-hidden min-h-[400px] sm:min-h-[600px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-[center_top] sm:bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/heroarea_bg.png)' }}
        >
          <div className="absolute inset-0 bg-[#163269]/40" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
              Secure, Transparent & Democratic
              <br />
              <span className="text-[#7db3ff]">Union Elections Platform</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-white mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
              Empowering KMPDU members with blockchain-verified voting technology.
              Cast your vote securely from anywhere, anytime with complete privacy and transparency
            </p>
            
            <Link to="/login">
              <Button size="lg" className="bg-white text-[#3B5998] hover:bg-gray-100 px-4 sm:px-8 h-8 sm:h-12 text-xs sm:text-base font-semibold rounded-md">
                <span className="sm:hidden">Start Voting</span>
                <span className="hidden sm:inline">Start Voting Now</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-white border-y border-gray-200 relative overflow-hidden">
        <img 
          src="/design.png" 
          alt="" 
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-32 sm:h-full object-contain opacity-40 sm:opacity-100"
        />
        <img 
          src="/design.png" 
          alt="" 
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-32 sm:h-full object-contain scale-x-[-1] opacity-40 sm:opacity-100"
        />
        
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl sm:text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-0.5 sm:mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-green-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-[#f0f7ff] text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-blue-100 text-blue-700 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium mb-2">
            why choose KMPDU E-Voting
          </div>
        </div>
      </section>

      <section id="features" className="py-12 sm:py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-3 sm:mb-4">
              Built for Trust, Security & Transparency
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge blockchain technology with user-friendly design
              to deliver the most secure voting experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className={`border-2 ${feature.borderColor} hover:shadow-lg transition-all duration-300`}>
                <CardContent className="p-4 sm:p-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${feature.color} flex items-center justify-center mb-3 sm:mb-4`}>
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#1e3a8a] mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#f0f7ff] text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium mb-2">
            How It's Works
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
              Simple 4-Step Voting Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed for ease of use while maintaining the highest security standards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {steps.map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 ${item.color} flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <span className={`text-2xl sm:text-3xl font-bold ${item.color.split(' ')[0]}`}>{item.number}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#1e3a8a] mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-block bg-blue-50 rounded-lg p-4 border border-blue-100">
              <a href="#demo">
                <Button className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  See It In Action
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-3 sm:mb-4">
              Watch How Easy It Is to Vote
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Experience our secure, user-friendly voting process from login to confirmation in this quick demo
            </p>
          </div>
          
          
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <div className="lg:w-2/3">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="/demo.png" 
                    alt="Voting System Demo" 
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg cursor-pointer hover:bg-green-600 transition-colors">
                      <Play className="h-6 w-6 sm:h-10 sm:w-10 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:absolute lg:right-0 lg:bottom-8 lg:w-1/2 mt-6 sm:mt-8 lg:mt-0 px-0 sm:px-0">
                <Card className="border-2 border-blue-200 shadow-xl bg-white max-w-[280px] sm:max-w-sm mx-auto lg:max-w-none">
                  <CardContent className="p-2 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
                      <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-2xl bg-[#1e3a8a] flex items-center justify-center">
                        <Shield className="h-4 w-4 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-lg font-bold text-[#1e3a8a]">Vote Verification</h3>
                        <p className="text-[10px] sm:text-sm text-gray-600">Blockchain Receipt</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-3 p-2 sm:p-4 bg-gray-50 rounded-xl font-mono text-[9px] sm:text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="text-[#1e3a8a] font-semibold">0x7f3a...8b2c</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Block Number</span>
                        <span className="text-[#1e3a8a] font-semibold">#12,847,392</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timestamp</span>
                        <span className="text-[#1e3a8a] font-semibold">2024-03-15 14:32:01</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" /> Verified
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-[9px] sm:text-xs text-gray-500 mt-2 sm:mt-4 text-center">
                      Your vote has been permanently recorded on the blockchain
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-12 lg:mt-16">
                <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-4">
                  Your Vote is Protected by
                  <br />
                  Blockchain Technology
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>



      <section id="verify" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
              Check Your Voter Details
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Enter your National ID number to verify your registration details before voting
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardContent className="p-3 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 w-full">
                    <Input
                      placeholder="Enter National ID Number"
                      value={verificationNumber}
                      onChange={(e) => setVerificationNumber(e.target.value)}
                      className="h-10 sm:h-12 text-sm sm:text-base bg-transparent w-full"
                      type="text"
                    />
                  </div>
                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>

                {verifiedVoter && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      <span className="font-semibold text-sm sm:text-base text-[#1e3a8a]">Voter Found</span>
                    </div>
                    
                    {/* Detailed Table */}
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm mb-4">
                      <div className="grid grid-cols-1 divide-y">
                        {[
                          { label: 'First Name', field: 'firstName' as const, value: isEditMode ? editedVoter?.firstName : verifiedVoter?.firstName },
                          { label: 'Surname', field: 'surname' as const, value: isEditMode ? editedVoter?.surname : verifiedVoter?.surname },
                          { 
                            label: 'Branch', 
                            field: 'branch' as const, 
                            value: verifiedVoter?.role === 'intern' ? 'N/A' : (isEditMode ? editedVoter?.branch : verifiedVoter?.branch) 
                          },
                          { label: 'KMPDU Number', field: 'memberId' as const, value: isEditMode ? editedVoter?.memberId : verifiedVoter?.memberId },
                          { label: 'Phone Number', field: 'phone' as const, value: isEditMode ? editedVoter?.phone : verifiedVoter?.phone },
                          { label: 'E-mail Address', field: 'email' as const, value: isEditMode ? editedVoter?.email : verifiedVoter?.email },
                        ].map((item, index) => (
                          <div key={item.label} className={`flex flex-col sm:flex-row sm:items-center ${
                            index % 2 === 0 ? "bg-secondary/5" : "bg-white"
                          }`}>
                            <div className="px-3 py-1.5 sm:px-4 sm:py-2 sm:w-1/3 text-xs sm:text-sm font-medium text-muted-foreground sm:border-r break-words">
                              {item.label}:
                            </div>
                            <div className="px-3 py-1.5 sm:px-4 sm:py-2 sm:w-2/3 break-words">
                              {isEditMode ? (
                                <Input
                                  value={item.value || ''}
                                  onChange={(e) => handleFieldChange(item.field, e.target.value)}
                                  className="h-8 text-sm font-bold bg-white border-gray-300"
                                />
                              ) : (
                                <span className="text-sm font-bold text-foreground">{item.value}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Edit Controls Section */}
                    <div className="mt-4">
                      {!isEditMode ? (
                        <p className="text-[10px] sm:text-sm text-gray-600 text-center flex flex-col sm:block items-center gap-1">
                          <span>Details incorrect?</span>
                          <button
                            onClick={handleEditMode}
                            className="text-[#1e3a8a] text-[10px] sm:text-sm hover:text-[#3b82f6] font-semibold underline inline-flex items-center gap-1 transition-colors">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sm:hidden">Edit Details</span>
                            <span className="hidden sm:inline">Edit Details Yourself</span>
                          </button>
                        </p>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 animate-in slide-in-from-top-2">
                          <div className="flex items-center gap-2 mb-3">
                            <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e3a8a]" />
                            <h4 className="font-semibold text-sm sm:text-base text-[#1e3a8a]">Edit Mode Active</h4>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3">
                            Update the fields above and click Save Changes when done.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={handleSaveChanges}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white w-full h-8 sm:h-auto text-xs sm:text-sm">
                              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="sm:hidden">Save</span>
                              <span className="hidden sm:inline">Save Changes</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="border-gray-300 w-full sm:w-auto mt-0 sm:mt-0 h-8 sm:h-auto text-xs sm:text-sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {verificationError && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="p-4 bg-red-50 rounded-xl text-center">
                      <p className="text-red-600 font-medium">{verificationError}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Please check your National ID number and try again.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
                Ready to Cast Your Vote
              </h2>
              <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto md:mx-0">
                Join Thousands of KMPDU members who have already voted securely and Transparently.
              </p>
            </div>
            <Link to="/login" className="w-full md:w-auto">
              <Button size="lg" className="bg-white text-[#1e3a8a] hover:bg-gray-100 w-full md:w-auto px-4 sm:px-8 h-10 sm:h-12 text-xs sm:text-base font-semibold whitespace-nowrap">
                <span className="sm:hidden">Login to Vote</span>
                <span className="hidden sm:inline">Login to Vote Now</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer id="contact" className="py-8 sm:py-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <Logo className="mb-4" />
              <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
                Empowering democratic participation through secure, transparent, and blockchain-verified electronic voting for all KMPDU members.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#1e3a8a] mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">Home</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">Security</a></li>
                <li><a href="#features" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">Features</a></li>
                <li><a href="#contact" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#1e3a8a] mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">Voting Guide</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">FAQs</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1e3a8a] mb-3 sm:mb-4 text-sm sm:text-base">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-xs sm:text-sm">KMPDU Headquarters, Nairobi, Kenya</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#3b82f6] flex-shrink-0" />
                  <a href="tel:+254700000000" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">+254 700 000 000</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#3b82f6] flex-shrink-0" />
                  <a href="mailto:support@kmpdu-evoting.ke" className="text-gray-600 hover:text-[#1e3a8a] transition-colors text-xs sm:text-sm">support@kmpdu-evoting.ke</a>
                </li>
              </ul>
              <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#1e3a8a] flex items-center justify-center hover:bg-[#1e3a8a] hover:text-white transition-colors group">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e3a8a] group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#1e3a8a] flex items-center justify-center hover:bg-[#1e3a8a] hover:text-white transition-colors group">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e3a8a] group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#1e3a8a] flex items-center justify-center hover:bg-[#1e3a8a] transition-colors group">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e3a8a] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </a>
                <a href="mailto:support@kmpdu-evoting.ke" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#1e3a8a] flex items-center justify-center hover:bg-[#1e3a8a] transition-colors group">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e3a8a] group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-6 sm:pt-8 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              © 2024 KMPDU. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-[#1e3a8a] hover:bg-[#3b82f6] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-bottom-4"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}
    </div>
  );
};

export default Index;
