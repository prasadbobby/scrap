"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createProject } from '@/lib/api';
import { ArrowRight, Upload } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      // Auto-populate name if not set
      if (!name) {
        const fileName = acceptedFiles[0].name.split('.')[0];
        setName(fileName.charAt(0).toUpperCase() + fileName.slice(1));
      }
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html'],
      'text/jsx': ['.jsx'],
      'text/tsx': ['.tsx'],
      'application/zip': ['.zip'],
    },
    maxFiles: 1,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !file) {
      setError('Project name and file are required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('file', file);
      
      if (description) {
        formData.append('description', description);
      }
      
      const response = await createProject(formData);
      
      // Redirect to project page
      router.push(`/projects/${response.project_id}`);
    } catch (err) {
      setError('Failed to create project');
      console.error('Error creating project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">UI Test Generator</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Automatically generate test cases from your UI code. Upload your source code and let the system discover UI elements,
            generate Page Object Models, and create test scripts.
          </p>
        </div>
        
        <div className="flex gap-8 w-full max-w-6xl">
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>
                Upload your UI code to start generating tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Enter project name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Enter project description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Source Code</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors
                      ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                    {file ? (
                      <p className="text-sm font-medium">
                        Selected: <span className="font-semibold">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
                      </p>
                    ) : (
                      <div>
                        <p className="text-sm font-medium">Drag & drop your source code file here</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports HTML, JSX, TSX files or a ZIP archive
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                
                <Button type="submit" className="w-full" disabled={isSubmitting || !file}>
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Automated test generation in four simple steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-2">1</span>
                  Source Code Scanning
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload your UI code and the system will automatically scan and identify all UI elements.
                </p>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-2">2</span>
                  POM Generation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Generate Page Object Models with all the element properties and selectors.
                </p>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-2">3</span>
                  Test Case Generation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Automatically create test scripts with actions and validations based on the identified elements.
                </p>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-2">4</span>
                  Test Execution
                </h3>
                <p className="text-sm text-muted-foreground">
                  Execute and validate the generated tests to ensure they work correctly with your UI.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/projects">
                  View Existing Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}