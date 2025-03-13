import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Star, Clock, Search, Award } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCandidates, getRatings, StoredCandidate } from "@/services/storageService"; // Import StoredCandidate type

export default function InterviewerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<StoredCandidate[]>([]);
  const [ratedCandidates, setRatedCandidates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch candidates from localStorage
        const candidatesData = getCandidates();
        setCandidates(candidatesData);
        
        // Fetch ratings from current interviewer
        if (user?.username) { // Changed from name to username as per your User interface
          const allRatings = getRatings();
          const interviewerRatings = allRatings.filter(
            rating => rating.interviewer === user.username
          );
          const ratedCandidateIds = interviewerRatings.map(rating => rating.candidateId.toString());
          setRatedCandidates(ratedCandidateIds);
        }
        
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
  }, [toast, user?.username]);

  // Filter candidates based on search query
  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a candidate has been rated by the current interviewer
  const isCandidateRated = (candidateId: number | string) => {
    return ratedCandidates.includes(candidateId.toString());
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
                          <p>Reg No: {candidate.regNo} | Shift: {candidate.shift === "1" ? "Shift 1" : "Shift 2"}</p>
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