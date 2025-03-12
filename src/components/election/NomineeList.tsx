
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getNominees, getNomineesByPosition, addVote, hasVoted } from '@/lib/db';
import { Nominee, Position, positions } from '@/types/nominee';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Award } from 'lucide-react';

const NomineeList: React.FC = () => {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [filteredNominees, setFilteredNominees] = useState<Nominee[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | ''>('');
  const [voterRegNo, setVoterRegNo] = useState('');
  const [loading, setLoading] = useState(true);
  const [votingStatus, setVotingStatus] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchNominees = async () => {
      try {
        const fetchedNominees = await getNominees();
        setNominees(fetchedNominees);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching nominees:', error);
        toast({
          title: 'Error',
          description: 'Failed to load nominees',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchNominees();
  }, [toast]);

  useEffect(() => {
    if (selectedPosition) {
      const filtered = nominees.filter(nominee => nominee.position === selectedPosition);
      setFilteredNominees(filtered);
    } else {
      setFilteredNominees([]);
    }
  }, [selectedPosition, nominees]);

  useEffect(() => {
    const checkVotingStatus = async () => {
      if (!voterRegNo || !selectedPosition) return;
      
      try {
        const hasAlreadyVoted = await hasVoted(voterRegNo, selectedPosition);
        setVotingStatus(prev => ({
          ...prev,
          [selectedPosition]: hasAlreadyVoted
        }));
      } catch (error) {
        console.error('Error checking voting status:', error);
      }
    };
    
    checkVotingStatus();
  }, [voterRegNo, selectedPosition]);

  const handleVote = async (nomineeId: string) => {
    if (!voterRegNo) {
      toast({
        title: 'Error',
        description: 'Please enter your registration number to vote',
        variant: 'destructive',
      });
      return;
    }

    if (votingStatus[selectedPosition]) {
      toast({
        title: 'Already Voted',
        description: `You have already voted for ${selectedPosition}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await addVote({
        id: uuidv4(),
        nomineeId,
        position: selectedPosition,
        voterRegNo,
        votedAt: new Date(),
      });

      // Update the nominees list
      const updatedNominees = await getNominees();
      setNominees(updatedNominees);
      
      // Update voting status
      setVotingStatus(prev => ({
        ...prev,
        [selectedPosition]: true
      }));

      toast({
        title: 'Success',
        description: 'Your vote has been recorded',
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to record your vote',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Election Nominees</CardTitle>
        <CardDescription>
          View nominees and cast your vote for the Programming Club election
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Your Registration Number</label>
              <Input
                placeholder="Enter your registration number"
                value={voterRegNo}
                onChange={(e) => setVoterRegNo(e.target.value)}
              />
            </div>
            <div className="flex-1">
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
          </div>

          {loading ? (
            <div className="text-center py-8">Loading nominees...</div>
          ) : selectedPosition ? (
            filteredNominees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNominees.map((nominee) => (
                  <Card key={nominee.id} className="overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{nominee.name}</CardTitle>
                          <CardDescription className="mt-1">{nominee.department}</CardDescription>
                        </div>
                        <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-xs">
                          <Award size={14} />
                          <span>{nominee.votes} votes</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Registration No:</span>
                          <span className="font-medium">{nominee.regNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium truncate max-w-[180px]">{nominee.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shift:</span>
                          <span className="font-medium">Shift {nominee.shift}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/20 pt-3">
                      <Button
                        className="w-full"
                        onClick={() => handleVote(nominee.id)}
                        disabled={!voterRegNo || votingStatus[selectedPosition]}
                        variant={votingStatus[selectedPosition] ? "outline" : "default"}
                      >
                        {votingStatus[selectedPosition] ? (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Already Voted
                          </>
                        ) : (
                          'Vote'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">No nominees found for {selectedPosition}</div>
            )
          ) : (
            <div className="text-center py-8">Select a position to view nominees</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NomineeList;
