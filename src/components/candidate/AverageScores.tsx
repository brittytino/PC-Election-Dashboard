
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AverageScoresProps {
  scores: {[key: string]: number} | null;
}

export function AverageScores({ scores }: AverageScoresProps) {
  if (!scores) return null;
  
  return (
    <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
      <CardHeader>
        <CardTitle>Average Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(scores).map(([key, value]) => (
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
  );
}
