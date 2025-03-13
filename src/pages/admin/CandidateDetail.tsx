
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CandidateRatingChart } from "@/components/charts/CandidateRatingChart";
import { CandidateProfile } from "@/components/candidate/CandidateProfile";
import { RatingsList } from "@/components/candidate/RatingsList";
import { AverageScores } from "@/components/candidate/AverageScores";
import { calculateAverageScores, calculateOverallAverage } from "@/components/candidate/ScoreCalculator";
import { ArrowLeft } from "lucide-react";
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-lg text-slate-600">Loading candidate details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const overallAverage = calculateOverallAverage(ratings);
  const averageScores = calculateAverageScores(ratings);

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
          <CandidateProfile 
            candidate={candidate} 
            overallAverage={overallAverage}
          />

          <div className="md:col-span-2">
            <CandidateRatingChart 
              candidateId={id || ""} 
              candidateName={candidate.name} 
            />
          </div>
        </div>

        {/* Ratings List */}
        <RatingsList ratings={ratings} />

        {/* Detailed Scores */}
        {ratings.length > 0 && (
          <AverageScores scores={averageScores} />
        )}
      </div>
    </DashboardLayout>
  );
}
