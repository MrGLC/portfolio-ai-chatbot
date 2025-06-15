from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.redis import init_redis
from app.pages.home.router import router as home_router
from app.pages.about.router import router as about_router
from app.pages.projects.router import router as projects_router
from app.pages.chatbot.router import router as chatbot_router

app = FastAPI(
    title="Portfolio API",
    description="Backend API for portfolio/freelance promotion website",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_redis()

@app.get("/")
async def root():
    return {"message": "Portfolio API is running"}

app.include_router(home_router, prefix="/api/home", tags=["home"])
app.include_router(about_router, prefix="/api/about", tags=["about"])
app.include_router(projects_router, prefix="/api/projects", tags=["projects"])
app.include_router(chatbot_router, prefix="/api/chatbot", tags=["chatbot"])