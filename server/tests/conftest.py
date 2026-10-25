import pytest

@pytest.fixture(autouse=True)
def isolated_admin_environment(monkeypatch):
    monkeypatch.setenv("ADMIN_USERNAME", "admin")
    monkeypatch.setenv("ADMIN_PASSWORD", "admin123")  # synthetic test fixture only
    monkeypatch.setenv("ADMIN_SESSION_SECRET", "test-only-cookie-secret-not-for-deployment-12345")
