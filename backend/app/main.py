from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import auth, health, matching, portal, student, survey
from app.core.config import get_settings
from app.core.errors import register_error_handlers

settings = get_settings()

app = FastAPI(
    title="UniDorm API",
    version="0.1.0",
    # Interactive docs are useful in development but should not be public in production.
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

register_error_handlers(app)
app.include_router(health.router)
app.include_router(portal.router)
app.include_router(auth.router)
app.include_router(student.router)
app.include_router(survey.router)
app.include_router(matching.router)
app.include_router(matching.student_router)
