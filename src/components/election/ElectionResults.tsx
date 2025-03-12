
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getNomineesByPosition } from '@/lib/db';
import { Nominee, Position, positions } from '@/types/nominee';
import { useToast } from '@/hooks/use-toast';
import { Award, Medal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ElectionResults: React.FC = () => {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | ''>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNominees = async () => {
      if (!selectedPosition) return;
      
      setLoading(true);
      try {
        const fetchedNominees = await getNomineesByPosition(selectedPosition);
        // Sort by votes in descending order
        const sortedNominees = fetchedNominees.sort((a, b) => b.votes - a.votes);
        setNominees(sortedNominees);
      } catch (error) {
        console.error('Error fetching nominees:', error);
        toast({
          title: 'Error',
          description: 'Failed to load election results',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNominees();
  }, [selectedPosition, toast]);

  const getChartData = () => {
    return nominees.map(nominee => ({
      name: nominee.name,
      votes: nominee.votes,
      department: nominee.department
    }));
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return "text-yellow-500"; // Gold
      case 1: return "text-gray-400";   // Silver
      case 2: return "text-amber-700";  // Bronze
      default: return "text-gray-300";  // Others
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Election Results</CardTitle>
        <CardDescription>
          View current results of the Programming Club election
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="max-w-xs">
            <label className="block text-sm font-medium mb-2">Select Position</label>
            <Select onValueChange={(value) => setSelectedPosition(value as Position)}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading results...</div>
          ) : selectedPosition && nominees.length > 0 ? (
            <div className="space-y-8">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Vote Results for {selectedPosition}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium mb-3">Leaderboard</h4>
                    <ul className="space-y-3">
                      {nominees.map((nominee, index) => (
                        <li key={nominee.id} className="flex items-center gap-3 p-3 bg-background rounded-md shadow-sm">
                          <span className={`flex items-center justify-center h-8 w-8 rounded-full ${getMedalColor(index)} bg-muted`}>
                            {index < 3 ? <Medal size={16} /> : index + 1}
                          </span>
                          <div className="flex-grow">
                            <div className="font-medium">{nominee.name}</div>
                            <div className="text-xs text-muted-foreground">{nominee.department}</div>
                          </div>
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                            <Award size={16} />
                            <span className="font-medium">{nominee.votes}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="h-[300px]">
                    <h4 className="text-md font-medium mb-3">Vote Distribution</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${value} votes`, 
                            'Votes'
                          ]}
                          labelFormatter={(value) => `${value}`}
                        />
                        <Bar dataKey="votes" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedPosition ? (
            <div className="text-center py-8">No results found for {selectedPosition}</div>
          ) : (
            <div className="text-center py-8">Select a position to view results</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ElectionResults;
