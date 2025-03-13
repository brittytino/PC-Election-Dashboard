
import { User, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CandidateProfileProps {
  candidate: any;
  overallAverage: number;
}

export function CandidateProfile({ candidate, overallAverage }: CandidateProfileProps) {
  return (
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
            {overallAverage.toFixed(1)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
