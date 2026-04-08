"""DB resolver: maps user_id to per-user SQLite vault database."""

from __future__ import annotations

import os
import sqlite3
import sys

from app.config import settings

# Add the src directory to sys.path so we can import vocabulary_vault
_src_dir = os.path.join(os.path.dirname(__file__), "..", "..", "src")
_src_dir = os.path.normpath(_src_dir)
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from vocabulary_vault.db import get_db_connection  # noqa: E402


def get_user_db(user_id: int) -> sqlite3.Connection:
    """Return a sqlite3.Connection for the given user's vault database.

    Path: {DATA_DIR}/vaults/{user_id}/vault.db
    Auto-creates the directory if it doesn't exist.
    Delegates to vocabulary_vault.db.get_db_connection() which handles
    schema initialization (tables, FTS, user_stats row).
    """
    vault_dir = os.path.join(settings.DATA_DIR, "vaults", str(user_id))
    os.makedirs(vault_dir, exist_ok=True)
    db_path = os.path.join(vault_dir, "vault.db")
    return get_db_connection(db_path)
