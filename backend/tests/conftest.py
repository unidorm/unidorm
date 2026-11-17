import os

# Integration tests run against a real PostgreSQL database when TEST_DATABASE_URL is set, e.g.
#   TEST_DATABASE_URL=postgresql+psycopg://unidorm_user:PASSWORD@localhost:5432/unidorm_test pytest
# Its tables are dropped and re-created, so never point it at the real `unidorm` database.
# Without it, those tests are skipped and the rest use a placeholder URL (no connection is opened).
if os.environ.get("TEST_DATABASE_URL"):
    os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://test:test@localhost:5432/unidorm_test")
