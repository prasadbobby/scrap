import os
import subprocess
import json
import uuid
import datetime
from typing import Dict, Any
from app.models.project import TestCase
from config import settings

def execute_test(test_case: TestCase) -> Dict[str, Any]:
    """Execute a test case and return the results"""
    # Create results directory
    project_dir = os.path.join(settings.RESULTS_DIR, test_case.project_id)
    results_dir = os.path.join(project_dir, "execution_results")
    os.makedirs(results_dir, exist_ok=True)
    
    # Generate unique ID for this execution
    execution_id = str(uuid.uuid4())
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join(results_dir, f"execution_{execution_id}_{timestamp}.log")
    
    # Prepare command
    script_path = test_case.script_path
    
    try:
        # Execute test script
        with open(log_file, 'w') as f:
            result = subprocess.run(
                ['python', script_path],
                stdout=f,
                stderr=subprocess.STDOUT,
                text=True,
                timeout=300  # 5 minute timeout
            )
        
        # Read log file
        with open(log_file, 'r') as f:
            log_content = f.read()
        
        # Determine test status
        if result.returncode == 0:
            status = "SUCCESS"
        else:
            status = "FAILURE"
        
        # Parse test results
        test_results = parse_test_results(log_content)
        
        return {
            "status": status,
            "result": {
                "return_code": result.returncode,
                "tests": test_results,
                "log": log_content[:1000] + ("..." if len(log_content) > 1000 else "")
            },
            "log_path": log_file
        }
    
    except subprocess.TimeoutExpired:
        with open(log_file, 'a') as f:
            f.write("\n\nTEST EXECUTION TIMEOUT: Execution took longer than 5 minutes.")
        
        return {
            "status": "TIMEOUT",
            "result": {
                "return_code": -1,
                "tests": [],
                "log": "Test execution timed out after 5 minutes."
            },
            "log_path": log_file
        }
    
    except Exception as e:
        with open(log_file, 'a') as f:
            f.write(f"\n\nERROR EXECUTING TEST: {str(e)}")
        
        return {
            "status": "ERROR",
            "result": {
                "return_code": -1,
                "tests": [],
                "log": f"Error executing test: {str(e)}"
            },
            "log_path": log_file
        }

def parse_test_results(log_content: str) -> list:
    """Parse unittest results from log content"""
    results = []
    
    # Split log by lines
    lines = log_content.split('\n')
    
    # Process each line looking for test results
    current_test = None
    for line in lines:
        line = line.strip()
        
        # Look for test method
        if line.startswith('test_') and ' (' in line:
            test_name = line.split(' (')[0]
            current_test = {
                "name": test_name,
                "status": "RUNNING"
            }
        
        # Look for test result
        elif current_test and any(result in line for result in ["ok", "FAIL", "ERROR", "skipped"]):
            if "ok" in line:
                current_test["status"] = "PASSED"
            elif "FAIL" in line:
                current_test["status"] = "FAILED"
            elif "ERROR" in line:
                current_test["status"] = "ERROR"
            elif "skipped" in line:
                current_test["status"] = "SKIPPED"
            
            results.append(current_test)
            current_test = None
    
    return results