import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "UI Test Generator"
    API_V1_STR: str = "/api/v1"
    UPLOAD_DIR: str = "uploads"
    RESULTS_DIR: str = "results"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    if not os.path.exists(RESULTS_DIR):
        os.makedirs(RESULTS_DIR)

settings = Settings()