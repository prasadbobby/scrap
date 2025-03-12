// API Client for backend communication

// Define base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Define types
export interface Project {
  id: string;
  name: string;
  description?: string;
  source_file: string;
  source_path: string;
  pom_ids?: string[];
  test_ids?: string[];
}

export interface Element {
  id: string;
  name: string;
  type: string;
  selector: string;
  selector_type: string;
  parent_id?: string;
  children?: string[];
  properties?: Record<string, any>;
}

export interface POM {
  id: string;
  project_id: string;
  elements: Element[];
  file_path: string;
}

export interface TestCase {
  id: string;
  project_id: string;
  pom_id: string;
  name: string;
  script_path: string;
  description?: string;
}

export interface TestExecution {
  id: string;
  project_id: string;
  test_id: string;
  status: string;
  result: Record<string, any>;
  log_path: string;
}

// API functions
export async function createProject(formData: FormData): Promise<{project_id: string}> {
  const response = await fetch(`${API_BASE_URL}/projects/`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create project');
  }
  
  return response.json();
}

export async function getProjects(): Promise<{projects: Project[]}> {
  const response = await fetch(`${API_BASE_URL}/projects/`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch projects');
  }
  
  return response.json();
}

export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch project');
  }
  
  return response.json();
}

export async function scanProject(id: string): Promise<{project_id: string, elements: Element[]}> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}/scan`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to scan project');
  }
  
  return response.json();
}

export async function createPOM(projectId: string): Promise<{pom_id: string}> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/pom`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create POM');
  }
  
  return response.json();
}

export async function getProjectPOMs(projectId: string): Promise<{poms: POM[]}> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/pom`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch POMs');
  }
  
  return response.json();
}

export async function createTests(projectId: string, pomId: string): Promise<{test_id: string}> {
  const formData = new FormData();
  formData.append('pom_id', pomId);
  
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tests`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create tests');
  }
  
  return response.json();
}

export async function getProjectTests(projectId: string): Promise<{tests: TestCase[]}> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tests`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch tests');
  }
  
  return response.json();
}

export async function executeTest(projectId: string, testId: string): Promise<{execution_id: string, result: any}> {
  const formData = new FormData();
  formData.append('test_id', testId);
  
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/execute`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to execute test');
  }
  
  return response.json();
}

export async function getProjectExecutions(projectId: string): Promise<{executions: TestExecution[]}> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/executions`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch executions');
  }
  
  return response.json();
}