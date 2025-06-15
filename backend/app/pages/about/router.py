from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_about_data():
    return {
        "bio": "Experienced developer specializing in chatbot development and AI integration",
        "skills": ["Python", "FastAPI", "React", "Machine Learning", "Natural Language Processing"],
        "experience": "5+ years in software development"
    }