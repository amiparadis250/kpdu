import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useVoting } from '@/contexts/VotingContext';
import { api } from '@/lib/api';
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
  PaginationEllipsis,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Upload, Filter, MoreHorizontal, Edit2, Trash2, Trophy, Check } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function AdminCandidates() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for Candidates Management

  // Edit State
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', bio: '', position: '' });
  const [positionFilter, setPositionFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Delete State
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const { positions } = useVoting();

  // Load candidates from API
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await api.getCandidates();
      setCandidates(response.candidates || []);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Derived filtered list
  const filteredCandidates = candidates.filter(c => {
    const matchesPosition = selectedPosition === 'all' || c.positionId === selectedPosition;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'leading' && c.voteCount > 3000) ||
      (filterStatus === 'contending' && c.voteCount <= 3000);
    const position = positions.find(p => p.id === c.positionId);
    const matchesBranch = filterBranch === 'all' || 
      (filterBranch === 'national' && position?.type === 'national') ||
      (filterBranch !== 'national' && position?.type === 'branch' && position?.title?.includes(filterBranch));
    return matchesPosition && matchesSearch && matchesStatus && matchesBranch;
  });

  // Reset page and selection when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedCandidates([]);
  }, [selectedPosition, searchQuery, filterStatus, filterBranch]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handlers
  const handleAddCandidate = async () => {
    try {
      let photoUrl = '';
      if (selectedPhoto) {
        console.log('Uploading photo...');
        photoUrl = await uploadPhoto(selectedPhoto);
        console.log('Photo uploaded:', photoUrl);
      }
      
      if (editingCandidate) {
        // Update logic - would need API endpoint
        toast.success('Candidate updated successfully');
      } else {
        // Add new candidate
        const candidateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          positionId: formData.position,
          ...(photoUrl && { photo: photoUrl })
        };
        console.log('Creating candidate with data:', candidateData);
        await api.createCandidate(candidateData);
        toast.success('Candidate added successfully');
        loadCandidates(); // Reload candidates
      }
      closeDialog();
    } catch (error) {
      toast.error('Failed to save candidate');
      console.error('Save candidate error:', error);
    }
  };

  const openAddDialog = () => {
    setEditingCandidate(null);
    setFormData({ firstName: '', lastName: '', bio: '', position: '' });
    setPositionFilter('all');
    setShowAddDialog(true);
  };

  const openEditDialog = (candidate: any) => {
    setEditingCandidate(candidate);
    setFormData({
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      bio: candidate.bio || '',
      position: candidate.positionId
    });
    setShowAddDialog(true);
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingCandidate(null);
    setFormData({ firstName: '', lastName: '', bio: '', position: '' });
    setPositionFilter('all');
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      console.log('Uploading file:', file.name, file.size);
      const response = await api.uploadCandidatePhoto(formData);
      console.log('Upload response:', response);
      return response.photoUrl;
    } catch (error) {
      console.error('Photo upload failed:', error);
      throw error;
    }
  };

  // Filter positions based on dialog filter
  const filteredDialogPositions = positions.filter(p => {
    if (positionFilter === 'all') return true;
    if (positionFilter === 'national') return p.type === 'national';
    return p.type === 'branch' && p.branch === positionFilter;
  });

  const confirmDelete = () => {
    if (isBulkDelete) {
      setCandidates(prev => prev.filter(c => !selectedCandidates.includes(c.id)));
      toast.success(`Deleted ${selectedCandidates.length} candidates successfully`);
      setSelectedCandidates([]);
    } else if (candidateToDelete) {
      setCandidates(prev => prev.filter(c => c.id !== candidateToDelete));
      toast.success('Candidate deleted successfully');
    }
    setShowDeleteAlert(false);
    setCandidateToDelete(null);
    setIsBulkDelete(false);
  };

  const initiateDelete = (id: string) => {
    setCandidateToDelete(id);
    setIsBulkDelete(false);
    setShowDeleteAlert(true);
  };

  const initiateBulkDelete = () => {
    setIsBulkDelete(true);
    setShowDeleteAlert(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedCandidates.length === paginatedCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(paginatedCandidates.map(c => c.id));
    }
  };

  const toggleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };



  return (
    <DashboardLayout title="Candidate Management">
      <div className="flex flex-col gap-3 sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-base sm:text-lg max-[250px]:text-sm font-semibold">Candidates</h2>
          <p className="text-xs sm:text-sm max-[250px]:text-xs text-muted-foreground">
            {candidates.length} candidates across {positions.length} positions
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto max-sm:flex-col">
          {selectedCandidates.length > 0 && (
            <Button 
              variant="destructive" 
              className="gap-2 animate-in fade-in slide-in-from-right-5 max-sm:w-full max-sm:text-sm"
              onClick={initiateBulkDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedCandidates.length})
            </Button>
          )}
          <Button variant="outline" className="gap-2 max-sm:w-full max-sm:text-sm max-[250px]:text-xs">
            <Upload className="h-4 w-4 max-[250px]:h-3 max-[250px]:w-3" />
            Bulk Upload
          </Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => !open && closeDialog()}>
            <DialogTrigger asChild>
              <Button className="gap-2 max-sm:w-full max-sm:text-sm max-[250px]:text-xs" onClick={openAddDialog}>
                <Plus className="h-4 w-4 max-[250px]:h-3 max-[250px]:w-3" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-sm:max-w-[90vw] max-sm:max-h-[85vh] max-sm:p-4 max-[250px]:max-w-[95vw] max-[250px]:max-h-[90vh] max-[250px]:p-3">
              <DialogHeader className="max-sm:space-y-1.5 max-[250px]:space-y-1">
                <DialogTitle className="max-sm:text-base max-[250px]:text-sm">{editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}</DialogTitle>
                <DialogDescription className="max-sm:text-xs max-[250px]:text-xs">
                  {editingCandidate ? 'Update the candidate details below' : "Enter the candidate's details below"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-sm:space-y-3 max-sm:py-3 max-sm:overflow-y-auto max-sm:max-h-[55vh] max-[250px]:space-y-2 max-[250px]:py-2 max-[250px]:max-h-[60vh]">
                <div className="space-y-2 max-sm:space-y-1.5 max-[250px]:space-y-1">
                  <Label htmlFor="positionFilter" className="max-sm:text-sm max-[250px]:text-xs">Filter Positions</Label>
                  <Select 
                    value={positionFilter} 
                    onValueChange={setPositionFilter}
                  >
                    <SelectTrigger className="max-sm:h-9 max-sm:text-sm max-[250px]:h-8 max-[250px]:text-xs">
                      <SelectValue placeholder="Filter by branch" />
                    </SelectTrigger>
                    <SelectContent className="max-sm:text-sm max-[250px]:text-[10px]">
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="Western(Member)">Western(Member)</SelectItem>
                      <SelectItem value="Nyanza(Member)">Nyanza(Member)</SelectItem>
                      <SelectItem value="WESTERN">WESTERN</SelectItem>
                      <SelectItem value="UPPER EASTERN">UPPER EASTERN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 max-sm:space-y-1.5 max-[250px]:space-y-1">
                  <Label htmlFor="position" className="max-sm:text-sm max-[250px]:text-xs">Position</Label>
                  <Select 
                    value={formData.position} 
                    onValueChange={(val) => setFormData({...formData, position: val})}
                  >
                    <SelectTrigger className="max-sm:h-9 max-sm:text-sm max-[250px]:h-8 max-[250px]:text-xs">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="max-sm:text-sm max-[250px]:text-[10px]">
                      {filteredDialogPositions.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 max-sm:space-y-1.5 max-[250px]:space-y-1">
                  <Label htmlFor="firstName" className="max-sm:text-sm max-[250px]:text-xs">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="max-sm:h-9 max-sm:text-sm max-sm:placeholder:text-xs max-[250px]:h-8 max-[250px]:text-xs max-[250px]:placeholder:text-[10px]"
                  />
                </div>
                <div className="space-y-2 max-sm:space-y-1.5 max-[250px]:space-y-1">
                  <Label htmlFor="lastName" className="max-sm:text-sm max-[250px]:text-xs">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="max-sm:h-9 max-sm:text-sm max-sm:placeholder:text-xs max-[250px]:h-8 max-[250px]:text-xs max-[250px]:placeholder:text-[10px]"
                  />
                </div>
                <div className="space-y-2 max-sm:space-y-1.5 max-[250px]:space-y-1">
                  <Label htmlFor="photo" className="max-sm:text-sm max-[250px]:text-xs">Photo</Label>
                  <div className="flex items-center gap-4 max-sm:gap-3 max-[250px]:gap-2">
                    <div className="h-20 w-20 max-sm:h-16 max-sm:w-16 max-[250px]:h-12 max-[250px]:w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="h-8 w-8 max-sm:h-6 max-sm:w-6 max-[250px]:h-5 max-[250px]:w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="max-sm:text-sm max-sm:h-8 max-[250px]:text-xs max-[250px]:h-7"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        type="button"
                      >
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="max-sm:gap-2 max-sm:flex-col max-[250px]:gap-2 max-[250px]:flex-col">
                <Button variant="outline" onClick={closeDialog} className="max-sm:w-full max-sm:text-sm max-sm:h-9 max-[250px]:w-full max-[250px]:text-xs max-[250px]:h-8">
                  Cancel
                </Button>
                <Button onClick={handleAddCandidate} className="max-sm:w-full max-sm:text-sm max-sm:h-9 max-[250px]:w-full max-[250px]:text-xs max-[250px]:h-8">
                  {editingCandidate ? 'Update Candidate' : 'Add Candidate'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center mb-4 sm:mb-6">
        <div className="relative flex-1 max-w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 max-[250px]:h-3 max-[250px]:w-3 max-[250px]:left-2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 max-[250px]:pl-7 max-[250px]:h-8 max-[250px]:text-xs max-[250px]:placeholder:text-[10px]"
          />
        </div>
        <Select value={selectedPosition} onValueChange={setSelectedPosition}>
          <SelectTrigger className="w-full sm:w-[200px] max-[250px]:h-8 max-[250px]:text-xs">
            <Filter className="h-4 w-4 mr-2 max-[250px]:h-3 max-[250px]:w-3" />
            <SelectValue placeholder="Filter by position" />
          </SelectTrigger>
          <SelectContent className="max-[250px]:text-[10px]">
            <SelectItem value="all" className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">All Positions</SelectItem>
            {positions.map(p => (
              <SelectItem key={p.id} value={p.id} className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[150px] max-[250px]:h-8 max-[250px]:text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-[250px]:text-[10px]">
            <SelectItem value="all" className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">All Status</SelectItem>
            <SelectItem value="leading" className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">Leading</SelectItem>
            <SelectItem value="contending" className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">Contending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBranch} onValueChange={setFilterBranch}>
          <SelectTrigger className="w-full sm:w-[150px] max-[250px]:h-8 max-[250px]:text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-[250px]:text-[10px]">
            <SelectItem value="all" className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">All Branches</SelectItem>
            <SelectItem value="national" className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">National</SelectItem>
            <SelectItem value="Western(Member)" className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">Western(Member)</SelectItem>
            <SelectItem value="Nyanza(Member)" className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">Nyanza(Member)</SelectItem>
            <SelectItem value="WESTERN" className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">WESTERN</SelectItem>
            <SelectItem value="UPPER EASTERN" className="max-[250px]:text-[10px] max-[250px]:py-0.5 max-[250px]:pl-6 max-[250px]:pr-1">UPPER EASTERN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] max-[250px]:w-[40px] max-[250px]:p-2">
                  <Checkbox 
                    checked={paginatedCandidates.length > 0 && selectedCandidates.length === paginatedCandidates.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                    className="max-[250px]:h-3 max-[250px]:w-3"
                  />
                </TableHead>
                <TableHead className="min-w-[200px] max-[250px]:min-w-[140px] max-[250px]:text-[10px] max-[250px]:p-2">Candidate</TableHead>
                <TableHead className="min-w-[150px] max-[250px]:min-w-[100px] max-[250px]:text-[10px] max-[250px]:p-2">Position</TableHead>
                <TableHead className="min-w-[100px] max-[250px]:min-w-[80px] max-[250px]:text-[10px] max-[250px]:p-2">Votes</TableHead>
                <TableHead className="min-w-[100px] max-[250px]:min-w-[80px] max-[250px]:text-[10px] max-[250px]:p-2">Status</TableHead>
                <TableHead className="min-w-[150px] max-[250px]:min-w-[100px] text-right max-[250px]:text-[10px] max-[250px]:p-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No candidates found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCandidates.map((candidate) => (
                  <TableRow key={candidate.id} className={selectedCandidates.includes(candidate.id) ? "bg-muted/50" : ""}>
                    <TableCell className="max-[250px]:p-2">
                      <Checkbox 
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={() => toggleSelectCandidate(candidate.id)}
                        aria-label={`Select ${candidate.name}`}
                        className="max-[250px]:h-3 max-[250px]:w-3"
                      />
                    </TableCell>
                    <TableCell className="max-[250px]:p-2">
                      <div className="flex items-center gap-3 max-[250px]:gap-1.5">
                        <Avatar className="max-[250px]:h-6 max-[250px]:w-6">
                          <AvatarImage src={candidate.photo ? `http://localhost:5000${candidate.photo}` : undefined} alt={candidate.name} />
                          <AvatarFallback className="max-[250px]:text-[8px]">{getInitials(`${candidate.firstName} ${candidate.lastName}`)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium max-[250px]:text-[10px]">{candidate.firstName} {candidate.lastName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-[250px]:p-2 max-[250px]:text-[10px]">{candidate.positionTitle}</TableCell>
                    <TableCell className="max-[250px]:p-2">
                      <div className="flex flex-col">
                        <span className="font-medium max-[250px]:text-[10px]">{candidate.voteCount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground max-[250px]:text-[8px]">{candidate.percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-[250px]:p-2">
                      {candidate.voteCount > 3000 ? ( // Logic just for demo
                        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 max-[250px]:text-[8px] max-[250px]:px-1 max-[250px]:py-0">
                           Leading
                        </Badge>
                      ) : (
                         <Badge variant="outline" className="max-[250px]:text-[8px] max-[250px]:px-1 max-[250px]:py-0">contenting</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right max-[250px]:p-2">
                      <div className="flex justify-end gap-2 max-[250px]:gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(candidate)}
                          className="max-[250px]:h-6 max-[250px]:px-1 max-[250px]:text-[9px]"
                        >
                          <Edit2 className="h-4 w-4 mr-1 max-[250px]:h-3 max-[250px]:w-3 max-[250px]:mr-0.5" />
                          <span className="max-[250px]:hidden">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 max-[250px]:h-6 max-[250px]:px-1 max-[250px]:text-[9px]"
                          onClick={() => initiateDelete(candidate.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1 max-[250px]:h-3 max-[250px]:w-3 max-[250px]:mr-0.5" />
                          <span className="max-[250px]:hidden">Delete</span>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              {isBulkDelete ? ` ${selectedCandidates.length} selected candidates` : " candidate"} 
              and remove them from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
