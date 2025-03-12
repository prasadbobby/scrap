"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, POM, TestCase, getProject, getProjectPOMs, getProjectTests, createTests } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectHeader } from '@/components/project/project-header';
import { 
  ArrowRight, Check, File, FileText, Loader2, 
  Play, Plus, RefreshCw, Settings, X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TestsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [poms, setPOMs] = useState<POM[]>([]);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedPOM, setSelectedPOM] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [testCode, setTestCode] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectData = await getProject(id);
        setProject(projectData);
        
        if (projectData.pom_ids?.length) {
          const pomsData = await getProjectPOMs(id);
          setPOMs(pomsData.poms);
          
          if (pomsData.poms.length > 0) {
            setSelectedPOM(pomsData.poms[0].id);
          }
        }
        
        if (projectData.test_ids?.length) {
          const testsData = await getProjectTests(id);
          setTests(testsData.tests);
          
          if (testsData.tests.length > 0) {
            setSelectedTest(testsData.tests[0]);
            // In a real app, would fetch the code content here
            setTestCode(`import unittest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from page_objects import LoginPage

class TestNavigation(unittest.TestCase):
    def setUp(self):
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service)
        self.driver.maximize_window()
        self.page = LoginPage(self.driver)
        
    def tearDown(self):
        self.driver.quit()
        
    def test_page_navigation(self):
        # Navigate to the login page
        self.driver.get("http://example.com/login")
        
        # Verify page is loaded by checking for elements
        self.assertIsNotNone(self.page.username_input)
        self.assertIsNotNone(self.page.password_input)
        self.assertIsNotNone(self.page.login_button)
        
    def test_login_functionality(self):
        # Navigate to the login page
        self.driver.get("http://example.com/login")
        
        # Enter credentials
        self.page.set_username_input("testuser")
        self.page.set_password_input("password123")
        
        # Click login button
        self.page.click_login_button()
        
        # Verify redirect to dashboard
        self.assertEqual(self.driver.current_url, "http://example.com/dashboard")
        
if __name__ == '__main__':
    unittest.main()
`);
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

  const handleGenerateTests = async () => {
    if (!selectedPOM) {
      toast({
        title: "No POM selected",
        description: "Please select a Page Object Model to generate tests from",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setAction('generating-tests');
      const result = await createTests(id, selectedPOM);
      
      toast({
        title: "Tests generated",
        description: "Test cases were created successfully",
      });
      
      // Refresh data
      const projectData = await getProject(id);
      setProject(projectData);
      
      const testsData = await getProjectTests(id);
      setTests(testsData.tests);
      
      if (testsData.tests.length > 0) {
        setSelectedTest(testsData.tests[0]);
        // In a real app, would fetch the actual code here
      }
    } catch (err) {
      console.error('Error generating tests:', err);
      toast({
        title: "Generation failed",
        description: "Failed to generate test cases",
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
      
      <div className="mt-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Test Cases</h2>
          <p className="text-muted-foreground">
            Generate and manage test cases for your UI
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
            onClick={handleGenerateTests}
            disabled={action === 'generating-tests' || poms.length === 0}
          >
            {action === 'generating-tests' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Generate Tests
          </Button>
        </div>
      </div>
      
      {poms.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Page Object Models Available</h3>
              <p className="text-muted-foreground">
                You need to generate a Page Object Model before creating test cases
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/projects/${id}/pom`}>
                  Generate POM First
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : tests.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Generate Test Cases</CardTitle>
            <CardDescription>
              Create automated tests based on your Page Object Models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Select Page Object Model
                </label>
                <Select 
                  value={selectedPOM} 
                  onValueChange={setSelectedPOM}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a POM" />
                  </SelectTrigger>
                  <SelectContent>
                    {poms.map((pom) => (
                      <SelectItem key={pom.id} value={pom.id}>
                        POM {poms.indexOf(pom) + 1} ({pom.elements.length} elements)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleGenerateTests}
                disabled={!selectedPOM || action === 'generating-tests'}
              >
                {action === 'generating-tests' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Generate Test Cases
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Test Cases</CardTitle>
              <CardDescription>Available test scripts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tests.map((test) => (
                  <Button
                    key={test.id}
                    variant={selectedTest?.id === test.id ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedTest(test)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="truncate">{test.name}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleGenerateTests}
                  disabled={action === 'generating-tests'}
                >
                  {action === 'generating-tests' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Generate More Tests
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            {selectedTest ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedTest.name}</CardTitle>
                    <Badge>Python</Badge>
                  </div>
                  <CardDescription>
                    {selectedTest.description || 'Automated test script'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Card>
                    <CardContent className="p-0 overflow-hidden">
                      <SyntaxHighlighter
                        language="python"
                        style={tomorrow}
                        customStyle={{ margin: 0, borderRadius: '0.5rem' }}
                      >
                        {testCode}
                      </SyntaxHighlighter>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline">
                      <File className="mr-2 h-4 w-4" />
                      Download Script
                    </Button>
                    <Button asChild>
                      <Link href={`/projects/${id}/execute`}>
                        Execute Test <Play className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Test Selected</h3>
                  <p className="text-muted-foreground">
                    Select a test from the list to view its code
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