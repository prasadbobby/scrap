import os
import json
from typing import Dict, Any
import uuid
from app.core.gemini_client import generate_tests_with_gemini
from app.models.project import POM
from config import settings

def generate_tests(pom: POM, project_id: str) -> Dict[str, Any]:
    """Generate test cases from POM using Gemini API"""
    # Create results directory for the project
    project_dir = os.path.join(settings.RESULTS_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    
    # Group elements by page
    elements_by_page = {}
    for element in pom.elements:
        if element["type"] == "page":
            page_id = element["id"]
            page_name = element["name"]
            elements_by_page[page_id] = {
                "name": page_name,
                "elements": []
            }
    
    # Add elements to their respective pages
    for element in pom.elements:
        if "parent_id" in element and element["parent_id"] in elements_by_page:
            elements_by_page[element["parent_id"]]["elements"].append(element)
    
    # Generate test scripts
    test_scripts = []
    
    # If Gemini API key is available, use it for test generation
    if settings.GEMINI_API_KEY:
        try:
            test_scripts = generate_tests_with_gemini(pom.elements)
        except Exception as e:
            print(f"Error using Gemini API for test generation: {e}")
    
    # Fallback to basic test generation
    if not test_scripts:
        test_scripts = generate_basic_tests(elements_by_page)
    
    # Save test scripts to files
    test_directory = os.path.join(project_dir, "tests")
    os.makedirs(test_directory, exist_ok=True)
    
    script_paths = []
    for i, script in enumerate(test_scripts):
        script_name = f"test_{i+1}.py"
        script_path = os.path.join(test_directory, script_name)
        
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script["code"])
        
        script_paths.append(script_path)
    
    # Create main test suite file
    create_test_suite(test_directory, test_scripts)
    
    # Return information about the generated tests
    return {
        "name": f"Test Suite for Project {project_id}",
        "script_path": os.path.join(test_directory, "test_suite.py"),
        "description": f"Automatically generated tests for project {project_id}"
    }

def generate_basic_tests(elements_by_page):
    """Generate basic test scripts without Gemini"""
    test_scripts = []
    
    for page_id, page_data in elements_by_page.items():
        page_name = page_data["name"]
        page_elements = page_data["elements"]
        
        # Skip if no elements on the page
        if not page_elements:
            continue
        
        # Create a basic test for page navigation
        navigation_code = f"""import unittest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from page_objects import {page_name}

class TestNavigation{page_name}(unittest.TestCase):
    def setUp(self):
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service)
        self.driver.maximize_window()
        self.page = {page_name}(self.driver)
        
    def tearDown(self):
        self.driver.quit()
        
    def test_page_navigation(self):
        # Navigate to the page
        self.driver.get("http://example.com")  # Replace with actual URL
        
        # Verify page is loaded by checking for elements
"""
        
        # Add assertions for each element
        for element in page_elements:
            element_name = element["name"].replace('-', '_')
            navigation_code += f"        # Verify {element_name} is present\n"
            navigation_code += f"        self.assertIsNotNone(self.page.{element_name})\n"
        
        navigation_code += """
if __name__ == '__main__':
    unittest.main()
"""
        
        test_scripts.append({
            "name": f"test_navigation_{page_name.lower()}",
            "code": navigation_code
        })
        
        # Create interaction tests for interactive elements
        interactive_elements = [e for e in page_elements 
                             if e["type"] in ["button", "a", "input", "textarea", "select"]]
        
        if interactive_elements:
            interaction_code = f"""import unittest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from page_objects import {page_name}

class TestInteraction{page_name}(unittest.TestCase):
    def setUp(self):
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service)
        self.driver.maximize_window()
        self.page = {page_name}(self.driver)
        self.driver.get("http://example.com")  # Replace with actual URL
        
    def tearDown(self):
        self.driver.quit()
"""
            
            for element in interactive_elements:
                element_name = element["name"].replace('-', '_')
                element_type = element["type"]
                
                if element_type in ["button", "a"]:
                    interaction_code += f"""
    def test_click_{element_name}(self):
        # Click the element
        self.page.click_{element_name}()
        # Add assertions for expected behavior after click
        pass
"""
                elif element_type in ["input", "textarea"]:
                    interaction_code += f"""
    def test_input_{element_name}(self):
        # Input text
        test_text = "Test input text"
        self.page.set_{element_name}(test_text)
        # Add assertions for expected behavior after input
        pass
"""
                elif element_type == "select":
                    interaction_code += f"""
    def test_select_{element_name}(self):
        # Select an option
        option = "Option 1"  # Replace with an actual option
        self.page.select_{element_name}(option)
        # Add assertions for expected behavior after selection
        pass
"""
            
            interaction_code += """
if __name__ == '__main__':
    unittest.main()
"""
            
            test_scripts.append({
                "name": f"test_interaction_{page_name.lower()}",
                "code": interaction_code
            })
    
    return test_scripts

def create_test_suite(test_directory, test_scripts):
    """Create a test suite that runs all tests"""
    code = """import unittest
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

"""
    
    # Import all test modules
    for script in test_scripts:
        module_name = script["name"]
        code += f"from {module_name} import *\n"
    
    code += """
if __name__ == '__main__':
    # Create a test suite
    test_suite = unittest.TestSuite()
    
    # Add all test cases
    loader = unittest.TestLoader()
"""
    
    # Add each test class to the suite
    for script in test_scripts:
        class_name = next((line.strip().split('class ')[1].split('(')[0] 
                         for line in script["code"].split('\n') 
                         if line.strip().startswith('class ')), None)
        
        if class_name:
            code += f"    test_suite.addTests(loader.loadTestsFromTestCase({class_name}))\n"
    
    code += """
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)
"""
    
    # Save the test suite file
    suite_path = os.path.join(test_directory, "test_suite.py")
    with open(suite_path, 'w', encoding='utf-8') as f:
        f.write(code)