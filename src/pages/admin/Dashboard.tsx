
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Star, Users, Search, Plus, FileText, Award } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';
import { addCandidate, getCandidates, getRatings } from "@/lib/db";

// Function to determine position based on year and shift
const determinePosition = (year: number, shift: number): string => {
  if (year === 3 && shift === 1) return "Chairman";
  if (year === 3 && shift === 2) return "Vice Chairman";
  if (year === 2 && shift === 1) return "Secretary";
  if (year === 2 && shift === 2) return "Joint Secretary";
  return "Unknown";
};

// Function to determine year from registration number
const determineYear = (regNo: string): number => {
  if (regNo.startsWith("23")) return 3;
  if (regNo.startsWith("24")) return 2;
  return 0;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidateRatings, setCandidateRatings] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New candidate form state
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    regNo: "",
    shift: 1,
    department: "BSC CS"
  });

  // Departments list
  const departments = [
    "BSC CS", 
    "BSC IT", 
    "BSC CS CS", 
    "BSC CS DA", 
    "BSC CS AI DS", 
    "BSC CT", 
    "BSC DCFS", 
    "BCA", 
    "BSC CYB SEC",
    "BSC Computer Science"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch candidates from IndexedDB
        const candidatesData = await getCandidates();
        setCandidates(candidatesData);
        
        // Fetch all ratings
        const allRatings = await getRatings();
        
        // Calculate average ratings for each candidate
        const ratingsMap: {[key: string]: number} = {};
        const ratingsCounts: {[key: string]: number} = {};
        
        allRatings.forEach(rating => {
          const { candidateId, scores } = rating;
          const scoreValues = Object.values(scores);
          const avgScore = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
          
          if (!ratingsMap[candidateId]) {
            ratingsMap[candidateId] = 0;
            ratingsCounts[candidateId] = 0;
          }
          
          ratingsMap[candidateId] += avgScore;
          ratingsCounts[candidateId]++;
        });
        
        // Calculate final averages
        const finalAverages: {[key: string]: number} = {};
        Object.keys(ratingsMap).forEach(candidateId => {
          finalAverages[candidateId] = ratingsMap[candidateId] / ratingsCounts[candidateId];
        });
        
        setCandidateRatings(finalAverages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load candidates and ratings",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter candidates based on search query
  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCandidate({ ...newCandidate, [name]: value });
  };

  // Handle department selection
  const handleDepartmentChange = (value: string) => {
    setNewCandidate({ ...newCandidate, department: value });
  };

  // Handle shift selection
  const handleShiftChange = (value: string) => {
    setNewCandidate({ ...newCandidate, shift: parseInt(value) });
  };

  // Handle form submission
  const handleAddCandidate = async () => {
    // Form validation
    if (!newCandidate.name || !newCandidate.email || !newCandidate.regNo || !newCandidate.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Calculate year from registration number
    const year = determineYear(newCandidate.regNo);
    if (year === 0) {
      toast({
        title: "Error",
        description: "Invalid registration number format",
        variant: "destructive"
      });
      return;
    }

    // Determine position based on year and shift
    const position = determinePosition(year, newCandidate.shift);
    if (position === "Unknown") {
      toast({
        title: "Error",
        description: "Invalid year or shift combination",
        variant: "destructive"
      });
      return;
    }

    // Create new candidate object
    const newCandidateObj = {
      id: uuidv4(),
      name: newCandidate.name,
      email: newCandidate.email,
      regNo: newCandidate.regNo,
      shift: newCandidate.shift,
      department: newCandidate.department,
      position,
      year,
      photo: "",
      appliedAt: new Date(),
    };

    try {
      // Add to database
      await addCandidate(newCandidateObj);
      
      // Add to candidates list
      setCandidates([...candidates, newCandidateObj]);

      // Reset form
      setNewCandidate({
        name: "",
        email: "",
        regNo: "",
        shift: 1,
        department: "BSC CS"
      });

      // Close dialog
      setIsDialogOpen(false);

      // Show success toast
      toast({
        title: "Success",
        description: "Candidate added successfully"
      });
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast({
        title: "Error",
        description: "Failed to add candidate",
        variant: "destructive"
      });
    }
  };

  // Calculate overall average score
  const calculateOverallAverage = () => {
    const ratings = Object.values(candidateRatings);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  // Count pending reviews
  const countPendingReviews = () => {
    const candidatesWithRatings = Object.keys(candidateRatings).length;
    return candidates.length - candidatesWithRatings;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Search and Add New */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4 w-full max-w-sm">
            <SearchInput 
              placeholder="Search candidates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/reports')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View Reports
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/election')}
              className="flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              Election Management
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Candidate
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Candidate</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={newCandidate.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newCandidate.email}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="regNo" className="text-right">
                      Reg. No.
                    </Label>
                    <Input
                      id="regNo"
                      name="regNo"
                      value={newCandidate.regNo}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shift" className="text-right">
                      Shift
                    </Label>
                    <Select 
                      onValueChange={handleShiftChange}
                      defaultValue="1"
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Shift 1</SelectItem>
                        <SelectItem value="2">Shift 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">
                      Department
                    </Label>
                    <Select 
                      onValueChange={handleDepartmentChange}
                      defaultValue="BSC CS"
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddCandidate}>Add Candidate</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-blue-500" />
                Total Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-700">{candidates.length}</p>
              <p className="text-sm text-slate-500">From various departments</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-emerald-500" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-700">{countPendingReviews()}</p>
              <p className="text-sm text-slate-500">Awaiting assessment</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-amber-500" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-700">{calculateOverallAverage().toFixed(1)}</p>
              <p className="text-sm text-slate-500">Out of 5.0</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-purple-500" />
                Active Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-700">4</p>
              <p className="text-sm text-slate-500">Leadership roles</p>
            </CardContent>
          </Card>
        </div>

        {/* Candidates List */}
        <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
          <CardHeader>
            <CardTitle>Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading candidates...</div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                No candidates match your search
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCandidates.map((candidate) => {
                  const avgRating = candidateRatings[candidate.id] || 0;
                  return (
                    <div 
                      key={candidate.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-white/50 border border-slate-200"
                    >
                      <div>
                        <h3 className="font-medium">{candidate.name}</h3>
                        <div className="text-sm text-slate-500 space-y-1">
                          <p>{candidate.department} - {candidate.position}</p>
                          <p>Reg No: {candidate.regNo} | Shift: {candidate.shift === 1 ? "Shift 1" : "Shift 2"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className={`h-4 w-4 ${avgRating > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          <span>{avgRating.toFixed(1)}</span>
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            navigate(`/admin/candidate/${candidate.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2 bg-white/50"
            onClick={() => navigate('/admin/reports')}
          >
            <FileText className="h-6 w-6" />
            Generate Reports
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2 bg-white/50"
            onClick={() => navigate('/admin/election')}
          >
            <Award className="h-6 w-6" />
            Election Management
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2 bg-white/50"
            onClick={() => {
              toast({
                title: "Feature Coming Soon",
                description: "Settings management will be available soon"
              });
            }}
          >
            <Star className="h-6 w-6" />
            Review Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
