"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, TestCase, TestExecution, getProject, getProjectTests, getProjectExecutions, executeTest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectHeader } from '@/components/project/project-header';
import { 
  AlertCircle, ArrowRight, Calendar, Check, Clock, FileText, 
  Loader2, Play, RefreshCw, Terminal, X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ExecutionPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [selectedTest, setSelectedTest] = useState('');
  const [currentExecution, setCurrentExecution] = useState<TestExecution | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectData = await getProject(id);
        setProject(projectData);
        
        if (projectData.test_ids?.length) {
          const testsData = await getProjectTests(id);
          setTests(testsData.tests);
          
          if (testsData.tests.length > 0) {
            setSelectedTest(testsData.tests[0].id);
          }
          
          // Fetch past executions
          try {
            const executionsData = await getProjectExecutions(id);
            setExecutions(executionsData.executions);
            
            if (executionsData.executions.length > 0) {
              setCurrentExecution(executionsData.executions[0]);
            }
          } catch (execErr) {
            console.error('Error fetching executions:', execErr);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleExecuteTest = async () => {
    if (!selectedTest) {
      toast({
        title: "No test selected",
        description: "Please select a test to execute",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setExecuting(true);
      
      // Start execution
      toast({
        title: "Executing test",
        description: "Test execution has started...",
      });
      
      const result = await executeTest(id, selectedTest);
      
      // Simulate delay for demo (remove in production)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get updated executions
      const executionsData = await getProjectExecutions(id);
      setExecutions(executionsData.executions);
      
      // Set current execution to the one just created
      const newExecution = executionsData.executions.find(
        exec => exec.id === result.execution_id
      );
      
      if (newExecution) {
        setCurrentExecution(newExecution);
        
        toast({
          title: `Test ${newExecution.status === 'SUCCESS' ? 'passed' : 'failed'}`,
          description: `Execution completed with status: ${newExecution.status}`,
          variant: newExecution.status === 'SUCCESS' ? 'default' : 'destructive',
        });
      }
    } catch (err) {
      console.error('Error executing test:', err);
      toast({
        title: "Execution failed",
        description: "Failed to execute test",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container py-10">
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          {error || 'Project not found'}
        </div>
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <ProjectHeader project={project} />
      
      <div className="mt-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Test Execution</h2>
          <p className="text-muted-foreground">
            Run and monitor test execution
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/projects/${id}`)}
          >
            Back to Project
          </Button>
          <Button 
            variant="outline"
            onClick={async () => {
              try {
                const executionsData = await getProjectExecutions(id);
                setExecutions(executionsData.executions);
                toast({
                  title: "Refreshed",
                  description: "Execution history has been updated",
                });
              } catch (err) {
                toast({
                  title: "Refresh failed",
                  description: "Failed to refresh execution history",
                  variant: "destructive",
                });
              }
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {tests.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Play className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Test Cases Available</h3>
              <p className="text-muted-foreground">
                You need to generate test cases before executing them
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/projects/${id}/tests`}>
                  Generate Tests First
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Run Tests</CardTitle>
              <CardDescription>
                Execute a test case against your UI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select Test Case
                  </label>
                  <Select 
                    value={selectedTest} 
                    onValueChange={setSelectedTest}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a test" />
                    </SelectTrigger>
                    <SelectContent>
                      {tests.map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleExecuteTest}
                  disabled={!selectedTest || executing}
                >
                  {executing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Test
                    </>
                  )}
                </Button>
              </div>
              
              {executions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Recent Executions</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {executions.slice(0, 5).map((exec) => (
                      <Button
                        key={exec.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setCurrentExecution(exec)}
                      >
                        {exec.status === 'SUCCESS' ? (
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                        ) : exec.status === 'RUNNING' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <X className="mr-2 h-4 w-4 text-red-500" />
                        )}
                        <span className="truncate">
                          {tests.find(t => t.id === exec.test_id)?.name || 'Unknown Test'}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            {currentExecution ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Execution Results</CardTitle>
                    <Badge variant={
                      currentExecution.status === 'SUCCESS' ? 'default' : 
                      currentExecution.status === 'RUNNING' ? 'outline' : 
                      'destructive'
                    }>
                      {currentExecution.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Test: {tests.find(t => t.id === currentExecution.test_id)?.name || 'Unknown Test'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2 text-sm">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date().toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            ID: {currentExecution.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3 space-y-3">
                        <div>
                          <h3 className="text-sm font-medium mb-1">Test Results</h3>
                          <div className="flex items-center">
                            <Progress
                              value={
                                currentExecution.status === 'SUCCESS' ? 100 :
                                currentExecution.status === 'FAILURE' ? 100 :
                                currentExecution.status === 'RUNNING' ? 60 : 0
                              }
                              className="h-2"
                            />
                            <span className="ml-2 text-sm">
                              {currentExecution.status === 'SUCCESS' ? (
                                <span className="text-green-500">Passed</span>
                              ) : currentExecution.status === 'FAILURE' ? (
                                <span className="text-red-500">Failed</span>
                              ) : (
                                <span>In Progress</span>
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {currentExecution.result.tests && currentExecution.result.tests.length > 0 ? (
                          <div>
                            <h3 className="text-sm font-medium mb-1">Test Cases</h3>
                            <div className="space-y-1">
                              {currentExecution.result.tests.map((test: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between text-sm p-1.5 rounded-md bg-muted"
                                >
                                  <span>{test.name}</span>
                                  <Badge variant={
                                    test.status === 'PASSED' ? 'default' : 
                                    test.status === 'RUNNING' ? 'outline' : 
                                    'destructive'
                                  }>
                                    {test.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          currentExecution.result.log && (
                            <div>
                              <h3 className="text-sm font-medium mb-1">Execution Log</h3>
                              <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                                <pre className="text-xs font-mono">
                                  {currentExecution.result.log}
                                </pre>
                              </ScrollArea>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" asChild>
                        <Link href={currentExecution.log_path} target="_blank">
                          <Terminal className="mr-2 h-4 w-4" />
                          View Full Log
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href={`/projects/${id}/tests`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Test Code
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Execution Data</h3>
                  <p className="text-muted-foreground">
                    Run a test to see execution results here
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}