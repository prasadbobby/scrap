from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    source_file: str
    source_path: str
    pom_ids: Optional[List[str]] = []
    test_ids: Optional[List[str]] = []

class Element(BaseModel):
    id: str
    name: str
    type: str
    selector: str
    selector_type: str
    parent_id: Optional[str] = None
    children: Optional[List[str]] = []
    properties: Optional[Dict[str, Any]] = {}

class POM(BaseModel):
    id: str
    project_id: str
    elements: List[Element]
    file_path: str

class TestCase(BaseModel):
    id: str
    project_id: str
    pom_id: str
    name: str
    script_path: str
    description: Optional[str] = None

class TestExecution(BaseModel):
    id: str
    project_id: str
    test_id: str
    status: str
    result: Dict[str, Any]
    log_path: str