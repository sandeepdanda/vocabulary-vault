"""Shared fixtures for backend tests."""

import os
import shutil
import tempfile

import pytest
from fastapi.testclient import TestClient

from app.config import settings


@pytest.fixture(autouse=True)
def _isolated_data_dir(tmp_path, monkeypatch):
    """Point settings.DATA_DIR to a temp directory for every test."""
    monkeypatch.setattr(settings, "DATA_DIR", str(tmp_path / "data"))
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    # Re-init users DB in the new location
    from app.auth import init_users_db
    init_users_db()
    yield


@pytest.fixture()
def client():
    from app.main import app
    return TestClient(app)


@pytest.fixture()
def auth_client(client):
    """A TestClient already authenticated as 'testuser'."""
    client.post("/api/auth/register", json={"username": "testuser", "password": "testpass123"})
    return client
