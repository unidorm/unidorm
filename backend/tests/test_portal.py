from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_student_announcements_skip_manager_only_items():
    response = client.get("/api/portal/announcements", params={"audience": "student"})

    assert response.status_code == 200
    audiences = {item["audience"] for item in response.json()}
    assert audiences <= {"student", "all"}


def test_all_announcements_without_filter():
    response = client.get("/api/portal/announcements")

    assert response.status_code == 200
    assert {item["audience"] for item in response.json()} == {"student", "housing_manager", "all"}


def test_unknown_audience_is_rejected():
    response = client.get("/api/portal/announcements", params={"audience": "guest"})

    assert response.status_code == 422


def test_key_dates_are_in_timeline_order():
    response = client.get("/api/portal/key-dates")

    assert response.status_code == 200
    assert [item["id"] for item in response.json()][:2] == ["returning", "first-year"]
