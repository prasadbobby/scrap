"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, getProject, scanProject, createPOM } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProjectHeader } from '@/components/project/project-header';
import { 
  Code, FileCode, FileCog, FileText, Loader2, Play, 
  RefreshCw, ScrollText, Settings 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getProject(id);
        setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleScanCode = async () => {
    try {
      setAction('scanning');
      const result = await scanProject(id);
      toast({
        title: "Source code scanned",
        description: `Found ${result.elements.length} UI elements`,
      });
    } catch (err) {
      console.error('Error scanning code:', err);
      toast({
        title: "Scan failed",
        description: "Failed to scan source code",
        variant: "destructive",
      });
    } finally {
      setAction(null);
    }
  };

  const handleGeneratePOM = async () => {
    try {
      setAction('generating-pom');
      const result = await createPOM(id);
      toast({
        title: "POM generated",
        description: "Page Object Model created successfully",
      });
      
      // Refresh project data
      const updatedProject = await getProject(id);
      setProject(updatedProject);
    } catch (err) {
      console.error('Error generating POM:', err);
      toast({
        title: "Generation failed",
        description: "Failed to generate Page Object Model",
        variant: "destructive",
      });
    } finally {
      setAction(null);
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
      
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pom">Page Objects</TabsTrigger>
          <TabsTrigger value="tests">Test Cases</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Source code information and project configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Name</h3>
                    <p className="text-sm text-muted-foreground">{project.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Source File</h3>
                    <p className="text-sm text-muted-foreground">{project.source_file}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium">Page Object Models</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.pom_ids?.length || 0} POMs generated
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push(`/projects/${id}/pom`)}
                      disabled={!project.pom_ids?.length}
                    >
                      View POMs
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium">Test Cases</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.test_ids?.length || 0} tests created
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push(`/projects/${id}/tests`)}
                      disabled={!project.test_ids?.length}
                    >
                      View Tests
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Generate and manage test artifacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  onClick={handleScanCode}
                  disabled={action === 'scanning'}
                >
                  {action === 'scanning' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Code className="mr-2 h-4 w-4" />
                  )}
                  Scan Source Code
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  onClick={handleGeneratePOM}
                  disabled={action === 'generating-pom'}
                >
                  {action === 'generating-pom' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileCog className="mr-2 h-4 w-4" />
                  )}
                  Generate Page Objects
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  onClick={() => router.push(`/projects/${id}/tests`)}
                  disabled={!project.pom_ids?.length}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Test Cases
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  onClick={() => router.push(`/projects/${id}/execute`)}
                  disabled={!project.test_ids?.length}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Execute Tests
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pom" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Page Object Models</CardTitle>
                <CardDescription>
                  View and manage page objects generated from your UI code
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/projects/${id}/pom`}>View All POMs</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {!project.pom_ids?.length ? (
                <div className="text-center py-12">
                  <FileCode className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No POMs generated yet</h3>
                  <p className="text-muted-foreground">
                    Generate page objects to create a structured representation of your UI
                  </p>
                  <Button className="mt-4" onClick={handleGeneratePOM}>
                    <FileCog className="mr-2 h-4 w-4" /> Generate POM
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Badge className="mb-4">
                    {project.pom_ids.length} POMs Available
                  </Badge>
                  <p className="text-muted-foreground mb-4">
                    Page Object Models have been generated for your UI components
                  </p>
                  <Button asChild>
                    <Link href={`/projects/${id}/pom`}>
                      <ScrollText className="mr-2 h-4 w-4" /> View Page Objects
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tests" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Test Cases</CardTitle>
                <CardDescription>
                  Manage and run test cases generated from page objects
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/projects/${id}/tests`}>View All Tests</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {!project.test_ids?.length ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No test cases created yet</h3>
                  <p className="text-muted-foreground">
                    Generate test cases based on your page objects
                  </p>
                  <Button 
                    className="mt-4" 
                    asChild
                    disabled={!project.pom_ids?.length}
                  >
                    <Link href={`/projects/${id}/tests`}>
                      <FileText className="mr-2 h-4 w-4" /> Create Tests
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Badge className="mb-4">
                    {project.test_ids.length} Tests Available
                  </Badge>
                  <p className="text-muted-foreground mb-4">
                    Test cases have been generated for your UI components
                  </p>
                  <Button asChild>
                    <Link href={`/projects/${id}/tests`}>
                      <FileText className="mr-2 h-4 w-4" /> View Test Cases
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="execution" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Test Execution</CardTitle>
                <CardDescription>
                  Run and monitor test execution
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/projects/${id}/execute`}>Execute Tests</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Play className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Run Test Cases</h3>
                <p className="text-muted-foreground">
                  Execute tests against your UI to validate functionality
                </p>
                <Button 
                  className="mt-4" 
                  asChild
                  disabled={!project.test_ids?.length}
                >
                  <Link href={`/projects/${id}/execute`}>
                    <Play className="mr-2 h-4 w-4" /> Execute Tests
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}