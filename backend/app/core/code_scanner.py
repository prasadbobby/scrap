import os
import re
import json
import uuid
from bs4 import BeautifulSoup
from typing import List, Dict, Any

def scan_source_code(file_path: str) -> List[Dict[str, Any]]:
    """Scan source code to identify UI elements"""
    elements = []
    
    # Get file extension
    _, ext = os.path.splitext(file_path)
    
    if ext.lower() in ['.html', '.jsx', '.tsx', '.vue']:
        elements = scan_component_file(file_path)
    elif ext.lower() == '.zip':
        # TODO: Extract and scan zip file
        pass
    elif os.path.isdir(file_path):
        # Scan directory
        for root, _, files in os.walk(file_path):
            for file in files:
                if file.endswith(('.html', '.jsx', '.tsx', '.vue')):
                    file_elements = scan_component_file(os.path.join(root, file))
                    elements.extend(file_elements)
    
    return elements

def scan_component_file(file_path: str) -> List[Dict[str, Any]]:
    """Scan a single component file for UI elements"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    elements = []
    file_name = os.path.basename(file_path)
    
    # HTML files
    if file_path.endswith('.html'):
        soup = BeautifulSoup(content, 'html.parser')
        elements = extract_elements_from_html(soup, file_name)
    
    # React/Vue files
    elif file_path.endswith(('.jsx', '.tsx', '.vue')):
        # Extract HTML-like parts from JSX/TSX/Vue
        html_pattern = r'<([a-zA-Z][a-zA-Z0-9]*)[^>]*>(.*?)</\1>'
        matches = re.findall(html_pattern, content, re.DOTALL)
        
        for tag, inner_content in matches:
            soup = BeautifulSoup(f"<{tag}>{inner_content}</{tag}>", 'html.parser')
            file_elements = extract_elements_from_html(soup, file_name)
            elements.extend(file_elements)
    
    return elements

def extract_elements_from_html(soup, file_name: str) -> List[Dict[str, Any]]:
    """Extract UI elements from BeautifulSoup parsed HTML"""
    elements = []
    interactive_elements = soup.find_all(['button', 'a', 'input', 'select', 'textarea', 'form', 'div', 'span'])
    
    for elem in interactive_elements:
        # Skip elements without attributes or text
        if not elem.attrs and not elem.text.strip():
            continue
        
        element_id = str(uuid.uuid4())
        element_type = elem.name
        
        # Determine best selector
        selector = ""
        selector_type = ""
        
        if elem.get('id'):
            selector = f"#{elem.get('id')}"
            selector_type = "id"
        elif elem.get('data-testid'):
            selector = f"[data-testid='{elem.get('data-testid')}']"
            selector_type = "data-testid"
        elif elem.get('class'):
            classes = ' '.join(elem.get('class'))
            selector = f".{'.'.join(elem.get('class'))}"
            selector_type = "class"
        elif elem.get('name'):
            selector = f"[name='{elem.get('name')}']"
            selector_type = "name"
        else:
            # Fallback to tag + text or XPath
            text = elem.text.strip()
            if text and len(text) < 50:  # Avoid long text
                selector = f"//{element_type}[contains(text(), '{text}')]"
                selector_type = "xpath"
            else:
                # Generate complex XPath
                selector = generate_xpath(elem)
                selector_type = "xpath"
        
        # Create element object
        element = {
            "id": element_id,
            "name": determine_element_name(elem, file_name),
            "type": element_type,
            "selector": selector,
            "selector_type": selector_type,
            "properties": {
                "text": elem.text.strip() if elem.text else "",
                "attributes": {k: v for k, v in elem.attrs.items()}
            }
        }
        
        elements.append(element)
    
    return elements

def generate_xpath(element) -> str:
    """Generate a unique XPath for an element"""
    components = []
    child = element
    
    for parent in element.parents:
        if parent.name == 'html':
            break
        
        siblings = parent.find_all(child.name, recursive=False)
        if len(siblings) > 1:
            index = siblings.index(child) + 1
            components.append(f"{child.name}[{index}]")
        else:
            components.append(child.name)
        
        child = parent
    
    components.reverse()
    return '//' + '/'.join(components)

def determine_element_name(element, file_name: str) -> str:
    """Create a meaningful name for the element"""
    element_type = element.name
    
    # Try different attributes to create a meaningful name
    if element.get('id'):
        return f"{element_type}_{element.get('id')}"
    elif element.get('name'):
        return f"{element_type}_{element.get('name')}"
    elif element.get('data-testid'):
        return f"{element_type}_{element.get('data-testid')}"
    elif element.get('aria-label'):
        return f"{element_type}_{element.get('aria-label').lower().replace(' ', '_')}"
    elif element.text and len(element.text.strip()) < 30:
        return f"{element_type}_{element.text.strip().lower().replace(' ', '_')[:20]}"
    else:
        # Fallback: use file name + element type + random suffix
        return f"{file_name.split('.')[0]}_{element_type}_{element.get('class', [''])[0] if element.get('class') else ''}"