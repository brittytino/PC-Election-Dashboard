import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Star, Clock, Search, Award } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCandidates, getRatings } from "@/lib/db";

// Initial candidates data with proper typing
interface Candidate {
  id: string;
  name: string;
  email: string;
  regNo: string;
  shift: number;
  department: string;
  position: string;
  year: number;
  rated: boolean;
}

const initialCandidates: Candidate[] = [
  {
    id: "1",
    name: "NILASHREE G",
    email: "23107104@srcas.ac.in",
    regNo: "23107104",
    shift: 2,
    department: "BSC IT",
    position: "Vice Chairman",
    year: 3,
    rated: false
  },
  {
    id: "2",
    name: "Ayyappadas TV",
    email: "tvayyappadas@gmail.com",
    regNo: "24129008",
    shift: 2,
    department: "BSC CT",
    position: "Joint Secretary",
    year: 2,
    rated: false
  },
  {
    id: "3",
    name: "Dharsini S",
    email: "24128017@srcas.ac.in",
    regNo: "24128017",
    shift: 2,
    department: "BSC CS AI DS",
    position: "Joint Secretary",
    year: 2,
    rated: false
  },
  {
    id: "4",
    name: "Dhananjay R S",
    email: "24106078@srcas.ac.in",
    regNo: "24106078",
    shift: 2,
    department: "BSC Computer Science",
    position: "Joint Secretary",
    year: 2,
    rated: false
  },
  {
    id: "5",
    name: "Sri Thraishika S",
    email: "24128062@srcas.ac.in",
    regNo: "24128062",
    shift: 2,
    department: "BSC CS AI DS",
    position: "Joint Secretary",
    year: 2,
    rated: false
  },
  {
    id: "6",
    name: "Choudhry",
    email: "24107078@srcas.ac.in",
    regNo: "24107078",
    shift: 2,
    department: "BSC IT",
    position: "Joint Secretary",
    year: 2,
    rated: false
  },
  {
    id: "7",
    name: "Samrutha S",
    email: "samruthasenthilkumar06@gmail.com",
    regNo: "24127056",
    shift: 1,
    department: "BSC CS DA",
    position: "Secretary",
    year: 2,
    rated: false
  },
  {
    id: "8",
    name: "KAVIYAN S",
    email: "skaviyan004@gmail.com",
    regNo: "24127034",
    shift: 1,
    department: "BSC CS DA",
    position: "Secretary",
    year: 2,
    rated: false
  },
  {
    id: "9",
    name: "Kavinraj J S",
    email: "kaviee2507@gmail.com",
    regNo: "24127033",
    shift: 1,
    department: "BSC CS DA",
    position: "Secretary",
    year: 2,
    rated: false
  },
  {
    id: "10",
    name: "Sarath P",
    email: "23107116@srcas.ac.in",
    regNo: "23107116",
    shift: 2,
    department: "BSC IT",
    position: "Vice Chairman",
    year: 3,
    rated: false
  },
  {
    id: "11",
    name: "Mathivathani AG",
    email: "mathianand1036@gmail.com",
    regNo: "24129029",
    shift: 2,
    department: "BSC CT",
    position: "Joint Secretary",
    year: 2,
    rated: false
  },
  {
    id: "12",
    name: "Pravin B",
    email: "23127035@srcas.ac.in",
    regNo: "23127035",
    shift: 1,
    department: "BSC CS DA",
    position: "Chairman",
    year: 3,
    rated: false
  },
  {
    id: "13",
    name: "Kaniskha C",
    email: "23128025@srcas.ac.in",
    regNo: "23128025",
    shift: 2,
    department: "BSC CS AI DS",
    position: "Vice Chairman",
    year: 3,
    rated: false
  }
];

export default function InterviewerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [ratedCandidates, setRatedCandidates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch candidates from IndexedDB or use initialCandidates if fetch fails
        let candidatesData: Candidate[] = [];
        try {
          candidatesData = (await getCandidates()).map(candidate => ({
            ...candidate,
            rated: false
          }));
          if (!candidatesData || candidatesData.length === 0) {
            candidatesData = initialCandidates;
          }
        } catch (error) {
          console.warn("Could not fetch candidates from DB, using initial data", error);
          candidatesData = initialCandidates;
        }
        
        setCandidates(candidatesData);
        
        // Fetch ratings from current interviewer
        if (user?.username) {
          try {
            const allRatings = await getRatings();
            const interviewerRatings = allRatings.filter(
              rating => rating.interviewer === user.username
            );
            const ratedCandidateIds = interviewerRatings.map(rating => rating.candidateId);
            setRatedCandidates(ratedCandidateIds);
          } catch (error) {
            console.warn("Could not fetch ratings, using empty array", error);
            setRatedCandidates([]);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error in fetch operation:", error);
        toast({
          title: "Error",
          description: "Failed to load candidates and ratings. Using default data.",
          variant: "destructive"
        });
        
        // Use initial candidates as fallback
        setCandidates(initialCandidates);
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, user?.username]);

  // Filter candidates based on search query
  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.regNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a candidate has been rated by the current interviewer
  const isCandidateRated = (candidateId: string) => {
    return ratedCandidates.includes(candidateId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4 w-full max-w-sm">
            <SearchInput 
              placeholder="Search candidates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/election')}
            className="flex items-center gap-2"
          >
            <Award className="h-4 w-4" />
            View Election
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-blue-500" />
                Total Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-700">{candidates.length}</p>
              <p className="text-sm text-slate-500">Available for review</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-amber-500" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-700">
                {candidates.length - ratedCandidates.length}
              </p>
              <p className="text-sm text-slate-500">Awaiting your assessment</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-emerald-500" />
                Completed Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-700">{ratedCandidates.length}</p>
              <p className="text-sm text-slate-500">Out of {candidates.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Candidates Section */}
        <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
          <CardHeader>
            <CardTitle>Candidates to Review</CardTitle>
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
                  const isRated = isCandidateRated(candidate.id);
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
                      <Button 
                        variant={isRated ? "outline" : "default"}
                        className="flex items-center gap-2"
                        onClick={() => navigate(`/interviewer/candidate/${candidate.id}`)}
                      >
                        <Star className={`h-4 w-4 ${isRated ? 'fill-amber-400' : ''}`} />
                        {isRated ? "View Rating" : "Rate Now"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}