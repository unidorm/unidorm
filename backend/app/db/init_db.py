"""Creates and updates the database, then loads the questionnaire.

Run from the backend/ folder:  python -m app.db.init_db

Safe to run again: missing tables are created (Phase 3 adds matching_runs, roommate_groups and
roommate_group_members), the Phase 2 columns are added to an existing
`users` table (Stage 1 databases), and the questionnaire is inserted or updated.
Migrations with Alembic replace this script when the schema starts changing often.
"""

from sqlalchemy import inspect, text

import app.models  # noqa: F401  (registers the models on Base.metadata)
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.db.survey_seed import seed_survey
from app.models.user import ROOM_TYPE_ENUM

# Columns added to `users` in Phase 2. IF NOT EXISTS makes each statement safe to repeat.
_USER_COLUMNS = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS room_preference room_type",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS room_preference_updated_at TIMESTAMP WITH TIME ZONE",
]


def init_db() -> list[str]:
    """Creates missing tables, adds new columns, seeds the survey. Returns all table names."""
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        ROOM_TYPE_ENUM.create(connection, checkfirst=True)
        for statement in _USER_COLUMNS:
            connection.execute(text(statement))
    with SessionLocal() as db:
        seed_survey(db)
    return sorted(inspect(engine).get_table_names())


if __name__ == "__main__":
    print("Tables in the database:", ", ".join(init_db()))
