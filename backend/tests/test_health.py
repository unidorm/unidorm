from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.db.session import get_db
from app.main import app

client = TestClient(app)


def test_health_is_ok_without_database():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


class _BrokenSession:
    """Stands in for a session whose database is down."""

    def execute(self, *args, **kwargs):
        raise OperationalError("SELECT 1", {}, Exception("connection refused"))


class _WorkingSession:
    def execute(self, *args, **kwargs):
        return None


def test_health_db_returns_503_when_database_is_down():
    app.dependency_overrides[get_db] = lambda: _BrokenSession()
    try:
        response = client.get("/api/health/db")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 503
    assert response.json() == {"detail": "Database is unavailable."}


def test_health_db_ok_when_database_answers():
    app.dependency_overrides[get_db] = lambda: _WorkingSession()
    try:
        response = client.get("/api/health/db")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "connected"}
