
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RatingsListProps {
  ratings: any[];
}

export function RatingsList({ ratings }: RatingsListProps) {
  return (
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
                const avgScore = scores.reduce((sum: number, score: any) => sum + Number(score), 0) / scores.length;
                
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
  );
}
