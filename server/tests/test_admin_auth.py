import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from admin_auth import AdminAuth  # noqa: E402


def test_missing_password_has_no_usable_default(monkeypatch):
    monkeypatch.delenv("ADMIN_USERNAME", raising=False)
    monkeypatch.delenv("ADMIN_PASSWORD", raising=False)
    auth = AdminAuth()
    assert auth.credentials() == ("admin", "")


def test_environment_credentials_override_defaults(monkeypatch):
    monkeypatch.setenv("ADMIN_USERNAME", "researcher")
    monkeypatch.setenv("ADMIN_PASSWORD", "strong-test-password")
    assert AdminAuth().credentials() == ("researcher", "strong-test-password")


def test_password_comparison_is_false_for_wrong_password(monkeypatch):
    monkeypatch.setenv("ADMIN_USERNAME", "admin")
    monkeypatch.setenv("ADMIN_PASSWORD", "admin123")
    auth = AdminAuth()
    assert auth.verify_credentials("admin", "wrong") is False
    assert auth.verify_credentials("other", "admin123") is False
    assert auth.verify_credentials("admin", "admin123") is True


def test_missing_password_does_not_accept_published_default(monkeypatch):
    monkeypatch.delenv('ADMIN_PASSWORD', raising=False)
    assert AdminAuth().verify_credentials('admin', 'admin123') is False
    assert AdminAuth().verify_credentials('admin', '') is False


def test_missing_session_secret_is_rejected(monkeypatch):
    import pytest
    monkeypatch.delenv('ADMIN_SESSION_SECRET', raising=False)
    with pytest.raises(RuntimeError, match='ADMIN_SESSION_SECRET'):
        AdminAuth().session_secret()


def test_configured_session_secret_is_used(monkeypatch):
    monkeypatch.setenv('ADMIN_SESSION_SECRET', 'test-only-secret-not-a-deployment-key-12345')
    assert AdminAuth().session_secret() == 'test-only-secret-not-a-deployment-key-12345'
