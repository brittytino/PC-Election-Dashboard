
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingForm } from "@/components/rating/RatingForm";
import { CandidateRatingChart } from "@/components/charts/CandidateRatingChart";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, User, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCandidate, getRatingsByCandidate } from "@/lib/db";

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<any | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        if (!id) {
          navigate("/interviewer/dashboard");
          return;
        }
        
        // Fetch candidate details
        const candidateData = await getCandidate(id);
        if (!candidateData) {
          toast({
            title: "Error",
            description: "Candidate not found",
            variant: "destructive",
          });
          navigate("/interviewer/dashboard");
          return;
        }
        
        setCandidate(candidateData);
        
        // Fetch all ratings for this candidate
        const candidateRatings = await getRatingsByCandidate(id);
        setRatings(candidateRatings);
        
        // Check if current interviewer has already rated this candidate
        if (user?.username) {
          const hasInterviewerRated = candidateRatings.some(
            rating => rating.interviewer === user.username
          );
          setHasRated(hasInterviewerRated);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching candidate:", error);
        toast({
          title: "Error",
          description: "Could not load candidate details",
          variant: "destructive",
        });
        navigate("/interviewer/dashboard");
      }
    };

    if (id) {
      fetchCandidate();
    } else {
      navigate("/interviewer/dashboard");
    }
  }, [id, navigate, toast, user?.username]);

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    
    let totalAvg = 0;
    
    ratings.forEach(rating => {
      const scores = Object.values(rating.scores);
      const avg = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
      totalAvg += avg;
    });
    
    return totalAvg / ratings.length;
  };

  const handleRatingSubmitted = async () => {
    // Refresh the ratings after submitting a new one
    if (id) {
      const updatedRatings = await getRatingsByCandidate(id);
      setRatings(updatedRatings);
      setHasRated(true);
      
      toast({
        title: "Success",
        description: "Your rating has been saved and will be visible to the admin.",
      });
    }
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
            onClick={() => navigate("/interviewer/dashboard")}
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
                <div className="text-slate-500">Applied:</div>
                <div>
                  {new Date(candidate.appliedAt || new Date()).toLocaleDateString()}
                </div>
                {ratings.length > 0 && (
                  <>
                    <div className="text-slate-500">Avg. Rating:</div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                      {calculateAverageRating().toFixed(1)}
                    </div>
                  </>
                )}
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

        {/* Rating Form */}
        {!hasRated ? (
          <RatingForm
            candidateId={id || ""}
            candidateName={candidate.name}
            interviewer={user?.username || "unknown"}
            onClose={() => navigate("/interviewer/dashboard")}
            onSubmitSuccess={handleRatingSubmitted}
          />
        ) : (
          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center py-4 text-emerald-600">
                <p className="text-lg font-medium">You have already rated this candidate</p>
                <p className="text-slate-500 mt-1">Thank you for your feedback!</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate("/interviewer/dashboard")}
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
