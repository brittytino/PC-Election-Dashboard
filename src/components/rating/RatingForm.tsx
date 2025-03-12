
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { addRating } from "@/lib/db";

interface Rating {
  presentation: number;
  communication: number;
  technicalSkills: number;
  problemSolving: number;
  teamwork: number;
  leadership: number;
  initiative: number;
  attitude: number;
  adaptability: number;
  overallImpression: number;
}

interface RatingFormProps {
  candidateId: string;
  candidateName: string;
  interviewer: string;
  onClose?: () => void;
  onSubmitSuccess?: () => void;
}

export function RatingForm({ 
  candidateId, 
  candidateName, 
  interviewer, 
  onClose,
  onSubmitSuccess 
}: RatingFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [remarks, setRemarks] = useState("");
  const [ratings, setRatings] = useState<Rating>({
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
  });

  const ratingParams = [
    { id: "presentation", label: "Presentation" },
    { id: "communication", label: "Communication" },
    { id: "technicalSkills", label: "Technical Skills" },
    { id: "problemSolving", label: "Problem Solving" },
    { id: "teamwork", label: "Teamwork" },
    { id: "leadership", label: "Leadership" },
    { id: "initiative", label: "Initiative" },
    { id: "attitude", label: "Attitude" },
    { id: "adaptability", label: "Adaptability" },
    { id: "overallImpression", label: "Overall Impression" },
  ] as const;

  const handleRatingChange = (param: keyof Rating, value: number) => {
    setRatings((prev) => ({ ...prev, [param]: value }));
  };

  const renderStars = (param: keyof Rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => handleRatingChange(param, star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= ratings[param]
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleSubmit = async () => {
    // Check if all parameters have been rated
    const hasIncompleteRatings = Object.values(ratings).some(
      (rating) => rating === 0
    );

    if (hasIncompleteRatings) {
      toast({
        title: "Incomplete Rating",
        description: "Please rate all parameters before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      // Add rating to IndexedDB
      await addRating({
        id: crypto.randomUUID(),
        candidateId,
        interviewer,
        scores: { ...ratings },
        remarks,
        ratedAt: new Date(),
      });

      toast({
        title: "Rating Submitted",
        description: "Candidate rating has been saved successfully",
      });

      // Call the success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      if (onClose) {
        onClose();
      } else {
        navigate("/interviewer/dashboard");
      }
    } catch (error) {
      console.error("Error saving rating:", error);
      toast({
        title: "Error",
        description: "Failed to save rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  const charactersLeft = 500 - remarks.length;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Rate Candidate</h2>
        <p className="text-slate-600">
          Rating: <span className="font-medium">{candidateName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ratingParams.map(({ id, label }) => (
          <Card key={id} className="bg-white/50 backdrop-blur-sm border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderStars(id as keyof Rating)}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Additional Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your comments about the candidate (max 500 characters)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value.substring(0, 500))}
            className="h-32"
          />
          <div className="mt-2 text-sm text-slate-500 text-right">
            {charactersLeft} characters left
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Submit Rating</Button>
      </div>
    </div>
  );
}
