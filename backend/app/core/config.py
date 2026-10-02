"""
Core Settings & Configuration using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from pydantic import model_validator

class Settings(BaseSettings):
    APP_NAME: str = "RetailSense AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite+aiosqlite:///./retailsense.db"
    SECRET_KEY: str = "super_secret_dev_key"

    @model_validator(mode="after")
    def require_production_secret(self):
        if self.APP_ENV.lower() != "development" and (
            len(self.SECRET_KEY) < 32
            or self.SECRET_KEY == "super_secret_dev_key"
            or self.SECRET_KEY.startswith("replace-with-")
        ):
            raise ValueError("Production requires a non-placeholder SECRET_KEY of at least 32 characters")
        return self

    model_config = {"env_file": ".env"}

settings = Settings()
