"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, BookOpen, Code, FileCode, Lightbulb } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col items-center space-y-6 text-center mb-10">
        <BookOpen className="h-12 w-12" />
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground max-w-3xl">
          Learn how to use the UI Test Generator to automatically create and execute test cases from your UI code.
        </p>
      </div>

      <Tabs defaultValue="overview" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Guide</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>What is UI Test Generator?</CardTitle>
              <CardDescription>
                An automated tool for generating test cases from UI source code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                UI Test Generator is a comprehensive solution that accelerates the test automation process
                by automatically extracting UI elements from your source code, generating Page Object Models,
                and creating executable test scripts.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg flex items-center">
                      <FileCode className="mr-2 h-5 w-5 text-primary" />
                      Source Code Scanning
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      Analyzes HTML, JSX, TSX, and Vue components to identify UI elements and their properties.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg flex items-center">
                      <Code className="mr-2 h-5 w-5 text-primary" />
                      POM Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      Creates Page Object Models with element selectors, methods, and properties.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg flex items-center">
                      <FileCode className="mr-2 h-5 w-5 text-primary" />
                      Test Case Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      Automatically creates test scripts with navigation and interaction tests.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                      AI-Powered Enhancement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      Uses Gemini 1.5 Flash API to optimize selectors and generate intelligent test cases.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button asChild>
                  <Link href="/projects">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Guide</CardTitle>
              <CardDescription>
                How to use UI Test Generator effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 1: Create a Project</h3>
                <p className="text-muted-foreground">
                  Upload your UI source code (HTML, JSX, TSX, Vue components) or a ZIP archive containing your UI files.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 2: Scan Source Code</h3>
                <p className="text-muted-foreground">
                  The system will scan your code to identify UI elements and their properties.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 3: Generate Page Object Model</h3>
                <p className="text-muted-foreground">
                  Create a structured representation of your UI with element selectors and methods.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 4: Create Test Cases</h3>
                <p className="text-muted-foreground">
                  Generate test scripts based on the POM, including navigation and interaction tests.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 5: Execute Tests</h3>
                <p className="text-muted-foreground">
                  Run the generated tests against your UI and review the results.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>
                Endpoints for interacting with the UI Test Generator API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Endpoint</th>
                      <th className="text-left py-2 px-4">Method</th>
                      <th className="text-left py-2 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/projects/</td>
                      <td className="py-2 px-4">POST</td>
                      <td className="py-2 px-4">Create a new project</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/projects/</td>
                      <td className="py-2 px-4">GET</td>
                      <td className="py-2 px-4">List all projects</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/projects/{"{id}"}</td>
                      <td className="py-2 px-4">GET</td>
                      <td className="py-2 px-4">Get project details</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/projects/{"{id}"}/scan</td>
                      <td className="py-2 px-4">POST</td>
                      <td className="py-2 px-4">Scan source code</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/projects/{"{id}"}/pom</td>
                      <td className="py-2 px-4">POST</td>
                      <td className="py-2 px-4">Generate POM</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/projects/{"{id}"}/tests</td>
                      <td className="py-2 px-4">POST</td>
                      <td className="py-2 px-4">Generate test cases</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/projects/{"{id}"}/execute</td>
                      <td className="py-2 px-4">POST</td>
                      <td className="py-2 px-4">Execute test cases</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Examples</CardTitle>
              <CardDescription>
                Sample usage scenarios and code examples
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Example: Login Page Test</h3>
                <p className="text-muted-foreground mb-2">
                  A test scenario for a login page with username and password fields.
                </p>
                
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <pre className="text-sm font-mono overflow-x-auto">
{`import unittest
from selenium import webdriver
from page_objects import LoginPage

class TestLoginPage(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.page = LoginPage(self.driver)
        
    def test_login_success(self):
        # Navigate to login page
        self.driver.get("http://example.com/login")
        
        # Enter credentials
        self.page.set_username("testuser")
        self.page.set_password("password123")
        
        # Click login button
        self.page.click_login_button()
        
        # Verify successful login
        self.assertEqual(self.driver.current_url, "http://example.com/dashboard")
        
    def tearDown(self):
        self.driver.quit()
`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-2 mt-6">
                <h3 className="text-lg font-medium">Example: Form Submission Test</h3>
                <p className="text-muted-foreground mb-2">
                  A test scenario for a form with multiple input fields and submission.
                </p>
                
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <pre className="text-sm font-mono overflow-x-auto">
{`import unittest
from selenium import webdriver
from page_objects import RegistrationPage

class TestRegistrationForm(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.page = RegistrationPage(self.driver)
        
    def test_form_submission(self):
        # Navigate to registration page
        self.driver.get("http://example.com/register")
        
        # Fill form fields
        self.page.set_first_name("John")
        self.page.set_last_name("Doe")
        self.page.set_email("john.doe@example.com")
        self.page.set_password("secure123")
        self.page.set_confirm_password("secure123")
        
        # Submit form
        self.page.click_submit_button()
        
        # Verify successful submission
        self.assertTrue(self.page.success_message.is_displayed())
        
    def tearDown(self):
        self.driver.quit()
`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}