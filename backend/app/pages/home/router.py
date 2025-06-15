from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_home_data():
    return {
        "title": "Welcome to My Portfolio",
        "subtitle": "Chatbot Developer & AI Solutions Expert",
        "description": "I specialize in creating intelligent chatbots and AI-powered solutions"
    }