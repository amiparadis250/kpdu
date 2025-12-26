import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CandidateCard } from '@/components/shared/CandidateCard';
import { Loading } from '@/components/shared/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vote, Globe, MapPin, CheckCircle, Clock, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

interface Election {
  id: string;
  title: string;
  type: 'NATIONAL' | 'BRANCH';
  status: string;
  positions: Position[];
}

interface Position {
  id: string;
  title: string;
  candidates: Candidate[];
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  photo?: string;
}

export default function Ballot() {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'national' | 'branch'>('national');

  useEffect(() => {
    loadBallot();
  }, [user]);

  const loadBallot = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.getBallot(user.id);
      setElections(response.elections || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load ballot');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSelect = (positionId: string, candidateId: string) => {
    setSelectedVotes(prev => ({
      ...prev,
      [positionId]: candidateId
    }));
  };

  const handleSubmitVotes = async () => {
    if (!user) return;
    
    const votes = Object.entries(selectedVotes).map(([positionId, candidateId]) => ({
      positionId,
      candidateId
    }));

    if (votes.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    try {
      setSubmitting(true);
      await api.castVote(user.id, votes);
      toast.success('Votes cast successfully!');
      // Reload to show updated state
      loadBallot();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cast votes');
    } finally {
      setSubmitting(false);
    }
  };

  const nationalElections = elections.filter(e => e.type === 'NATIONAL');
  const branchElections = elections.filter(e => e.type === 'BRANCH');

  if (loading) {
    return (
      <DashboardLayout title="Ballot">
        <Loading type="card" count={6} />
      </DashboardLayout>
    );
  }

  if (elections.length === 0) {
    return (
      <DashboardLayout title="Ballot">
        <Card>
          <CardContent className="p-8 text-center">
            <Vote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Elections</h3>
            <p className="text-muted-foreground">
              There are currently no active elections available for voting.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Cast Your Vote">
      <div className="space-y-6">
        {/* Voting Instructions */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Vote className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary">Voting Instructions</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select one candidate for each position. Your votes will be recorded on the blockchain for transparency and security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Election Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'national' | 'branch')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="national" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              National Elections ({nationalElections.length})
            </TabsTrigger>
            <TabsTrigger value="branch" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Branch Elections ({branchElections.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="national" className="space-y-6">
            {nationalElections.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No National Elections</h3>
                  <p className="text-muted-foreground">
                    There are currently no active national elections.
                  </p>
                </CardContent>
              </Card>
            ) : (
              nationalElections.map(election => (
                <div key={election.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{election.title}</h2>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      <Globe className="h-3 w-3 mr-1" />
                      National
                    </Badge>
                  </div>
                  
                  {election.positions.map(position => (
                    <Card key={position.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{position.title}</span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {position.candidates.length} candidates
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {position.candidates.map(candidate => (
                            <CandidateCard
                              key={candidate.id}
                              candidate={{
                                id: candidate.id,
                                name: `${candidate.firstName} ${candidate.lastName}`,
                                bio: candidate.bio || '',
                                position: position.title,
                                photo: candidate.photo,
                                voteCount: 0,
                                percentage: 0
                              }}
                              selectable
                              isSelected={selectedVotes[position.id] === candidate.id}
                              onSelect={() => handleVoteSelect(position.id, candidate.id)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="branch" className="space-y-6">
            {branchElections.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Branch Elections</h3>
                  <p className="text-muted-foreground">
                    There are currently no active elections for your branch.
                  </p>
                </CardContent>
              </Card>
            ) : (
              branchElections.map(election => (
                <div key={election.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{election.title}</h2>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user?.branch}
                    </Badge>
                  </div>
                  
                  {election.positions.map(position => (
                    <Card key={position.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{position.title}</span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {position.candidates.length} candidates
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {position.candidates.map(candidate => (
                            <CandidateCard
                              key={candidate.id}
                              candidate={{
                                id: candidate.id,
                                name: `${candidate.firstName} ${candidate.lastName}`,
                                bio: candidate.bio || '',
                                position: position.title,
                                photo: candidate.photo,
                                voteCount: 0,
                                percentage: 0
                              }}
                              selectable
                              isSelected={selectedVotes[position.id] === candidate.id}
                              onSelect={() => handleVoteSelect(position.id, candidate.id)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Submit Votes */}
        {Object.keys(selectedVotes).length > 0 && (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-semibold text-success">
                      {Object.keys(selectedVotes).length} vote(s) selected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Review your selections and submit your votes
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleSubmitVotes}
                  disabled={submitting}
                  className="gap-2"
                >
                  {submitting ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Vote className="h-4 w-4" />
                      Submit Votes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}