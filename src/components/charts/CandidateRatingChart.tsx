
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { getRatingsByCandidate } from "@/lib/db";

interface CandidateRatingChartProps {
  candidateId: string;
  candidateName: string;
}

export function CandidateRatingChart({ candidateId, candidateName }: CandidateRatingChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all ratings for this candidate
        const ratings = await getRatingsByCandidate(candidateId);
        
        if (ratings.length === 0) {
          setChartData([]);
          setLoading(false);
          return;
        }
        
        // Calculate average for each parameter
        const paramCounts: {[key: string]: {sum: number, count: number}} = {};
        
        // Initialize all parameters
        const paramLabels = {
          presentation: "Presentation Skills",
          communication: "Communication Skills",
          visionAndMission: "Vision & Mission",
          achievements: "Achievements",
          leadership: "Leadership Skills",
          problemSolving: "Problem-Solving",
          teamwork: "Teamwork",
          creativityAndInnovation: "Creativity",
          motivationAndPassion: "Motivation",
          professionalism: "Professionalism",
        };
        
        Object.keys(paramLabels).forEach(param => {
          paramCounts[param] = { sum: 0, count: 0 };
        });
        
        // Sum up ratings
        ratings.forEach(rating => {
          Object.entries(rating.scores).forEach(([param, score]) => {
            if (paramCounts[param]) {
              paramCounts[param].sum += Number(score);
              paramCounts[param].count++;
            }
          });
        });
        
        // Calculate averages and format for chart
        const data = Object.entries(paramCounts).map(([param, { sum, count }]) => ({
          parameter: paramLabels[param as keyof typeof paramLabels],
          value: count > 0 ? sum / count : 0,
          fullMark: 5,
        }));
        
        setChartData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching rating data for chart:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [candidateId]);

  return (
    <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
      <CardHeader>
        <CardTitle>Rating Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-slate-500">Loading chart data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-slate-500">No ratings available yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="parameter" />
              <Radar name={candidateName} dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
