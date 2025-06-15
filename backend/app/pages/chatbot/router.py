from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatMessage(BaseModel):
    message: str

@router.post("/demo")
async def chatbot_demo(chat_message: ChatMessage):
    return {
        "response": f"This is a demo response. In production, this would connect to your actual chatbot. You said: {chat_message.message}"
    }