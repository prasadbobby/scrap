import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import List

from app.core.code_scanner import scan_source_code
from app.core.pom_generator import generate_pom
from app.core.test_generator import generate_tests
from app.core.test_executor import execute_test
from app.models.project import Project, POM, TestCase, TestExecution
from config import settings

router = APIRouter()

# In-memory storage (replace with a database in production)
projects = {}
poms = {}
test_cases = {}
test_executions = {}

@router.post("/projects/")
async def create_project(name: str = Form(...), description: str = Form(None), 
                        file: UploadFile = File(...)):
    """Create a new project by uploading source code"""
    project_id = str(uuid.uuid4())
    
    # Create project directory
    project_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    
    # Save uploaded file
    file_path = os.path.join(project_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create project record
    projects[project_id] = Project(
        id=project_id,
        name=name,
        description=description,
        source_file=file.filename,
        source_path=file_path
    )
    
    return {"project_id": project_id, "message": "Project created successfully"}

@router.get("/projects/")
async def list_projects():
    """List all projects"""
    return {"projects": list(projects.values())}

@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    """Get project details"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects[project_id]

@router.post("/projects/{project_id}/scan")
async def scan_project(project_id: str):
    """Scan source code to identify UI elements"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects[project_id]
    elements = scan_source_code(project.source_path)
    
    return {"project_id": project_id, "elements": elements}

@router.post("/projects/{project_id}/pom")
async def create_pom(project_id: str):
    """Generate Page Object Model from scanned code"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects[project_id]
    elements = scan_source_code(project.source_path)
    pom_data = generate_pom(elements, project_id)
    
    pom_id = str(uuid.uuid4())
    poms[pom_id] = POM(
        id=pom_id,
        project_id=project_id,
        elements=pom_data["elements"],
        file_path=pom_data["file_path"]
    )
    
    # Update project with POM reference
    if "pom_ids" not in project.dict():
        project_dict = project.dict()
        project_dict["pom_ids"] = []
        projects[project_id] = Project(**project_dict)
    
    project_dict = projects[project_id].dict()
    if "pom_ids" not in project_dict:
        project_dict["pom_ids"] = []
    project_dict["pom_ids"].append(pom_id)
    projects[project_id] = Project(**project_dict)
    
    return {"pom_id": pom_id, "message": "POM generated successfully"}

@router.get("/projects/{project_id}/pom")
async def list_project_poms(project_id: str):
    """List all POMs for a project"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects[project_id]
    project_poms = []
    
    if hasattr(project, "pom_ids"):
        for pom_id in project.pom_ids:
            if pom_id in poms:
                project_poms.append(poms[pom_id])
    
    return {"poms": project_poms}

@router.post("/projects/{project_id}/tests")
async def create_tests(project_id: str, pom_id: str = Form(...)):
    """Generate test cases from POM"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if pom_id not in poms:
        raise HTTPException(status_code=404, detail="POM not found")
    
    pom = poms[pom_id]
    test_data = generate_tests(pom, project_id)
    
    test_id = str(uuid.uuid4())
    test_cases[test_id] = TestCase(
        id=test_id,
        project_id=project_id,
        pom_id=pom_id,
        name=test_data["name"],
        script_path=test_data["script_path"],
        description=test_data["description"]
    )
    
    # Update project with test case reference
    project_dict = projects[project_id].dict()
    if "test_ids" not in project_dict:
        project_dict["test_ids"] = []
    project_dict["test_ids"].append(test_id)
    projects[project_id] = Project(**project_dict)
    
    return {"test_id": test_id, "message": "Test cases generated successfully"}

@router.get("/projects/{project_id}/tests")
async def list_project_tests(project_id: str):
    """List all test cases for a project"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects[project_id]
    project_tests = []
    
    if hasattr(project, "test_ids"):
        for test_id in project.test_ids:
            if test_id in test_cases:
                project_tests.append(test_cases[test_id])
    
    return {"tests": project_tests}

@router.post("/projects/{project_id}/execute")
async def run_test(project_id: str, test_id: str = Form(...)):
    """Execute a test case"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if test_id not in test_cases:
        raise HTTPException(status_code=404, detail="Test case not found")
    
    test_case = test_cases[test_id]
    execution_result = execute_test(test_case)
    
    execution_id = str(uuid.uuid4())
    test_executions[execution_id] = TestExecution(
        id=execution_id,
        project_id=project_id,
        test_id=test_id,
        status=execution_result["status"],
        result=execution_result["result"],
        log_path=execution_result["log_path"]
    )
    
    return {"execution_id": execution_id, "result": execution_result}

@router.get("/projects/{project_id}/executions")
async def list_executions(project_id: str):
    """List all test executions for a project"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_executions = [
        execution for execution in test_executions.values()
        if execution.project_id == project_id
    ]
    
    return {"executions": project_executions}