"""Phase 3 matching API against a real PostgreSQL database (see conftest.py)."""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

pytestmark = pytest.mark.skipif(not os.environ.get("TEST_DATABASE_URL"), reason="TEST_DATABASE_URL is not set")

PASSWORD = "dorm2026pass"
QUIET = "abaaaaaababbaaa"
QUIET_2 = "bbaaabaabbbbaab"
PARTY = "ddddddddddddddc"
PARTY_2 = "cdddddddddddddc"


@pytest.fixture(scope="module")
def client():
    from app.db.base import Base
    from app.db.init_db import init_db
    from app.db.session import engine
    from app.main import app

    Base.metadata.drop_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(
            text(
                "DROP TYPE IF EXISTS room_type, user_role, survey_answer_type, survey_response_status,"
                " roommate_group_status"
            )
        )
    init_db()
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def clean(client):
    from app.db.session import engine

    yield
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE users, matching_runs RESTART IDENTITY CASCADE"))


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def manager(client) -> dict:
    from app.db.create_manager import create_manager

    create_manager("office@kbtu.kz", "Aigerim Nurlanova", PASSWORD)
    response = client.post("/api/auth/login", json={"email": "office@kbtu.kz", "password": PASSWORD})
    assert response.status_code == 200 and response.json()["user"]["role"] == "housing_manager"
    return auth(response.json()["token"])


def student(client, name: str, room: str | None = "double", letters: str | None = None, submit: bool = True):
    """Registers a student, picks a room type and answers Q1..Q15 with letters a-d ('-' skips one)."""
    email = name.lower().replace(" ", ".") + "@kbtu.kz"
    response = client.post("/api/auth/register", json={"full_name": name, "email": email, "password": PASSWORD})
    assert response.status_code == 201, response.text
    headers = auth(response.json()["token"])
    user_id = response.json()["user"]["id"]
    if room:
        assert client.put("/api/student/room-preference", json={"room_type": room}, headers=headers).status_code == 200
    if letters and room != "single":
        survey = client.get("/api/survey", headers=headers).json()
        questions = [q for c in survey["categories"] for q in c["questions"]]
        answers = [
            {"question_id": q["id"], "option_ids": [q["options"]["abcd".index(ch)]["id"]]}
            for q, ch in zip(questions, letters)
            if ch != "-"
        ]
        saved = client.put("/api/survey/response/answers", json={"answers": answers}, headers=headers)
        assert saved.status_code == 200, saved.text
        if submit:
            assert client.post("/api/survey/response/submit", headers=headers).status_code == 200
    return user_id, headers


# --- access -------------------------------------------------------------------------------------


def test_only_managers_use_matching_endpoints(client):
    _, student_headers = student(client, "Aliya Serikova", letters=QUIET)
    manager_headers = manager(client)
    assert client.get("/api/matching/overview").status_code == 401
    assert client.get("/api/matching/overview", headers=student_headers).status_code == 403
    assert client.post("/api/matching/runs", headers=student_headers).status_code == 403
    assert client.post("/api/matching/compare", json={"user_ids": [1, 2]}, headers=student_headers).status_code == 403
    assert client.get("/api/student/matching", headers=manager_headers).status_code == 403
    assert client.get("/api/matching/overview", headers=manager_headers).status_code == 200


def test_create_manager_rejects_student_email_and_weak_password(client):
    from pydantic import ValidationError

    from app.db.create_manager import create_manager

    student(client, "Aliya Serikova")
    with pytest.raises(ValueError):
        create_manager("aliya.serikova@kbtu.kz", "Someone Else", PASSWORD)
    with pytest.raises(ValidationError):
        create_manager("office2@kbtu.kz", "Office Two", "short")


# --- comparing ------------------------------------------------------------------------------------


def test_compare_two_students(client):
    a, _ = student(client, "Aliya Serikova", letters=QUIET)
    b, _ = student(client, "Dana Bekova", letters=QUIET)
    headers = manager(client)

    response = client.post("/api/matching/compare", json={"user_ids": [a, b]}, headers=headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["room_score"] == 100 and body["compatibility_level"] == "High"
    pair = body["pairs"][0]
    assert pair["overall_score"] == 100
    assert pair["category_scores"] == {"sleep": 100, "noise": 100, "cleanliness": 100, "visitors": 100, "study": 100}
    assert [(c["category"], c["weight"]) for c in pair["categories"]] == [
        ("sleep", 25), ("noise", 20), ("cleanliness", 20), ("visitors", 20), ("study", 15)
    ]
    assert len(pair["answers"]) == 15
    first = pair["answers"][0]
    assert first["code"] == "Q1" and first["answer_1"] == "Before 10 PM" == first["answer_2"] and first["steps_apart"] == 0


def test_compare_different_students_explains_why(client):
    a, _ = student(client, "Aliya Serikova", letters=QUIET)
    b, _ = student(client, "Dana Bekova", letters=PARTY)
    pair = client.post("/api/matching/compare", json={"user_ids": [a, b]}, headers=manager(client)).json()["pairs"][0]
    assert pair["compatibility_level"] == "Low"
    noise = next(c for c in pair["categories"] if c["category"] == "noise")
    assert {rule["key"]: rule["score"] for rule in noise["rules"]}["speakers"] == 0
    assert pair["answers"][3]["answer_1"] == "Completely quiet" and pair["answers"][3]["steps_apart"] == 3


def test_compare_incomplete_questionnaire_is_flagged(client):
    a, _ = student(client, "Aliya Serikova", letters=QUIET)
    b, _ = student(client, "Dana Bekova", letters="-" * 5 + QUIET[5:], submit=False)
    pair = client.post("/api/matching/compare", json={"user_ids": [a, b]}, headers=manager(client)).json()["pairs"][0]
    assert pair["complete"] is False
    assert pair["missing_questions"] == ["Q1", "Q2", "Q3", "Q4", "Q5"]
    assert pair["category_scores"]["sleep"] == 0
    assert pair["answers"][0]["answer_2"] is None and pair["answers"][0]["steps_apart"] is None


def test_compare_validation(client):
    a, _ = student(client, "Aliya Serikova", letters=QUIET)
    b, _ = student(client, "Dana Bekova", letters=None)  # no answers at all
    headers = manager(client)
    assert client.post("/api/matching/compare", json={"user_ids": [a]}, headers=headers).status_code == 422
    assert client.post("/api/matching/compare", json={"user_ids": [a, a]}, headers=headers).status_code == 422
    assert client.post("/api/matching/compare", json={"user_ids": [1, 2, 3, 4, 5]}, headers=headers).status_code == 422
    assert client.post("/api/matching/compare", json={"user_ids": [a, 999]}, headers=headers).status_code == 404
    not_started = client.post("/api/matching/compare", json={"user_ids": [a, b]}, headers=headers)
    assert not_started.status_code == 409 and "Dana Bekova" in not_started.json()["detail"]


def test_compare_group_of_three_and_four(client):
    ids = [
        student(client, "Aliya Serikova", room="triple", letters=QUIET)[0],
        student(client, "Dana Bekova", room="triple", letters=QUIET_2)[0],
        student(client, "Madina Ospan", room="triple", letters=PARTY)[0],
        student(client, "Zhanna Ali", room="triple", letters=QUIET)[0],
    ]
    headers = manager(client)
    three = client.post("/api/matching/compare", json={"user_ids": ids[:3]}, headers=headers).json()
    scores = [pair["overall_score"] for pair in three["pair_scores"]]
    assert len(scores) == 3
    assert three["worst_pair"] == min(scores)
    assert three["average_pairs"] == round(sum(scores) / 3, 1)
    assert three["room_score"] == int(0.6 * sum(scores) / 3 + 0.4 * min(scores) + 0.5)
    assert {s["full_name"] for s in three["worst_pair_students"]} & {"Madina Ospan"}

    four = client.post("/api/matching/compare", json={"user_ids": ids}, headers=headers).json()
    assert len(four["pair_scores"]) == 6 and len(four["pairs"]) == 6


# --- running, approving, what students see --------------------------------------------------------


def test_full_matching_workflow(client):
    q1, q1_headers = student(client, "Aliya Serikova", letters=QUIET)
    p1, p1_headers = student(client, "Dana Bekova", letters=PARTY)
    q2, _ = student(client, "Madina Ospan", letters=QUIET_2)
    p2, _ = student(client, "Zhanna Ali", letters=PARTY_2)
    t = [student(client, f"Triple Student{n}", room="triple", letters=QUIET)[0] for n in "ABC"]
    _, single_headers = student(client, "Single Person", room="single")
    _, draft_headers = student(client, "Not Finished", letters=QUIET[:10] + "-----", submit=False)
    headers = manager(client)

    before = client.get("/api/matching/overview", headers=headers).json()
    assert len(before["students"]) == 7 and before["waiting_for_questionnaire"] == 1
    assert before["proposed"] == [] and before["last_run"] is None

    # Students see nothing before a manager approves a room.
    assert client.get("/api/student/matching", headers=q1_headers).json()["state"] == "waiting"
    assert client.get("/api/student/matching", headers=single_headers).json()["state"] == "not_needed"
    assert client.get("/api/student/matching", headers=draft_headers).json()["state"] == "no_questionnaire"

    run = client.post("/api/matching/runs", headers=headers)
    assert run.status_code == 201
    overview = run.json()
    groups = {tuple(m["id"] for m in g["result"]["members"]): g for g in overview["proposed"]}
    assert set(groups) == {tuple(sorted((q1, q2))), tuple(sorted((p1, p2))), tuple(t)}
    assert all(g["status"] == "proposed" for g in overview["proposed"])
    assert overview["last_run"]["proposed_count"] == 3
    assert {s["match_status"] for s in overview["students"]} == {"proposed"}
    assert client.get("/api/student/matching", headers=q1_headers).json()["state"] == "waiting"

    quiet_group = groups[tuple(sorted((q1, q2)))]
    party_group = groups[tuple(sorted((p1, p2)))]
    detail = client.get(f"/api/matching/groups/{quiet_group['id']}", headers=headers).json()
    assert detail["room_score"] == quiet_group["result"]["room_score"] and len(detail["pairs"]) == 1
    assert detail["status"] == "proposed" and detail["room_type"] == "double"

    approved = client.post(f"/api/matching/groups/{quiet_group['id']}/approve", headers=headers)
    assert approved.status_code == 200 and approved.json()["status"] == "approved"
    assert approved.json()["decided_by"] == "Aigerim Nurlanova"
    assert client.post(f"/api/matching/groups/{quiet_group['id']}/approve", headers=headers).status_code == 409
    assert client.post(f"/api/matching/groups/{party_group['id']}/reject", headers=headers).status_code == 200
    assert client.post("/api/matching/groups/9999/approve", headers=headers).status_code == 404

    dashboard = client.get("/api/student/dashboard", headers=q1_headers).json()
    assert dashboard["matching"]["state"] == "matched" and dashboard["matching"]["approved_at"]
    mine = client.get("/api/student/matching", headers=q1_headers).json()
    assert mine["state"] == "matched" and mine["room_type"] == "double"
    assert [m["id"] for m in mine["group"]["members"]] == sorted([q1, q2])
    assert len(mine["pairs"]) == 1 and mine["pairs"][0]["student_1"]["id"] == q1  # the student is on the left
    assert mine["pairs"][0]["student_2"]["full_name"] == "Madina Ospan"
    assert len(mine["pairs"][0]["answers"]) == 15
    # A rejected proposal is not shown to the students in it.
    assert client.get("/api/student/matching", headers=p1_headers).json()["state"] == "waiting"

    # A new run keeps the approved room and proposes the others again.
    rerun = client.post("/api/matching/runs", headers=headers).json()
    assert [g["id"] for g in rerun["approved"]] == [quiet_group["id"]]
    proposed_members = {tuple(m["id"] for m in g["result"]["members"]) for g in rerun["proposed"]}
    assert proposed_members == {tuple(sorted((p1, p2))), tuple(t)}
    assert rerun["last_run"]["eligible_count"] == 5
    statuses = {s["id"]: s["match_status"] for s in rerun["students"]}
    assert statuses[q1] == "approved" and statuses[p1] == "proposed"


def test_students_cannot_see_other_rooms(client):
    a, a_headers = student(client, "Aliya Serikova", letters=QUIET)
    b, _ = student(client, "Dana Bekova", letters=QUIET_2)
    c, c_headers = student(client, "Madina Ospan", letters=PARTY)
    d, _ = student(client, "Zhanna Ali", letters=PARTY_2)
    headers = manager(client)
    for group in client.post("/api/matching/runs", headers=headers).json()["proposed"]:
        client.post(f"/api/matching/groups/{group['id']}/approve", headers=headers)

    seen_by_a = client.get("/api/student/matching", headers=a_headers).json()
    seen_by_c = client.get("/api/student/matching", headers=c_headers).json()
    assert {m["id"] for m in seen_by_a["group"]["members"]} == {a, b}
    assert {m["id"] for m in seen_by_c["group"]["members"]} == {c, d}
    # The student endpoints never take an id, and the manager endpoints refuse students.
    assert client.get("/api/matching/groups/1", headers=a_headers).status_code == 403
