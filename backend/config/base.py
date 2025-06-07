"""
Base Configuration

Base configuration class for all configuration modules.
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from typing import Optional
import os

class BaseConfig(BaseSettings):
    """
    Base configuration class with common settings.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )
    
    # Project paths
    PROJECT_ROOT: Path = Field(
        default_factory=lambda: Path(__file__).parent.parent.parent,
        description="Root directory of the project"
    )
    
    # Environment
    ENVIRONMENT: str = Field(
        default="development",
        description="Environment (development, staging, production)"
    )
    
    @property
    def data_dir(self) -> Path:
        """Data directory path."""
        path = self.PROJECT_ROOT / "backend" / "data"
        path.mkdir(parents=True, exist_ok=True)
        return path
    
    @property
    def pdfs_dir(self) -> Path:
        """PDFs directory path."""
        path = self.data_dir / "pdfs"
        path.mkdir(parents=True, exist_ok=True)
        return path
    
    @property
    def vector_db_dir(self) -> Path:
        """Vector database directory path."""
        path = self.PROJECT_ROOT / "backend" / "vector_db"
        path.mkdir(parents=True, exist_ok=True)
        return path