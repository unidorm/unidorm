"""Password hashing and session tokens, built on the Python standard library only.

Passwords: scrypt (memory-hard, recommended by OWASP) with a random 16-byte salt per user.
The stored value carries its own parameters, so they can be raised later without breaking
old hashes:  scrypt$<n>$<r>$<p>$<salt b64>$<hash b64>

Sessions: a random token is given to the browser once; only its SHA-256 is stored in the
database, so a leaked database does not leak usable tokens.
"""

import base64
import hashlib
import hmac
import secrets

_SCRYPT_N = 2**14
_SCRYPT_R = 8
_SCRYPT_P = 1
_KEY_LENGTH = 32


def _b64(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    key = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=_SCRYPT_N, r=_SCRYPT_R, p=_SCRYPT_P, dklen=_KEY_LENGTH)
    return f"scrypt${_SCRYPT_N}${_SCRYPT_R}${_SCRYPT_P}${_b64(salt)}${_b64(key)}"


def verify_password(password: str, stored: str | None) -> bool:
    """True if `password` matches the stored hash. Constant-time comparison."""
    if not stored:
        return False
    try:
        scheme, n, r, p, salt_b64, key_b64 = stored.split("$")
        if scheme != "scrypt":
            return False
        expected = base64.b64decode(key_b64)
        key = hashlib.scrypt(
            password.encode("utf-8"),
            salt=base64.b64decode(salt_b64),
            n=int(n),
            r=int(r),
            p=int(p),
            dklen=len(expected),
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(key, expected)


def new_session_token() -> str:
    """Random token for the browser (43 URL-safe characters)."""
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
