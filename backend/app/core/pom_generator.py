import os
import json
import uuid
from typing import List, Dict, Any
from app.core.gemini_client import generate_pom_with_gemini
from config import settings

def generate_pom(elements: List[Dict[str, Any]], project_id: str) -> Dict[str, Any]:
    """Generate Page Object Model from extracted elements"""
    # Create results directory for the project
    project_dir = os.path.join(settings.RESULTS_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    
    # Extract unique page/component names based on elements
    page_components = {}
    for element in elements:
        # Try to determine page/component from element name
        parts = element["name"].split('_')
        if len(parts) > 0:
            page_name = parts[0]
            if page_name not in page_components:
                page_components[page_name] = []
            
            page_components[page_name].append(element)
    
    # Organize elements by page
    organized_elements = []
    for page_name, page_elements in page_components.items():
        page_id = str(uuid.uuid4())
        page = {
            "id": page_id,
            "name": f"{page_name.capitalize()}Page",
            "type": "page",
            "children": []
        }
        
        for element in page_elements:
            element_copy = element.copy()
            element_copy["parent_id"] = page_id
            organized_elements.append(element_copy)
            page["children"].append(element_copy["id"])
        
        organized_elements.append(page)
    
    # Use Gemini to enhance POM structure if API key is available
    if settings.GEMINI_API_KEY:
        try:
            enhanced_elements = generate_pom_with_gemini(organized_elements)
            if enhanced_elements:
                organized_elements = enhanced_elements
        except Exception as e:
            print(f"Error using Gemini API: {e}")
    
    # Save POM to file
    pom_file_path = os.path.join(project_dir, "page_object_model.json")
    with open(pom_file_path, 'w', encoding='utf-8') as f:
        json.dump(organized_elements, f, indent=2)
    
    # Generate code file with class representation
    generate_pom_code_file(organized_elements, project_dir)
    
    return {
        "elements": organized_elements,
        "file_path": pom_file_path
    }

def generate_pom_code_file(elements, project_dir: str) -> str:
    """Generate Python code representation of the POM"""
    code = """from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        
    def find_element(self, selector, selector_type):
        if selector_type == "id":
            return self.driver.find_element(By.ID, selector.replace('#', ''))
        elif selector_type == "class":
            return self.driver.find_element(By.CLASS_NAME, selector.replace('.', ''))
        elif selector_type == "name":
            return self.driver.find_element(By.NAME, selector.split('=')[1].replace("'", ""))
        elif selector_type == "xpath":
            return self.driver.find_element(By.XPATH, selector)
        elif selector_type == "css":
            return self.driver.find_element(By.CSS_SELECTOR, selector)
        elif selector_type == "data-testid":
            return self.driver.find_element(By.CSS_SELECTOR, selector)
        else:
            return self.driver.find_element(By.CSS_SELECTOR, selector)
            
    def click(self, selector, selector_type):
        element = self.find_element(selector, selector_type)
        element.click()
        
    def input_text(self, selector, selector_type, text):
        element = self.find_element(selector, selector_type)
        element.clear()
        element.send_keys(text)
        
    def get_text(self, selector, selector_type):
        element = self.find_element(selector, selector_type)
        return element.text
        
    def wait_for_element(self, selector, selector_type, timeout=10):
        if selector_type == "id":
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.ID, selector.replace('#', '')))
            )
        elif selector_type == "class":
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.CLASS_NAME, selector.replace('.', '')))
            )
        elif selector_type == "xpath":
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.XPATH, selector))
            )
        else:
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, selector))
            )
"""

    # Group elements by page
    pages = [element for element in elements if element["type"] == "page"]
    
    # Generate page classes
    for page in pages:
        page_elements = [e for e in elements if e.get("parent_id") == page["id"]]
        
        code += f"\nclass {page['name']}(BasePage):\n"
        code += "    def __init__(self, driver):\n"
        code += "        super().__init__(driver)\n"
        
        # Create element properties and methods
        for element in page_elements:
            element_name = element["name"].replace('-', '_')
            element_type = element["type"]
            selector = element["selector"]
            selector_type = element["selector_type"]
            
            # Element locator property
            code += f"\n    @property\n"
            code += f"    def {element_name}(self):\n"
            code += f"        return self.find_element('{selector}', '{selector_type}')\n"
            
            # Element action methods based on type
            if element_type in ["button", "a"]:
                code += f"\n    def click_{element_name}(self):\n"
                code += f"        self.click('{selector}', '{selector_type}')\n"
            
            elif element_type in ["input", "textarea"]:
                code += f"\n    def set_{element_name}(self, text):\n"
                code += f"        self.input_text('{selector}', '{selector_type}', text)\n"
            
            elif element_type == "select":
                code += f"\n    def select_{element_name}(self, value):\n"
                code += f"        element = self.find_element('{selector}', '{selector_type}')\n"
                code += f"        from selenium.webdriver.support.ui import Select\n"
                code += f"        select = Select(element)\n"
                code += f"        select.select_by_visible_text(value)\n"
    
    # Save Python file
    py_file_path = os.path.join(project_dir, "page_objects.py")
    with open(py_file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    
    return py_file_path