# Import every model here so that Base.metadata knows about all tables.
from app.models.user import User, UserRole

__all__ = ["User", "UserRole"]
