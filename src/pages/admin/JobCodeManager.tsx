import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Download, 
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useJobCodes } from "@/hooks/useJobCodes";

export default function JobCodeManager() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any>(null);
  const [newCodes, setNewCodes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { codes, loading: codesLoading, fetchCodes, saveCodes, deleteCode } = useJobCodes(jobId);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    if (!jobId) return;

    try {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);
    } catch (error: any) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCodes = (count: number) => {
    const codes = [];
    const prefix = job?.title.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 3) || 'TAS';
    
    for (let i = 0; i < count; i++) {
      const randomNum = Math.floor(Math.random() * 9000) + 1000;
      codes.push(`${prefix}${randomNum}`);
    }
    
    return codes;
  };

  const handleGenerateCodes = (count?: number) => {
    const codeCount = count || job?.vacancy || 10;
    const generatedCodes = generateCodes(codeCount);
    setNewCodes(generatedCodes.join('\n'));
  };

  const handleGenerateForVacancy = () => {
    if (job?.vacancy) {
      handleGenerateCodes(job.vacancy);
      toast.success(`Generated ${job.vacancy} codes based on job vacancy`);
    }
  };

  const handleSaveCodes = async () => {
    if (!newCodes.trim()) {
      toast.error("Please add some codes");
      return;
    }

    setIsGenerating(true);
    try {
      const codeList = newCodes.split('\n').filter(code => code.trim());
      const success = await saveCodes(codeList);
      
      if (success) {
        setNewCodes("");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    await deleteCode(codeId);
  };

  const handleDownloadCodes = () => {
    const unusedCodes = codes.filter(code => !code.used);
    const codeText = unusedCodes.map(code => code.code).join('\n');
    
    const blob = new Blob([codeText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job?.title || 'job'}_codes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Codes downloaded successfully");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!job) {
    return <div className="p-6">Job not found</div>;
  }

  const unusedCodes = codes.filter(code => !code.used);
  const usedCodes = codes.filter(code => code.used);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/jobs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Codes</h1>
          <p className="text-muted-foreground mt-1">{job.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Generation */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Codes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleGenerateForVacancy} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate for Vacancy ({job?.vacancy || 0})
                </Button>
                <Button onClick={() => handleGenerateCodes(10)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate 10 Codes
                </Button>
                <Button onClick={handleDownloadCodes} disabled={unusedCodes.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Unused ({unusedCodes.length})
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codes">Codes (one per line)</Label>
                <Textarea
                  id="codes"
                  placeholder="Enter codes, one per line..."
                  value={newCodes}
                  onChange={(e) => setNewCodes(e.target.value)}
                  rows={8}
                />
              </div>

              <Button onClick={handleSaveCodes} disabled={isGenerating || !newCodes.trim()}>
                {isGenerating ? "Saving..." : "Save Codes"}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Codes */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Unused Codes */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Unused Codes ({unusedCodes.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {unusedCodes.map((code) => (
                      <div key={code.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-mono text-sm">{code.code}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => copyCode(code.code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteCode(code.id)}>
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Used Codes */}
                {usedCodes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Used Codes ({usedCodes.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {usedCodes.map((code) => (
                        <div key={code.id} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                          <span className="font-mono text-sm text-gray-500">{code.code}</span>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Codes</span>
                <span className="font-medium">{codes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium text-green-600">{unusedCodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Used</span>
                <span className="font-medium text-red-600">{usedCodes.length}</span>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Codes are automatically verified when users submit tasks. Each code can only be used once.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
