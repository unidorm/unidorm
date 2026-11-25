"""DEMO DATA for local testing and the project defence. Never run this on a real database.

Creates student accounts whose questionnaire is filled in and submitted through the same services the
website uses, so matching can be tried without registering 15 students by hand:

    python -m app.db.demo_students            # password for every demo student: demo2026
    python -m app.db.demo_students --remove   # deletes the demo students again

Demo emails end with @demo.unidorm.kz, so they are easy to recognise and remove.
"""

import argparse

from sqlalchemy import delete, select

import app.models  # noqa: F401
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.survey import SurveyQuestion
from app.models.user import RoomType, User, UserRole
from app.schemas.survey import AnswerIn, SaveAnswersIn
from app.services import survey as survey_service

DOMAIN = "demo.unidorm.kz"
PASSWORD = "demo2026"

# name, room type, answers to Q1..Q15 as letters a-d (one letter per question, in order)
DEMO: list[tuple[str, RoomType, str]] = [
    # 2-person rooms: two quiet early birds, two night owls, one in between
    ("Aruzhan Tulegenova", RoomType.DOUBLE, "abaaaaaababbaaa"),
    ("Kamila Saparova", RoomType.DOUBLE, "bbaaabaabbbbaab"),
    ("Dias Omarov", RoomType.DOUBLE, "dccdddcdcddcdcc"),
    ("Arman Zhaksylyk", RoomType.DOUBLE, "ddcdcdccddcdcdc"),
    ("Tomiris Bekova", RoomType.DOUBLE, "bbbbbbbbbbbbbbb"),
    ("Ainur Kassym", RoomType.DOUBLE, "bcbbbbbbbcbbbcb"),
    # 3-person rooms
    ("Madina Ospan", RoomType.TRIPLE, "abaaabaabbabaaa"),
    ("Zhanel Nurgali", RoomType.TRIPLE, "bbaabbaabbbbaab"),
    ("Saule Akhmet", RoomType.TRIPLE, "abbaabaabbbbbaa"),
    ("Yerlan Seitkali", RoomType.TRIPLE, "ccbccccccccccbc"),
    ("Nursultan Abay", RoomType.TRIPLE, "cdccccccccdcccc"),
    ("Alibek Rakhim", RoomType.TRIPLE, "ddddddddddddddc"),
    # 4-person rooms
    ("Assel Mukhtar", RoomType.QUAD, "bbbbbabbbbbbbbb"),
    ("Dana Serik", RoomType.QUAD, "bbbabbbbbbbbbbb"),
    ("Gaukhar Ali", RoomType.QUAD, "bbbbbbbabbbbbbb"),
    ("Togzhan Erik", RoomType.QUAD, "cbbbbbbbbbbbbbb"),
]


def add_demo_students() -> int:
    with SessionLocal() as db:
        questions = sorted(db.scalars(select(SurveyQuestion)), key=lambda q: int(q.code[1:]))
        if len(questions) != 15:
            raise SystemExit("Run `python -m app.db.init_db` first: the questionnaire is missing.")
        created = 0
        for name, room_type, letters in DEMO:
            email = f"{name.lower().replace(' ', '.')}@{DOMAIN}"
            if db.scalar(select(User).where(User.email == email)):
                continue
            user = User(
                full_name=name,
                email=email,
                role=UserRole.STUDENT,
                password_hash=hash_password(PASSWORD),
                room_preference=room_type,
            )
            db.add(user)
            db.commit()
            answers = [
                AnswerIn(question_id=q.id, option_ids=[next(o.id for o in q.options if o.position == "abcd".index(ch) + 1)])
                for q, ch in zip(questions, letters)
            ]
            survey_service.save_answers(db, user, SaveAnswersIn(answers=answers))
            survey_service.submit(db, user)
            created += 1
        return created


def remove_demo_students() -> int:
    with SessionLocal() as db:
        result = db.execute(delete(User).where(User.email.like(f"%@{DOMAIN}")))
        db.commit()
        return result.rowcount


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--remove", action="store_true", help="delete the demo students")
    if parser.parse_args().remove:
        print(f"Removed {remove_demo_students()} demo students.")
    else:
        count = add_demo_students()
        print(f"Added {count} demo students with submitted questionnaires (password: {PASSWORD}).")
