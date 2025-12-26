import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  UserPlus,
  Users,
  IdCard,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Upload,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { mockBranches } from '@/data/mockData';
import { useRef } from 'react';

interface SystemUser {
  id: string;
  name: string;
  memberId: string;
  email: string;
  phone: string;
  branch: string;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string | null;
}

interface PendingRegistration {
  id: string;
  type: 'member' | 'candidate';
  name: string;
  email: string;
  phone: string;
  branch: string;
  memberId?: string;
  position?: string;
  status: 'pending' | 'sent' | 'confirmed';
  createdAt: Date;
}

// Mock users data - Only members (admins are managed separately)
const initialUsers: SystemUser[] = [
  {
    id: '1',
    name: 'Dr. John Mwangi',
    memberId: 'KMPDU-2024-00123',
    email: 'john.mwangi@kmpdu.org',
    phone: '+254 712 345 678',
    branch: 'Nairobi Branch',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-12-05',
  },
  {
    id: '2',
    name: 'Dr. Jane Wanjiku',
    memberId: 'KMPDU-2024-00456',
    email: 'jane.wanjiku@kmpdu.org',
    phone: '+254 723 456 789',
    branch: 'Mombasa Branch',
    status: 'active',
    createdAt: '2024-02-20',
    lastLogin: '2024-12-04',
  },
  {
    id: '3',
    name: 'Dr. Mary Akinyi',
    memberId: 'KMPDU-2024-00789',
    email: 'mary.akinyi@kmpdu.org',
    phone: '+254 745 678 901',
    branch: 'Kisumu Branch',
    status: 'inactive',
    createdAt: '2024-03-05',
    lastLogin: null,
  },
  {
    id: '4',
    name: 'Dr. Samuel Kiprop',
    memberId: 'KMPDU-2024-01012',
    email: 'samuel.kiprop@kmpdu.org',
    phone: '+254 756 789 012',
    branch: 'Eldoret Branch',
    status: 'suspended',
    createdAt: '2024-01-25',
    lastLogin: '2024-11-20',
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCredentials, setCopiedCredentials] = useState<'memberId' | 'password' | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedMemberId, setGeneratedMemberId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showEmailConfirmDialog, setShowEmailConfirmDialog] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    status: 'pending' as 'pending' | 'active' | 'inactive' | 'suspended',
  });

  const generateMemberId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const memberId = `KMPDU-${year}-${randomNum}`;
    setGeneratedMemberId(memberId);
    return memberId;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    return password;
  };

  const regenerateCredentials = () => {
    generateMemberId();
    generatePassword();
    toast.success("Credentials Regenerated: New membership number and password.");
  };

  const copyToClipboard = (text: string, type: 'memberId' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedCredentials(type);
    setTimeout(() => setCopiedCredentials(null), 2000);
    toast.info(`${type === 'memberId' ? "Membership Number" : "Password"} Copied to clipboard.`);
  };

  const copyAllCredentials = () => {
    const credentials = `KMPDU Membership Credentials\n\nMembership Number: ${generatedMemberId}\nTemporary Password: ${generatedPassword}\n\nPlease change your password after first login.`;
    navigator.clipboard.writeText(credentials);
    toast.info("All Credentials Copied to clipboard.");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || user.branch === branchFilter;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Logic to handle the file upload
      console.log('File selected:', file);
      toast.success(`File uploaded: ${file.name}`);
      // You can add further processing here, e.g., sending the file to a server
    }
  };

  const handleAddUser = () => {
    // Create pending registration instead of directly adding user
    const registration: PendingRegistration = {
      id: Date.now().toString(),
      type: 'member',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      branch: formData.branch,
      memberId: generatedMemberId,
      status: 'pending',
      createdAt: new Date(),
    };
    
    setPendingRegistration(registration);
    setShowEmailConfirmDialog(true);
    setIsAddDialogOpen(false);
  };

  const handleEmailConfirmationSent = (registration: PendingRegistration) => {
    // Add user with pending status
    const newUser: SystemUser = {
      id: registration.id,
      memberId: registration.memberId || generatedMemberId,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      branch: registration.branch,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
    };
    setUsers([...users, newUser]);
    resetForm();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    setUsers(
      users.map((u) =>
        u.id === selectedUser.id ? { ...u, ...formData } : u
      )
    );
    toast.success(`Member Updated: ${formData.name}'s information has been updated.`);
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(users.filter((u) => u.id !== selectedUser.id));
    toast.error(`Member Deleted: ${selectedUser.name} has been removed from the system.`);
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleBulkDelete = () => {
    setUsers(users.filter(u => !selectedUserIds.includes(u.id)));
    setSelectedUserIds([]);
    toast.success(`${selectedUserIds.length} members deleted.`);
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      branch: '',
      status: 'pending',
    });
    setGeneratedPassword('');
    setGeneratedMemberId('');
    setShowPassword(false);
    setIsAddDialogOpen(false);
    setPendingRegistration(null);
  };

  const openAddDialog = () => {
    resetForm();
    generateMemberId();
    generatePassword();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (user: SystemUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      branch: user.branch,
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
      case 'pending':
        return <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
  };

  return (
    <DashboardLayout title="Member Management" key="users-page">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Check className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Users className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.suspended}</p>
                  <p className="text-xs text-muted-foreground">Suspended</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <CardTitle className="text-foreground">Members</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button onClick={openAddDialog} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls, .pdf"
                onChange={handleFileUpload}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, membership number, or phone..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by branch" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">All Branches</SelectItem>
                  {mockBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedUserIds.length > 0 && (
              <div className="mb-4 flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground ml-2">
                    {selectedUserIds.length} members selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-8"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
              </div>
            )}

            {/* Users Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[20px] px-2 sm:px-4">
                      <Checkbox
                        checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="px-2 sm:px-4 text-[10px] xs:text-xs sm:text-sm">Member</TableHead>
                    <TableHead className="px-2 sm:px-4 text-[10px] xs:text-xs sm:text-sm">Membership No.</TableHead>
                    <TableHead className="hidden md:table-cell px-2 sm:px-4 text-[10px] xs:text-xs sm:text-sm">Phone</TableHead>
                    <TableHead className="hidden lg:table-cell px-2 sm:px-4 text-[10px] xs:text-xs sm:text-sm">Branch</TableHead>
                    <TableHead className="px-2 sm:px-4 text-[10px] xs:text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="hidden lg:table-cell px-2 sm:px-4 text-[10px] xs:text-xs sm:text-sm">Last Login</TableHead>
                    <TableHead className="w-[60px] sm:w-[100px] text-right px-2 sm:px-4 text-[10px] xs:text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No members found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className={selectedUserIds.includes(user.id) ? "bg-muted/30" : ""}>
                        <TableCell className="px-2 sm:px-4">
                          <Checkbox
                            checked={selectedUserIds.includes(user.id)}
                            onCheckedChange={() => toggleSelectUser(user.id)}
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="h-6 w-6 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-[8px] sm:text-sm font-medium text-primary">
                                {user.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-[10px] xs:text-xs sm:text-sm truncate">{user.name}</p>
                              <p className="text-[8px] sm:text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <code className="text-[9px] sm:text-sm font-mono bg-muted px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                            {user.memberId}
                          </code>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground px-2 sm:px-4 text-[10px] xs:text-xs sm:text-sm">
                          {user.phone}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell px-2 sm:px-4">
                          <Badge variant="outline" className="text-[10px] sm:text-xs">{user.branch}</Badge>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <div className="scale-75 sm:scale-100 origin-left">
                            {getStatusBadge(user.status)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-[10px] sm:text-sm px-2 sm:px-4">
                          {user.lastLogin || 'Never'}
                        </TableCell>
                        <TableCell className="text-right px-2 sm:px-4">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditDialog(user)}
                              title="Edit"
                            >
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-8 sm:w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Member Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[550px] max-h-[90vh] flex flex-col rounded-lg p-0">
            <DialogHeader className="pr-10 px-6 pt-6">
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Create a new KMPDU member account. Login credentials will be generated automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 px-6 overflow-y-auto flex-1">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Dr. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+254 7XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => setFormData({ ...formData, branch: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Generated Credentials Section */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Generated Login Credentials</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={regenerateCredentials}
                    className="h-8 gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {/* Membership Number */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <IdCard className="h-3.5 w-3.5" />
                      <span>Membership Number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded bg-background font-mono text-sm border border-border">
                        {generatedMemberId}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(generatedMemberId, 'memberId')}
                        className="shrink-0"
                      >
                        {copiedCredentials === 'memberId' ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Temporary Password</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded bg-background font-mono text-sm border border-border">
                        {showPassword ? generatedPassword : '••••••••••••'}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="shrink-0"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(generatedPassword, 'password')}
                        className="shrink-0"
                      >
                        {copiedCredentials === 'password' ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={copyAllCredentials}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Credentials
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Share these credentials securely with the member. They should change their password after first login.
                </p>
              </div>
            </div>
            <DialogFooter className="px-6 pb-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser} 
                disabled={!formData.name || !formData.branch}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] rounded-lg">
            <DialogHeader className="pr-10">
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>
                Update member information. Membership number cannot be changed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedUser && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <IdCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Membership Number</p>
                    <code className="font-mono text-sm">{selectedUser.memberId}</code>
                  </div>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-branch">Branch</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => setFormData({ ...formData, branch: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive' | 'suspended') =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}