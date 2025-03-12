
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: "Success",
          description: "Login successful!",
        });
        // Redirect based on role
        const dashboardPath = username === 'admin' ? '/admin/dashboard' : '/interviewer/dashboard';
        navigate(dashboardPath);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid credentials",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sri Ramakrishna College Programming Club
            </CardTitle>
            <CardDescription className="text-center">
              Login to access the interview and election system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="accounts">Available Accounts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Username or Reg. No."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="accounts" className="space-y-4">
                <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-800">Admin Account</h3>
                  <p className="text-sm text-blue-700 mt-1">Username: admin</p>
                  <p className="text-sm text-blue-700">Password: admin123</p>
                </div>
                
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <h3 className="font-semibold text-green-800">Club Interviewer</h3>
                  <p className="text-sm text-green-700 mt-1">Username: club</p>
                  <p className="text-sm text-green-700">Password: club123</p>
                </div>
                
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                  <h3 className="font-semibold text-amber-800">Student Accounts</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Students can log in using their registration number (e.g., 23107104, 24129008, etc.)
                  </p>
                  <p className="text-sm text-amber-700">
                    Password for all student accounts: password123
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-xs text-center text-gray-500 w-full">
              Click "Available Accounts" to see login credentials
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Login;
