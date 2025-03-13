import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CandidateRatingChart } from "@/components/charts/CandidateRatingChart";
import { ArrowLeft, User, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCandidate, getRatingsByCandidate } from "@/lib/db";

export default function AdminCandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<any | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          navigate("/admin/dashboard");
          return;
        }
        
        // Fetch candidate
        const candidateData = await getCandidate(id);
        if (!candidateData) {
          toast({
            title: "Error",
            description: "Candidate not found",
            variant: "destructive",
          });
          navigate("/admin/dashboard");
          return;
        }
        
        setCandidate(candidateData);
        
        // Fetch ratings for this candidate
        const candidateRatings = await getRatingsByCandidate(id);
        setRatings(candidateRatings);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Could not load candidate details",
          variant: "destructive",
        });
        navigate("/admin/dashboard");
      }
    };

    fetchData();
  }, [id, navigate, toast]);

  const calculateAverageScores = () => {
    if (ratings.length === 0) return null;
    
    const initialScores = {
      presentation: 0,
      communication: 0,
      technicalSkills: 0,
      problemSolving: 0,
      teamwork: 0,
      leadership: 0,
      initiative: 0,
      attitude: 0,
      adaptability: 0,
      overallImpression: 0,
    };
    
    const totalScores = ratings.reduce((acc, rating) => {
      Object.keys(rating.scores).forEach(key => {
        acc[key as keyof typeof initialScores] += Number(rating.scores[key]);
      });
      return acc;
    }, {...initialScores});
    
    const averageScores: {[key: string]: number} = {};
    Object.keys(totalScores).forEach(key => {
      averageScores[key] = totalScores[key as keyof typeof totalScores] / ratings.length;
    });
    
    return averageScores;
  };

  const calculateOverallAverage = () => {
    const avgScores = calculateAverageScores();
    if (!avgScores) return 0;
    
    const sum = Object.values(avgScores).reduce((acc, val) => acc + Number(val), 0);
    return sum / Object.values(avgScores).length;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-lg text-slate-600">Loading candidate details...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">
            Candidate Details
          </h1>
        </div>

        {/* Candidate Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border border-slate-200">
                {candidate.photo ? (
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <User className="h-16 w-16 text-slate-400" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold">{candidate.name}</h2>
              <p className="text-slate-600">{candidate.position}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-left">
                <div className="text-slate-500">Department:</div>
                <div>{candidate.department}</div>
                <div className="text-slate-500">Shift:</div>
                <div>{candidate.shift === 1 ? "Shift 1" : "Shift 2"}</div>
                <div className="text-slate-500">Year:</div>
                <div>{candidate.year}</div>
                <div className="text-slate-500">Reg No:</div>
                <div>{candidate.regNo}</div>
                <div className="text-slate-500">Email:</div>
                <div className="truncate max-w-[120px]">{candidate.email}</div>
                <div className="text-slate-500">Applied:</div>
                <div>
                  {new Date(candidate.appliedAt || new Date()).toLocaleDateString()}
                </div>
                <div className="text-slate-500">Avg. Rating:</div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                  {calculateOverallAverage().toFixed(1)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <CandidateRatingChart 
              candidateId={id || ""} 
              candidateName={candidate.name} 
            />
          </div>
        </div>

        {/* Ratings List */}
        <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
          <CardHeader>
            <CardTitle>Interview Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            {ratings.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                No ratings available yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Avg. Score</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratings.map((rating) => {
                    const scores = Object.values(rating.scores);
                    const avgScore = scores.map(Number).reduce((sum, score) => sum + score, 0) / scores.length;
                    
                    return (
                      <TableRow key={rating.id}>
                        <TableCell className="font-medium">{rating.interviewer}</TableCell>
                        <TableCell>{new Date(rating.ratedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                            {avgScore.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{rating.remarks}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detailed Scores */}
        {ratings.length > 0 && (
          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardHeader>
              <CardTitle>Average Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {calculateAverageScores() && Object.entries(calculateAverageScores() || {}).map(([key, value]) => (
                  <div key={key} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <div className="mt-1 flex items-center">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                      <span className="text-lg font-semibold">{value.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
