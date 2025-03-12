import os
import shutil
import zipfile
from typing import List

def extract_zip(zip_path: str, extract_to: str) -> bool:
    """Extract a zip file to the specified directory"""
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        return True
    except Exception as e:
        print(f"Error extracting zip file: {str(e)}")
        return False

def get_file_extension(file_path: str) -> str:
    """Get the file extension"""
    _, ext = os.path.splitext(file_path)
    return ext.lower()

def create_directory(dir_path: str) -> bool:
    """Create a directory if it doesn't exist"""
    if not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
        return True
    return False

def list_files(directory: str, extensions: List[str] = None) -> List[str]:
    """List files in a directory, optionally filtering by extensions"""
    if not os.path.exists(directory):
        return []
    
    files = []
    for root, _, filenames in os.walk(directory):
        for filename in filenames:
            if extensions is None or any(filename.endswith(ext) for ext in extensions):
                files.append(os.path.join(root, filename))
    
    return files

def read_file(file_path: str) -> str:
    """Read text file contents"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading file {file_path}: {str(e)}")
        return ""

def write_file(file_path: str, content: str) -> bool:
    """Write content to a text file"""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error writing to file {file_path}: {str(e)}")
        return False