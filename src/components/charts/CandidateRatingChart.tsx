
import { useEffect, useState } from "react";
import { getRatingsByCandidate } from "@/lib/db";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CandidateRatingChartProps {
  candidateId: string;
  candidateName: string;
}

export function CandidateRatingChart({
  candidateId,
  candidateName,
}: CandidateRatingChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const ratings = await getRatingsByCandidate(candidateId);
        
        if (ratings.length === 0) {
          setError("No ratings found for this candidate");
          setLoading(false);
          return;
        }

        // Calculate average scores for each parameter
        const averages = {
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

        ratings.forEach((rating) => {
          Object.keys(averages).forEach((key) => {
            averages[key as keyof typeof averages] += 
              rating.scores[key as keyof typeof rating.scores] / ratings.length;
          });
        });

        // Format data for the radar chart
        const data = Object.entries(averages).map(([key, value]) => ({
          parameter: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
          score: parseFloat(value.toFixed(1)),
          fullMark: 5,
        }));

        setChartData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ratings:", error);
        setError("Failed to load ratings data");
        setLoading(false);
      }
    };

    fetchRatings();
  }, [candidateId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          Loading candidate ratings...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
      <CardHeader>
        <CardTitle>Rating Analysis: {candidateName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis
                dataKey="parameter"
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
