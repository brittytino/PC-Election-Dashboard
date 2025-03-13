
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";
import { exportData, importData } from "@/services/storageService";

export function DataManagement() {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  
  const handleExport = () => {
    try {
      const data = exportData();
      
      // Create a blob and download it
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Data has been exported successfully"
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not export data",
        variant: "destructive"
      });
    }
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importData(content);
        
        if (success) {
          toast({
            title: "Import Complete",
            description: "Data has been imported successfully. You may need to refresh the page."
          });
        } else {
          toast({
            title: "Import Failed",
            description: "Invalid data format",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import Failed",
          description: "Could not import data",
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
        // Reset the file input
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "Could not read the file",
        variant: "destructive"
      });
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 mb-4">
            Export or import system data. This allows you to backup your data or restore from a previous export.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            
            <div className="relative">
              <input
                type="file"
                id="import-data"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button 
                variant="outline" 
                disabled={isImporting}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? "Importing..." : "Import Data"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
