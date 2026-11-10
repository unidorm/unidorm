"""Creates the database tables for the models that exist so far.

Run from the backend/ folder:  python -m app.db.init_db

This is the Stage 1 way to create the `users` table. Migrations (Alembic) replace it
when the database models are expanded in a later stage.
"""

from sqlalchemy import inspect

import app.models  # noqa: F401  (registers the models on Base.metadata)
from app.db.base import Base
from app.db.session import engine


def init_db() -> list[str]:
    """Creates missing tables (existing tables are left untouched) and returns all table names."""
    Base.metadata.create_all(bind=engine)
    return sorted(inspect(engine).get_table_names())


if __name__ == "__main__":
    print("Tables in the database:", ", ".join(init_db()))
