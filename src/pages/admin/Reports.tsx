
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "@/components/ui/search-input";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [positionData, setPositionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching report data
    const fetchReportData = async () => {
      try {
        // In a real app, this would come from IndexedDB
        // Mock data
        setTimeout(() => {
          setDepartmentData([
            { name: "Engineering", avgScore: 4.2, candidates: 15 },
            { name: "Marketing", avgScore: 3.8, candidates: 8 },
            { name: "Sales", avgScore: 4.0, candidates: 12 },
            { name: "HR", avgScore: 4.5, candidates: 5 },
            { name: "Finance", avgScore: 3.6, candidates: 7 },
          ]);

          setPositionData([
            { name: "Software Engineer", avgScore: 4.3, candidates: 12 },
            { name: "UI/UX Designer", avgScore: 4.1, candidates: 6 },
            { name: "Product Manager", avgScore: 3.9, candidates: 8 },
            { name: "Sales Executive", avgScore: 4.0, candidates: 10 },
            { name: "HR Specialist", avgScore: 4.5, candidates: 5 },
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          title: "Error",
          description: "Failed to load report data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchReportData();
  }, [toast]);

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    toast({
      title: "Export Started",
      description: "Your report will be downloaded shortly",
    });
    
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Report has been downloaded successfully",
      });
    }, 1500);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-lg text-slate-600">Loading report data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
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
              Candidate Reports
            </h1>
          </div>
          <Button onClick={handleExportCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 w-full max-w-sm">
          <SearchInput
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Department Stats */}
        <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#3b82f6" name="Avg. Score" />
                  <Bar
                    dataKey="candidates"
                    fill="#10b981"
                    name="Candidates"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Position Stats */}
        <Card className="bg-white/50 backdrop-blur-sm border border-slate-200">
          <CardHeader>
            <CardTitle>Position Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={positionData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#8884d8" name="Avg. Score" />
                  <Bar
                    dataKey="candidates"
                    fill="#82ca9d"
                    name="Candidates"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
