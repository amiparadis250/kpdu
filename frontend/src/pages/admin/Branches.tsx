import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockBranches } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building, Users, TrendingUp, Search, Download, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Branch } from '@/types/voting';
import { BranchDetailsDialog } from '@/components/admin/BranchDetailsDialog';

export default function AdminBranches() {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const branches = mockBranches;
  const totalVoters = branches.reduce((sum, b) => sum + b.totalMembers, 0);
  const totalVoted = branches.reduce((sum, b) => sum + b.votedCount, 0);
  const avgTurnout = (totalVoted / totalVoters) * 100;

  const handleViewDetails = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDetailsDialog(true);
  };

  return (
    <DashboardLayout title="Branch Management">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Branches</p>
                <p className="text-2xl font-bold">{branches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{totalVoters.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Turnout</p>
                <p className="text-2xl font-bold text-success">{avgTurnout.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Yet to Vote</p>
                <p className="text-2xl font-bold">{(totalVoters - totalVoted).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search branches..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Branches Table */}
      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead className="text-right">Total Members</TableHead>
                <TableHead className="text-right">Voted</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="min-w-[150px]">Turnout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <span className="whitespace-nowrap">{branch.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{branch.totalMembers.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-success">{branch.votedCount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-warning">{(branch.totalMembers - branch.votedCount).toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{branch.turnoutPercentage}%</span>
                      </div>
                      <Progress 
                        value={branch.turnoutPercentage} 
                        className="h-2" 
                        indicatorClassName={cn(
                          branch.turnoutPercentage >= 75 ? 'bg-success' :
                          branch.turnoutPercentage >= 50 ? 'bg-accent' :
                          'bg-warning'
                        )}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "whitespace-nowrap",
                      branch.turnoutPercentage >= 75 ? 'bg-success/10 text-success border-success/20' :
                      branch.turnoutPercentage >= 50 ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-destructive/10 text-destructive border-destructive/20'
                    )}>
                      {branch.turnoutPercentage >= 75 ? 'High' :
                       branch.turnoutPercentage >= 50 ? 'Medium' : 'Low'} Turnout
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDetails(branch)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Branch Details Dialog */}
      <BranchDetailsDialog
        branch={selectedBranch}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </DashboardLayout>
  );
}
