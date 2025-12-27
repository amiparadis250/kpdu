import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUsers } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/shared/Loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Upload, Search, Download, Users, UserCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  
  const { data: usersData, loading, error, refetch } = useUsers(page, 10, search);
  
  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    
    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', importFile);
      
      const result = await api.importUsers(formData);
      toast.success(`Successfully imported ${result.imported} users`);
      setShowImportDialog(false);
      setImportFile(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };
  
  if (loading && !usersData) {
    return (
      <DashboardLayout title="User Management">
        <Loading type="stats" />
        <div className="mt-6">
          <Loading type="table" count={10} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Management">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{usersData?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{usersData?.active || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{usersData?.pending || 0}</p>
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
                <p className="text-sm text-muted-foreground">Branches</p>
                <p className="text-2xl font-bold">{usersData?.branches || 0}</p>
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
