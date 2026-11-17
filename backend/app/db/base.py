from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all ORM models. Models live in app/models and are imported in app/models/__init__.py."""
