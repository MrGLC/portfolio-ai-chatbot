from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    redis_host: str = os.getenv("REDIS_HOST", "localhost")
    redis_port: int = int(os.getenv("REDIS_PORT", 6379))
    redis_db: int = 0
    redis_ttl: int = 3600
    
    chatbot_endpoint: str = os.getenv("CHATBOT_ENDPOINT", "")
    chatbot_api_key: str = os.getenv("CHATBOT_API_KEY", "")
    
    class Config:
        env_file = ".env"

settings = Settings()