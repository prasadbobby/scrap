"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, POM, getProject, getProjectPOMs, createPOM } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/project/project-header';
import { ElementsTree } from '@/components/project/elements-tree';
import { 
  FileCode, FileCog, FileText, Loader2, Play, 
  Plus, RefreshCw, Search, Code, ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function POMPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [poms, setPOMs] = useState<POM[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedPOM, setSelectedPOM] = useState<POM | null>(null);
  const [activeTab, setActiveTab] = useState('elements');

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
            setSelectedPOM(pomsData.poms[0]);
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

  const handleGeneratePOM = async () => {
    try {
      setAction('generating-pom');
      const result = await createPOM(id);
      toast({
        title: "POM generated",
        description: "Page Object Model created successfully",
      });
      
      // Refresh data
      const projectData = await getProject(id);
      setProject(projectData);
      
      const pomsData = await getProjectPOMs(id);
      setPOMs(pomsData.poms);
      
      if (pomsData.poms.length > 0) {
        setSelectedPOM(pomsData.poms[0]);
      }
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
      
      <div className="mt-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Page Object Models</h2>
          <p className="text-muted-foreground">
            View and manage page objects extracted from your UI
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
            onClick={handleGeneratePOM}
            disabled={action === 'generating-pom'}
          >
            {action === 'generating-pom' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Generate POM
          </Button>
        </div>
      </div>
      
      {poms.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Available POMs</CardTitle>
              <CardDescription>Select a POM to view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {poms.map((pom) => (
                  <Button
                    key={pom.id}
                    variant={selectedPOM?.id === pom.id ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedPOM(pom)}
                  >
                    <FileCode className="mr-2 h-4 w-4" />
                    Page Objects {poms.indexOf(pom) + 1}
                  </Button>
                ))}
              </div>
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleGeneratePOM}
                  disabled={action === 'generating-pom'}
                >
                  {action === 'generating-pom' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Generate New POM
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            {selectedPOM ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>POM Details</CardTitle>
                    <Badge>{selectedPOM.elements.length} Elements</Badge>
                  </div>
                  <CardDescription>
                    Page Object Model with element selectors and properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="elements">Elements Tree</TabsTrigger>
                      <TabsTrigger value="code">Generated Code</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="elements" className="mt-4">
                      <ElementsTree elements={selectedPOM.elements} />
                    </TabsContent>
                    
                    <TabsContent value="code" className="mt-4">
                      <Card>
                        <CardContent className="p-0 overflow-hidden">
                          <SyntaxHighlighter
                            language="python"
                            style={tomorrow}
                            customStyle={{ margin: 0, borderRadius: '0.5rem' }}
                          >
                            {`from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        
    def find_element(self, selector, selector_type):
        # Implementation details...
        pass
        
    def click(self, selector, selector_type):
        element = self.find_element(selector, selector_type)
        element.click()
        
    def input_text(self, selector, selector_type, text):
        element = self.find_element(selector, selector_type)
        element.clear()
        element.send_keys(text)
        
# Generated Page Objects
${selectedPOM.elements
  .filter(e => e.type === 'page')
  .map(page => `
class ${page.name}(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        
    # Elements and methods for ${page.name}
    ${selectedPOM.elements
      .filter(e => e.parent_id === page.id)
      .map(elem => `
    def ${elem.name.replace('-', '_')}(self):
        return self.find_element('${elem.selector}', '${elem.selector_type}')`).join('')}
`).join('')}
`}
                          </SyntaxHighlighter>
                        </CardContent>
                      </Card>
                      <div className="mt-4 flex justify-end">
                        <Button>
                          <Code className="mr-2 h-4 w-4" />
                          Download Code
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6">
                    <Button asChild>
                      <Link href={`/projects/${id}/tests`}>
                        Generate Test Cases <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No POM Selected</h3>
                  <p className="text-muted-foreground">
                    Select a POM from the list to view its details
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