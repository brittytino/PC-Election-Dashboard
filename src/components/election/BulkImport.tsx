
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { addNominee, getNominees } from '@/lib/db';
import { getYearFromRegNo, Position, Nominee } from '@/types/nominee';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BadgeCheck, AlertCircle } from 'lucide-react';

const BulkImport: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [parsedNominees, setParsedNominees] = useState<Nominee[]>([]);
  const [existingEmails, setExistingEmails] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Sample data that can be used for import
  const sampleData = `NILASHREE G\t23107104@srcas.ac.in\t23107104\t2\tBSC IT
Ayyappadas TV\ttvayyappadas@gmail.com\t24129008\t2\tBSC CT
Dharsini S\t24128017@srcas.ac.in\t24128017\t2\tBSC CS AI DS
Dhananjay R S\t24106078@srcas.ac.in\t24106078\t2\tBSC Computer Science
Sri Thraishika.S\t24128062@srcas.ac.in\t24128062\t2\tBSC CS AI DS
Choudhry\t24107078@srcas.ac.in\t24107078\t2\tBSC IT
Samrutha.S\tsamruthasenthilkumar06@gmail.com\t24127056\t1\tBSC CS DA
KAVIYAN S\tskaviyan004@gmail.com\t24127034\t1\tBSC CS DA
Kavinraj J S\tkaviee2507@gmail.com\t24127033\t1\tBSC CS DA
Sarath P\t23107116@srcas.ac.in\t23107116\t2\tBSC IT
Mathivathani AG\tmathianand1036@gmail.com\t24129029\t2\tBSC CT
Sri Thraishika S\t24128062@srcas.ac.in\t24128062\t2\tBSC CS AI DS
Pravin B\t23127035@srcas.ac.in\t23127035\t1\tBSC CS DA
Kaniskha.C\t23128025@srcas.ac.in\t23128025\t2\tBSC CS AI DS`;

  useEffect(() => {
    const fetchExistingEmails = async () => {
      const nominees = await getNominees();
      setExistingEmails(new Set(nominees.map(nominee => nominee.email.toLowerCase())));
    };
    
    fetchExistingEmails();
  }, []);

  const assignPosition = (shift: number, regNo: string): Position | '' => {
    const year = getYearFromRegNo(regNo);
    
    if (year === 3 && shift === 1) {
      return 'Chairman';
    } else if (year === 3 && shift === 2) {
      return 'Vice Chairman';
    } else if (year === 2 && shift === 1) {
      return 'Secretary';
    } else if (year === 2 && shift === 2) {
      return 'Joint Secretary';
    }
    
    return ''; // No matching position
  };

  const parseNominees = (text: string) => {
    const lines = text.trim().split('\n');
    const nominees: Nominee[] = [];
    
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 5) {
        const [name, email, regNo, shiftStr, department] = parts;
        const shift = parseInt(shiftStr);
        
        if (!isNaN(shift)) {
          const position = assignPosition(shift, regNo);
          
          if (position) {
            nominees.push({
              id: uuidv4(),
              name: name.trim(),
              email: email.trim(),
              regNo: regNo.trim(),
              shift,
              department: department.trim(),
              position,
              votes: 0,
              nominatedAt: new Date()
            });
          }
        }
      }
    }
    
    return nominees;
  };

  const handlePreview = () => {
    if (!importText.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste nominee data first',
        variant: 'destructive',
      });
      return;
    }

    const nominees = parseNominees(importText);
    
    if (nominees.length === 0) {
      toast({
        title: 'Error',
        description: 'No valid nominees found in the input',
        variant: 'destructive',
      });
      return;
    }
    
    setParsedNominees(nominees);
    
    toast({
      title: 'Preview Ready',
      description: `Found ${nominees.length} nominees. Review and confirm import.`,
    });
  };

  const handleImport = async () => {
    if (parsedNominees.length === 0) {
      toast({
        title: 'Error',
        description: 'Please preview nominees first',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      // Filter out nominees with emails that already exist
      const newNominees = parsedNominees.filter(
        nominee => !existingEmails.has(nominee.email.toLowerCase())
      );
      
      if (newNominees.length === 0) {
        toast({
          title: 'Information',
          description: 'All nominees already exist in the system',
        });
        setIsImporting(false);
        return;
      }
      
      // Add each nominee to the database
      for (const nominee of newNominees) {
        await addNominee(nominee);
      }
      
      toast({
        title: 'Success',
        description: `Imported ${newNominees.length} nominees successfully`,
      });
      
      // Update existing emails set
      newNominees.forEach(nominee => {
        existingEmails.add(nominee.email.toLowerCase());
      });
      
      setImportText('');
      setParsedNominees([]);
    } catch (error) {
      console.error('Error importing nominees:', error);
      toast({
        title: 'Error',
        description: 'Failed to import nominees',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleLoadSample = () => {
    setImportText(sampleData);
    setParsedNominees([]);
  };

  const isEmailExists = (email: string) => {
    return existingEmails.has(email.toLowerCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Import Nominees</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm mb-4">
          Paste nominee data in tab-separated format (Name, Email, RegNo, Shift, Department).
          Positions will be automatically assigned based on shift and registration number.
        </p>
        <Textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste nominee data here..."
          className="min-h-[200px] font-mono text-sm"
        />
        
        {parsedNominees.length > 0 && (
          <div className="mt-4 border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Name</TableHead>
                  <TableHead className="w-[20%]">Registration No</TableHead>
                  <TableHead className="w-[15%]">Shift</TableHead>
                  <TableHead className="w-[20%]">Department</TableHead>
                  <TableHead className="w-[15%]">Position</TableHead>
                  <TableHead className="w-[5%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedNominees.map((nominee, index) => (
                  <TableRow key={index} className={isEmailExists(nominee.email) ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">{nominee.name}</TableCell>
                    <TableCell>{nominee.regNo}</TableCell>
                    <TableCell>Shift {nominee.shift}</TableCell>
                    <TableCell>{nominee.department}</TableCell>
                    <TableCell>{nominee.position}</TableCell>
                    <TableCell>
                      {isEmailExists(nominee.email) ? (
                        <div className="flex items-center text-amber-500" title="Already exists">
                          <AlertCircle size={16} />
                        </div>
                      ) : (
                        <div className="flex items-center text-green-500" title="New nominee">
                          <BadgeCheck size={16} />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button variant="outline" onClick={handleLoadSample} className="mr-2">
            Load Sample Data
          </Button>
          <Button variant="secondary" onClick={handlePreview} disabled={!importText.trim()}>
            Preview
          </Button>
        </div>
        <Button 
          onClick={handleImport} 
          disabled={isImporting || parsedNominees.length === 0}
        >
          {isImporting ? 'Importing...' : 'Import Nominees'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BulkImport;
