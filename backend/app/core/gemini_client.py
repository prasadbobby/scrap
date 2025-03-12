import os
import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from config import settings

# Configure the Gemini API client
genai.configure(api_key=settings.GEMINI_API_KEY)

def generate_pom_with_gemini(elements: List[Dict[str, Any]]) -> Optional[List[Dict[str, Any]]]:
    """Use Gemini to enhance POM structure"""
    # Convert elements to JSON string
    elements_json = json.dumps(elements, indent=2)
    
    # Create prompt for Gemini
    prompt = f"""
As an AI specialized in UI test automation, I need your help to analyze and improve a Page Object Model (POM) structure.

Here is a JSON representation of UI elements extracted from a web application:

{elements_json}

Please analyze this structure and provide an improved version with the following enhancements:
1. Group related elements logically
2. Add meaningful names and descriptions
3. Ensure proper parent-child relationships
4. Add suggestions for best selectors to use
5. Identify any potential test cases that could be created

Return only the improved JSON structure without any additional explanations. The structure should be valid JSON and should maintain the same schema as the input with keys like "id", "name", "type", "selector", "selector_type", etc.
"""
    
    try:
        # Generate response from Gemini
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Extract and parse JSON from response
        response_text = response.text
        # Find JSON start and end indices
        json_start = response_text.find('[')
        json_end = response_text.rfind(']') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            try:
                improved_elements = json.loads(json_str)
                return improved_elements
            except json.JSONDecodeError:
                print("Failed to parse JSON from Gemini response")
                return None
        else:
            print("No valid JSON found in Gemini response")
            return None
    
    except Exception as e:
        print(f"Error using Gemini API: {str(e)}")
        return None

def generate_tests_with_gemini(elements: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Generate test scripts using Gemini API"""
    # Convert elements to JSON string
    elements_json = json.dumps(elements, indent=2)
    
    # Create prompt for Gemini
    prompt = f"""
As an AI specialized in UI test automation, I need your help to generate Python test scripts for a web application using Selenium.

Here is a JSON representation of a Page Object Model (POM) with UI elements extracted from the application:

{elements_json}

Based on these elements, generate complete Python test scripts following these guidelines:
1. Use unittest framework
2. For each page, create at least two test classes:
   - A navigation test to verify page elements are present
   - An interaction test that performs actions on interactive elements
3. Include proper setup and teardown methods
4. Use the ChromeDriver with webdriver-manager
5. Import from a 'page_objects.py' file that contains the POM classes
6. Add docstrings and comments to explain the test logic
7. Include assertions to verify expected behavior

Return a list of test scripts, each as a JSON object with:
- "name": The file name (e.g., "test_login_page.py")
- "code": The complete Python code for the test script

The response should be a valid JSON array of these objects.
"""
    
    try:
        # Generate response from Gemini
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Extract and parse JSON from response
        response_text = response.text
        # Find JSON start and end indices
        json_start = response_text.find('[')
        json_end = response_text.rfind(']') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            try:
                test_scripts = json.loads(json_str)
                return test_scripts
            except json.JSONDecodeError:
                print("Failed to parse JSON from Gemini response")
                return []
        else:
            print("No valid JSON found in Gemini response")
            return []
    
    except Exception as e:
        print(f"Error using Gemini API for test generation: {str(e)}")
        return []