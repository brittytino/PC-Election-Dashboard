import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCandidate, getRatingsByCandidate } from "@/lib/db";
import { RatingForm } from "@/components/rating/RatingForm";

export default function CandidateRating() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<any | null>(null);
  const [existingRating, setExistingRating] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          navigate("/interviewer/dashboard");
          return;
        }

        // Check if user is authenticated
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to rate candidates",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        // Fetch candidate
        const candidateData = getCandidate(id);
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
        
        // Check if candidate has already been rated by this interviewer
        const candidateRatings = await getRatingsByCandidate(id);
        const userRating = candidateRatings.find(rating => rating.interviewer === user.username);
        
        if (userRating) {
          setExistingRating(userRating);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Could not load candidate details",
          variant: "destructive",
        });
        navigate("/interviewer/dashboard");
      }
    };

    fetchData();
  }, [id, navigate, toast, user]);

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
            Back to Dashboard
          </Button>
        </div>

        {existingRating ? (
          <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-center flex-col gap-4 py-8">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Rating Already Submitted</h2>
              <p className="text-slate-600 text-center max-w-md">
                You have already rated this candidate. You can view all your ratings from the dashboard.
              </p>
              <Button 
                className="mt-4"
                onClick={() => navigate("/interviewer/dashboard")}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <RatingForm
            candidateId={id || ""}
            candidateName={candidate?.name || ""}
            interviewer={user?.username || ""}
            onClose={() => navigate("/interviewer/dashboard")}
            onSubmitSuccess={() => {
              // This will be called after successful submission
              navigate("/interviewer/dashboard");
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}