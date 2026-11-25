"""Phase 2 student flow against a real PostgreSQL database (see conftest.py)."""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

pytestmark = pytest.mark.skipif(not os.environ.get("TEST_DATABASE_URL"), reason="TEST_DATABASE_URL is not set")

PASSWORD = "dorm2026pass"


@pytest.fixture(scope="module")
def client():
    from app.db.base import Base
    from app.db.init_db import init_db
    from app.db.session import engine
    from app.main import app

    Base.metadata.drop_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(
            text("DROP TYPE IF EXISTS room_type, user_role, survey_answer_type, survey_response_status, roommate_group_status")
        )
    init_db()
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def clean_users(client):
    from app.db.session import engine

    yield
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE users RESTART IDENTITY CASCADE"))


def register(client, email="aliya@kbtu.kz", name="Aliya Serikova"):
    response = client.post("/api/auth/register", json={"full_name": name, "email": email, "password": PASSWORD})
    assert response.status_code == 201, response.text
    return {"Authorization": f"Bearer {response.json()['token']}"}


def structure(client, headers):
    return client.get("/api/survey", headers=headers).json()


def first_option_answers(survey, category_ids=None):
    return [
        {"question_id": q["id"], "option_ids": [q["options"][0]["id"]]}
        for c in survey["categories"]
        if category_ids is None or c["id"] in category_ids
        for q in c["questions"]
    ]


# --- authentication ---------------------------------------------------------------------------


def test_register_login_me_logout(client):
    headers = register(client, email="  Aliya@KBTU.kz ")
    me = client.get("/api/auth/me", headers=headers).json()
    assert me["email"] == "aliya@kbtu.kz" and me["role"] == "student" and me["full_name"] == "Aliya Serikova"

    login = client.post("/api/auth/login", json={"email": "aliya@kbtu.kz", "password": PASSWORD})
    assert login.status_code == 200

    assert client.post("/api/auth/logout", headers=headers).status_code == 204
    assert client.get("/api/auth/me", headers=headers).status_code == 401


def test_register_validation_and_duplicates(client):
    register(client)
    duplicate = client.post("/api/auth/register", json={"full_name": "A B", "email": "aliya@kbtu.kz", "password": PASSWORD})
    assert duplicate.status_code == 409

    weak = client.post("/api/auth/register", json={"full_name": "Dana B", "email": "dana@kbtu.kz", "password": "password"})
    assert weak.status_code == 422
    bad_email = client.post("/api/auth/register", json={"full_name": "Dana B", "email": "dana", "password": PASSWORD})
    assert bad_email.status_code == 422


def test_wrong_password_and_missing_token(client):
    register(client)
    wrong = client.post("/api/auth/login", json={"email": "aliya@kbtu.kz", "password": "wrong-pass1"})
    assert wrong.status_code == 401 and wrong.json()["detail"] == "Email or password is incorrect."
    unknown = client.post("/api/auth/login", json={"email": "nobody@kbtu.kz", "password": "wrong-pass1"})
    assert unknown.status_code == 401 and unknown.json()["detail"] == wrong.json()["detail"]

    assert client.get("/api/student/dashboard").status_code == 401
    assert client.get("/api/student/dashboard", headers={"Authorization": "Bearer not-a-token"}).status_code == 401


def test_password_is_not_stored_in_plain_text(client):
    from app.db.session import engine

    register(client)
    with engine.connect() as connection:
        stored = connection.execute(text("SELECT password_hash FROM users")).scalar_one()
    assert stored.startswith("scrypt$") and PASSWORD not in stored


# --- dashboard and room preference ------------------------------------------------------------


def test_dashboard_and_room_preference_persist(client):
    headers = register(client)
    dashboard = client.get("/api/student/dashboard", headers=headers).json()
    assert dashboard["room_preference"]["room_type"] is None
    assert dashboard["survey"] == {"state": "not_started", "answered": 0, "total": 15, "submitted_at": None}

    saved = client.put("/api/student/room-preference", json={"room_type": "double"}, headers=headers)
    assert saved.status_code == 200 and saved.json()["room_type"] == "double"
    assert client.put("/api/student/room-preference", json={"room_type": "five"}, headers=headers).status_code == 422

    # A new login still sees the saved choice.
    token = client.post("/api/auth/login", json={"email": "aliya@kbtu.kz", "password": PASSWORD}).json()["token"]
    again = client.get("/api/student/room-preference", headers={"Authorization": f"Bearer {token}"}).json()
    assert again["room_type"] == "double" and again["can_change"] is True


def test_single_room_does_not_need_survey(client):
    headers = register(client)
    client.put("/api/student/room-preference", json={"room_type": "single"}, headers=headers)
    assert client.get("/api/student/dashboard", headers=headers).json()["survey"]["state"] == "not_needed"
    survey = structure(client, headers)
    save = client.put("/api/survey/response/answers", json={"answers": first_option_answers(survey, {"sleep"})}, headers=headers)
    assert save.status_code == 409


def test_manager_cannot_use_student_endpoints(client):
    from app.core.security import hash_password
    from app.db.session import SessionLocal
    from app.models.user import User, UserRole

    with SessionLocal() as db:
        db.add(User(full_name="Housing Manager", email="manager@kbtu.kz", role=UserRole.HOUSING_MANAGER,
                    password_hash=hash_password(PASSWORD)))
        db.commit()
    token = client.post("/api/auth/login", json={"email": "manager@kbtu.kz", "password": PASSWORD}).json()["token"]
    assert client.get("/api/student/dashboard", headers={"Authorization": f"Bearer {token}"}).status_code == 403
    # Public registration cannot take over the manager's email either.
    taken = client.post("/api/auth/register", json={"full_name": "X Y", "email": "manager@kbtu.kz", "password": PASSWORD})
    assert taken.status_code == 409


# --- questionnaire ------------------------------------------------------------------------------


def test_survey_structure_comes_from_database(client):
    headers = register(client)
    survey = structure(client, headers)
    assert survey["total_questions"] == 15
    assert [c["id"] for c in survey["categories"]] == ["sleep", "noise", "cleanliness", "visitors", "study"]
    assert [c["weight"] for c in survey["categories"]] == [25, 20, 20, 20, 15]
    codes = [q["code"] for c in survey["categories"] for q in c["questions"]]
    assert codes == [f"Q{i}" for i in range(1, 16)]
    assert all(len(q["options"]) == 4 for c in survey["categories"] for q in c["questions"])


def test_save_validate_change_and_submit(client):
    headers = register(client)
    survey = structure(client, headers)
    sleep = first_option_answers(survey, {"sleep"})

    # Room type first.
    assert client.put("/api/survey/response/answers", json={"answers": sleep}, headers=headers).status_code == 409
    client.put("/api/student/room-preference", json={"room_type": "triple"}, headers=headers)

    saved = client.put("/api/survey/response/answers", json={"answers": sleep}, headers=headers)
    assert saved.status_code == 200 and saved.json()["answered"] == 3 and saved.json()["status"] == "draft"
    assert client.get("/api/student/dashboard", headers=headers).json()["survey"]["state"] == "in_progress"

    q1, q2 = survey["categories"][0]["questions"][:2]
    wrong_option = {"question_id": q1["id"], "option_ids": [q2["options"][0]["id"]]}
    assert client.put("/api/survey/response/answers", json={"answers": [wrong_option]}, headers=headers).status_code == 422
    two_options = {"question_id": q1["id"], "option_ids": [o["id"] for o in q1["options"][:2]]}
    assert client.put("/api/survey/response/answers", json={"answers": [two_options]}, headers=headers).status_code == 422
    unknown = {"question_id": 99999, "option_ids": [1]}
    assert client.put("/api/survey/response/answers", json={"answers": [unknown]}, headers=headers).status_code == 422

    # Change an answer, then clear it.
    changed = {"question_id": q1["id"], "option_ids": [q1["options"][3]["id"]]}
    after = client.put("/api/survey/response/answers", json={"answers": [changed]}, headers=headers).json()
    assert after["answers"][str(q1["id"])] == [q1["options"][3]["id"]]
    cleared = client.put("/api/survey/response/answers", json={"answers": [{"question_id": q1["id"], "option_ids": []}]},
                         headers=headers).json()
    assert cleared["answered"] == 2

    # Submit with gaps: 422 and the list of missing questions.
    incomplete = client.post("/api/survey/response/submit", headers=headers)
    assert incomplete.status_code == 422
    assert q1["id"] in incomplete.json()["missing_question_ids"] and len(incomplete.json()["missing_question_ids"]) == 13

    client.put("/api/survey/response/answers", json={"answers": first_option_answers(survey)}, headers=headers)
    done = client.post("/api/survey/response/submit", headers=headers)
    assert done.status_code == 200 and done.json()["status"] == "submitted" and done.json()["answered"] == 15

    # Locked after submission.
    assert client.post("/api/survey/response/submit", headers=headers).status_code == 409
    assert client.put("/api/survey/response/answers", json={"answers": sleep}, headers=headers).status_code == 409
    assert client.put("/api/student/room-preference", json={"room_type": "single"}, headers=headers).status_code == 409
    dashboard = client.get("/api/student/dashboard", headers=headers).json()
    assert dashboard["survey"]["state"] == "submitted" and dashboard["room_preference"]["can_change"] is False


def test_students_cannot_see_or_change_each_others_answers(client):
    aliya = register(client, "aliya@kbtu.kz", "Aliya Serikova")
    dana = register(client, "dana@kbtu.kz", "Dana Bekova")
    survey = structure(client, aliya)
    for headers in (aliya, dana):
        client.put("/api/student/room-preference", json={"room_type": "double"}, headers=headers)

    client.put("/api/survey/response/answers", json={"answers": first_option_answers(survey)}, headers=aliya)
    client.post("/api/survey/response/submit", headers=aliya)

    dana_view = client.get("/api/survey/response", headers=dana).json()
    assert dana_view["answers"] == {} and dana_view["status"] is None
    # Dana saving answers writes only to Dana's own questionnaire.
    client.put("/api/survey/response/answers", json={"answers": first_option_answers(survey, {"noise"})}, headers=dana)
    assert client.get("/api/survey/response", headers=aliya).json()["answered"] == 15
    assert client.get("/api/survey/response", headers=dana).json()["answered"] == 3


def test_init_db_upgrades_a_stage1_database_and_is_repeatable(client):
    from app.db.init_db import init_db
    from app.db.session import engine

    init_db()  # second run: no duplicates
    with engine.connect() as connection:
        assert connection.execute(text("SELECT count(*) FROM survey_questions")).scalar_one() == 15
        assert connection.execute(text("SELECT count(*) FROM survey_options")).scalar_one() == 60
        columns = {
            row[0]
            for row in connection.execute(
                text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
            )
        }
    assert {"password_hash", "room_preference", "room_preference_updated_at"} <= columns
