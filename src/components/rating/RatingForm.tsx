
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
  visionAndMission: number;
  achievements: number;
  leadership: number;
  problemSolving: number;
  teamwork: number;
  creativityAndInnovation: number;
  motivationAndPassion: number;
  professionalism: number;
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
    visionAndMission: 0,
    achievements: 0,
    leadership: 0,
    problemSolving: 0,
    teamwork: 0,
    creativityAndInnovation: 0,
    motivationAndPassion: 0,
    professionalism: 0,
  });

  const ratingParams = [
    { id: "presentation", label: "Presentation Skills" },
    { id: "communication", label: "Communication Skills" },
    { id: "visionAndMission", label: "Vision & Mission" },
    { id: "achievements", label: "Achievements" },
    { id: "leadership", label: "Leadership Skills" },
    { id: "problemSolving", label: "Problem-Solving Ability" },
    { id: "teamwork", label: "Teamwork" },
    { id: "creativityAndInnovation", label: "Creativity & Innovation" },
    { id: "motivationAndPassion", label: "Motivation & Passion" },
    { id: "professionalism", label: "Professionalism" },
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
      // Add rating to storage
      await addRating({
        id: crypto.randomUUID(),
        candidateId,
        interviewer,
        scores: ratings,
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
