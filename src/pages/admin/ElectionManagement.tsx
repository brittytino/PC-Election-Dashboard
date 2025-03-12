
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NomineeForm from '@/components/forms/NomineeForm';
import NomineeList from '@/components/election/NomineeList';
import ElectionResults from '@/components/election/ElectionResults';
import BulkImport from '@/components/election/BulkImport';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ElectionManagement = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-4">
        <Link 
          to="/admin/dashboard" 
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Programming Club Election Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage candidates and view results for the Sri Ramakrishna College of Arts and Science programming club elections
        </p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="vote">
          <TabsList className="mb-6">
            <TabsTrigger value="vote">Vote</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="add">Add Nominee</TabsTrigger>
            <TabsTrigger value="import">Bulk Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vote" className="mt-0">
            <NomineeList />
          </TabsContent>
          
          <TabsContent value="results" className="mt-0">
            <ElectionResults />
          </TabsContent>
          
          <TabsContent value="add" className="mt-0">
            <div className="flex justify-center">
              <NomineeForm />
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="mt-0">
            <BulkImport />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ElectionManagement;
