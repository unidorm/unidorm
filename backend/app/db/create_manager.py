"""Creates a housing manager account (managers cannot register themselves on the website).

Run from the backend/ folder:
    python -m app.db.create_manager --email manager@kbtu.kz --name "Aigerim Nurlanova"
The password is asked for in the terminal (or pass --password for scripts).
Running it again for the same email resets that manager's name and password.
"""

import argparse
import getpass
import sys

from pydantic import ValidationError
from sqlalchemy import select

import app.models  # noqa: F401
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest


def create_manager(email: str, full_name: str, password: str) -> User:
    # Same rules for name, email and password as student registration.
    data = RegisterRequest(full_name=full_name, email=email, password=password)
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == data.email))
        if user is not None and user.role != UserRole.HOUSING_MANAGER:
            raise ValueError(f"{data.email} already belongs to a student account.")
        user = user or User(email=data.email, role=UserRole.HOUSING_MANAGER)
        user.full_name = data.full_name
        user.password_hash = hash_password(data.password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


def main() -> int:
    parser = argparse.ArgumentParser(description="Create or update a housing manager account.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--password", help="If omitted, you are asked for it.")
    args = parser.parse_args()
    password = args.password or getpass.getpass("Password (8+ characters, a letter and a number): ")
    try:
        user = create_manager(args.email, args.name, password)
    except ValidationError as error:
        print("Not saved:", "; ".join(e["msg"].removeprefix("Value error, ") for e in error.errors()), file=sys.stderr)
        return 1
    except ValueError as error:
        print("Not saved:", error, file=sys.stderr)
        return 1
    print(f"Housing manager ready: {user.email} (id {user.id}). Sign in on the website with this email.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
