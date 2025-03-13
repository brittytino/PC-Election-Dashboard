
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Index() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect authenticated users to their dashboard
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/interviewer/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Sri Ramakrishna College Programming Club
          </CardTitle>
          <CardDescription>
            Interview and Election Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
            <h3 className="font-medium text-blue-800">100% Offline System</h3>
            <p className="text-sm text-blue-700 mt-2">
              This system works entirely offline. All data is stored in your browser's local storage.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate("/login")} size="lg" className="w-full">
            Login to Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
