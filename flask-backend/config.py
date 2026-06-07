import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "default-flask-secret-key-12345")
    JWT_SECRET = os.environ.get("JWT_SECRET", "default-jwt-secret-key-67890")
    
    # Neon Database URL with fallback to local SQLite
    DATABASE_URL = os.environ.get("DATABASE_URL")
    if DATABASE_URL:
        # Flask-SQLAlchemy needs "postgresql://" instead of "postgres://" which Neon/Heroku sometimes output
        if DATABASE_URL.startswith("postgres://"):
            SQLALCHEMY_DATABASE_URI = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        else:
            SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        SQLALCHEMY_DATABASE_URI = "sqlite:///code_review.db"
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GOOGLE_GEMINI_KEY = os.environ.get("GOOGLE_GEMINI_KEY")
