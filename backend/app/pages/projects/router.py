from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()

class Project(BaseModel):
    id: int
    title: str
    description: str
    technologies: List[str]
    link: str = ""

@router.get("/")
async def get_projects():
    return [
        {
            "id": 1,
            "title": "AI Customer Support Chatbot",
            "description": "Intelligent chatbot for automated customer service",
            "technologies": ["Python", "NLP", "FastAPI"],
            "link": "#"
        },
        {
            "id": 2,
            "title": "Multi-language Chat Assistant",
            "description": "Chatbot supporting multiple languages with real-time translation",
            "technologies": ["Python", "Transformers", "Redis"],
            "link": "#"
        }
    ]