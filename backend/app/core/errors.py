import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.services.survey import UnansweredQuestionsError

logger = logging.getLogger("unidorm")


def register_error_handlers(app: FastAPI) -> None:
    """Return consistent JSON errors: {"detail": "..."} (plus extra fields where useful)."""

    @app.exception_handler(UnansweredQuestionsError)
    async def unanswered_handler(request: Request, exc: UnansweredQuestionsError) -> JSONResponse:
        return JSONResponse(status_code=422, content={"detail": str(exc), "missing_question_ids": exc.question_ids})

    @app.exception_handler(SQLAlchemyError)
    async def database_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.exception("Database error on %s", request.url.path)
        return JSONResponse(status_code=503, content={"detail": "Database is unavailable."})

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s", request.url.path)
        return JSONResponse(status_code=500, content={"detail": "Internal server error."})
