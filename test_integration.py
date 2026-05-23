"""
Integration tests for CCTV Face Recognition Dashboard backend.
Tests complete workflows connecting frontend, backend, database, and AWS services.
"""

import pytest
import asyncio
import json
from datetime import datetime, timedelta
from typing import Optional
from httpx import AsyncClient
from unittest.mock import MagicMock, patch, AsyncMock

from app.main import app
from app.db.database import get_db, Base, engine
from app.models.users import User
from app.models.employees import Employee
from app.models.visitors import Visitor
from app.models.detections import Detection
from app.schemas.auth import UserRegister, UserLogin
from sqlalchemy.orm import Session, sessionmaker


# Test database setup
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_db():
    """Create test database and tables."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
async def client(test_db):
    """Create test client with dependency override."""
    async def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest.fixture
async def admin_token(client) -> str:
    """Create admin user and return token."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@company.com",
            "username": "admin",
            "password": "Admin123!@#",
            "full_name": "Admin User",
            "role": "admin"
        }
    )
    assert response.status_code == 201
    
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@company.com",
            "password": "Admin123!@#"
        }
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


@pytest.fixture
async def manager_token(client) -> str:
    """Create manager user and return token."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "manager@company.com",
            "username": "manager",
            "password": "Manager123!@#",
            "full_name": "Manager User",
            "role": "manager"
        }
    )
    assert response.status_code == 201
    
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "manager@company.com",
            "password": "Manager123!@#"
        }
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


@pytest.fixture
async def employee_token(client) -> str:
    """Create employee user and return token."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "employee@company.com",
            "username": "employee",
            "password": "Employee123!@#",
            "full_name": "Employee User",
            "role": "employee"
        }
    )
    assert response.status_code == 201
    
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "employee@company.com",
            "password": "Employee123!@#"
        }
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


class TestAuthIntegration:
    """Test authentication and user management flows."""
    
    async def test_user_registration(self, client):
        """Test user registration."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@company.com",
                "username": "newuser",
                "password": "NewUser123!@#",
                "full_name": "New User",
                "role": "employee"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@company.com"
        assert data["username"] == "newuser"
        assert data["role"] == "employee"
    
    async def test_duplicate_email_registration(self, client):
        """Test registration with duplicate email."""
        # Register first user
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@company.com",
                "username": "testuser",
                "password": "Test123!@#",
                "full_name": "Test User",
                "role": "employee"
            }
        )
        
        # Try to register with same email
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@company.com",
                "username": "otheruser",
                "password": "Other123!@#",
                "full_name": "Other User",
                "role": "employee"
            }
        )
        assert response.status_code == 400
    
    async def test_user_login(self, client):
        """Test user login."""
        # Register user
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "login@company.com",
                "username": "loginuser",
                "password": "Login123!@#",
                "full_name": "Login User",
                "role": "employee"
            }
        )
        
        # Login with credentials
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "login@company.com",
                "password": "Login123!@#"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    async def test_invalid_credentials(self, client):
        """Test login with wrong password."""
        # Register user
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@company.com",
                "username": "testuser",
                "password": "Test123!@#",
                "full_name": "Test User",
                "role": "employee"
            }
        )
        
        # Login with wrong password
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@company.com",
                "password": "WrongPassword"
            }
        )
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]
    
    async def test_token_refresh(self, client, employee_token):
        """Test token refresh flow."""
        # Get a refresh token first
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "employee@company.com",
                "password": "Employee123!@#"
            }
        )
        assert response.status_code == 200
        refresh_token = response.json()["refresh_token"]
        
        # Refresh token
        refresh_response = await client.post(
            "/api/v1/auth/refresh-token",
            json={"refresh_token": refresh_token}
        )
        assert refresh_response.status_code == 200
        new_data = refresh_response.json()
        assert "access_token" in new_data
        assert new_data["access_token"] != employee_token
    
    async def test_access_protected_endpoint(self, client, employee_token):
        """Test accessing protected endpoint with token."""
        headers = {"Authorization": f"Bearer {employee_token}"}
        response = await client.get("/api/v1/employees", headers=headers)
        assert response.status_code == 200
    
    async def test_access_without_token(self, client):
        """Test accessing protected endpoint without token."""
        response = await client.get("/api/v1/employees")
        assert response.status_code == 401


class TestEmployeeIntegration:
    """Test employee management workflows."""
    
    async def test_register_employee(self, client, admin_token):
        """Test registering a new employee."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = await client.post(
            "/api/v1/employees",
            json={
                "name": "John Doe",
                "email": "john@company.com",
                "department": "Engineering",
                "position": "Software Engineer",
                "employee_id": "EMP001"
            },
            headers=headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["email"] == "john@company.com"
        assert data["department"] == "Engineering"
    
    async def test_get_employee(self, client, admin_token):
        """Test retrieving employee details."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Register employee
        register_response = await client.post(
            "/api/v1/employees",
            json={
                "name": "Jane Smith",
                "email": "jane@company.com",
                "department": "HR",
                "position": "HR Manager",
                "employee_id": "EMP002"
            },
            headers=headers
        )
        emp_id = register_response.json()["emp_id"]
        
        # Get employee
        get_response = await client.get(
            f"/api/v1/employees/{emp_id}",
            headers=headers
        )
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["emp_id"] == emp_id
        assert data["name"] == "Jane Smith"
    
    async def test_update_employee(self, client, admin_token):
        """Test updating employee details."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Register employee
        register_response = await client.post(
            "/api/v1/employees",
            json={
                "name": "Bob Johnson",
                "email": "bob@company.com",
                "department": "Sales",
                "position": "Sales Rep",
                "employee_id": "EMP003"
            },
            headers=headers
        )
        emp_id = register_response.json()["emp_id"]
        
        # Update employee
        update_response = await client.put(
            f"/api/v1/employees/{emp_id}",
            json={
                "department": "Marketing",
                "position": "Marketing Manager"
            },
            headers=headers
        )
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["department"] == "Marketing"
        assert data["position"] == "Marketing Manager"
    
    async def test_list_employees(self, client, admin_token):
        """Test listing employees."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Register multiple employees
        for i in range(3):
            await client.post(
                "/api/v1/employees",
                json={
                    "name": f"Employee {i}",
                    "email": f"emp{i}@company.com",
                    "department": "IT",
                    "position": "Developer",
                    "employee_id": f"EMP{100+i}"
                },
                headers=headers
            )
        
        # List employees
        response = await client.get(
            "/api/v1/employees?skip=0&limit=10",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 3
        assert data["total"] >= 3


class TestVisitorIntegration:
    """Test visitor management workflows."""
    
    async def test_visitor_checkin(self, client, admin_token):
        """Test visitor check-in."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Register employee first
        emp_response = await client.post(
            "/api/v1/employees",
            json={
                "name": "Host Employee",
                "email": "host@company.com",
                "department": "Sales",
                "position": "Manager",
                "employee_id": "HOST001"
            },
            headers=headers
        )
        host_emp_id = emp_response.json()["emp_id"]
        
        # Check in visitor
        response = await client.post(
            "/api/v1/visitors/checkin",
            json={
                "name": "Client John",
                "email": "client@external.com",
                "organization": "Client Corp",
                "host_emp_id": host_emp_id,
                "purpose": "Business meeting",
                "phone": "555-1234"
            },
            headers=headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Client John"
        assert data["status"] == "checked_in"
        assert "visitor_id" in data
    
    async def test_visitor_checkout(self, client, admin_token):
        """Test visitor check-out."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Register employee
        emp_response = await client.post(
            "/api/v1/employees",
            json={
                "name": "Host Employee",
                "email": "host@company.com",
                "department": "Sales",
                "position": "Manager",
                "employee_id": "HOST002"
            },
            headers=headers
        )
        host_emp_id = emp_response.json()["emp_id"]
        
        # Check in visitor
        checkin_response = await client.post(
            "/api/v1/visitors/checkin",
            json={
                "name": "Visitor Test",
                "email": "visitor@external.com",
                "organization": "Test Corp",
                "host_emp_id": host_emp_id,
                "purpose": "Demo",
                "phone": "555-5678"
            },
            headers=headers
        )
        visitor_id = checkin_response.json()["visitor_id"]
        
        # Check out visitor
        checkout_response = await client.post(
            f"/api/v1/visitors/{visitor_id}/checkout",
            headers=headers
        )
        assert checkout_response.status_code == 200
        data = checkout_response.json()
        assert data["status"] == "checked_out"
        assert "check_out_time" in data
        assert "duration_minutes" in data
    
    async def test_list_active_visitors(self, client, admin_token):
        """Test listing active visitors."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Register employee
        emp_response = await client.post(
            "/api/v1/employees",
            json={
                "name": "Host Employee",
                "email": "host@company.com",
                "department": "Sales",
                "position": "Manager",
                "employee_id": "HOST003"
            },
            headers=headers
        )
        host_emp_id = emp_response.json()["emp_id"]
        
        # Check in multiple visitors
        for i in range(3):
            await client.post(
                "/api/v1/visitors/checkin",
                json={
                    "name": f"Visitor {i}",
                    "email": f"visitor{i}@external.com",
                    "organization": f"Corp {i}",
                    "host_emp_id": host_emp_id,
                    "purpose": "Meeting",
                    "phone": f"555-{1000+i}"
                },
                headers=headers
            )
        
        # List active visitors
        response = await client.get(
            "/api/v1/visitors?status=checked_in",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 3


class TestDetectionIntegration:
    """Test face detection workflows."""
    
    @patch('app.services.aws_rekognition.RekognitionService.search_faces')
    async def test_search_faces(self, mock_search, client, admin_token):
        """Test face search in database."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Mock AWS response
        mock_search.return_value = {
            "matches": [
                {
                    "person_id": "emp_001",
                    "confidence": 95.5,
                    "name": "John Doe"
                }
            ]
        }
        
        # Perform search
        response = await client.post(
            "/api/v1/detection/search",
            json={
                "collection": "employees",
                "threshold": 70
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["matches"]) > 0
    
    @patch('app.services.aws_rekognition.RekognitionService.index_face')
    async def test_index_employee_face(self, mock_index, client, admin_token):
        """Test indexing employee face."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        mock_index.return_value = {
            "face_id": "face_001",
            "confidence": 98.5
        }
        
        # Register employee
        response = await client.post(
            "/api/v1/employees",
            json={
                "name": "Face Test Employee",
                "email": "facetest@company.com",
                "department": "IT",
                "position": "Developer",
                "employee_id": "FACE001"
            },
            headers=headers
        )
        assert response.status_code == 201


class TestReportsIntegration:
    """Test reporting and analytics."""
    
    async def test_attendance_report(self, client, manager_token):
        """Test generating attendance report."""
        headers = {"Authorization": f"Bearer {manager_token}"}
        
        start_date = (datetime.now() - timedelta(days=30)).date()
        end_date = datetime.now().date()
        
        response = await client.get(
            f"/api/v1/reports/attendance?start_date={start_date}&end_date={end_date}",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "records" in data
        assert "total" in data
    
    async def test_visitor_report(self, client, manager_token):
        """Test generating visitor report."""
        headers = {"Authorization": f"Bearer {manager_token}"}
        
        start_date = (datetime.now() - timedelta(days=30)).date()
        end_date = datetime.now().date()
        
        response = await client.get(
            f"/api/v1/reports/visitors?start_date={start_date}&end_date={end_date}",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "records" in data


class TestRoleBasedAccess:
    """Test role-based access control (RBAC)."""
    
    async def test_employee_cannot_register_others(self, client, employee_token):
        """Test that employees cannot register other employees."""
        headers = {"Authorization": f"Bearer {employee_token}"}
        
        response = await client.post(
            "/api/v1/employees",
            json={
                "name": "New Employee",
                "email": "new@company.com",
                "department": "Sales",
                "position": "Rep",
                "employee_id": "NEW001"
            },
            headers=headers
        )
        assert response.status_code == 403
    
    async def test_employee_cannot_access_admin_endpoints(self, client, employee_token):
        """Test that employees cannot access admin endpoints."""
        headers = {"Authorization": f"Bearer {employee_token}"}
        
        response = await client.get(
            "/api/v1/admin/users",
            headers=headers
        )
        assert response.status_code == 403
    
    async def test_manager_can_generate_reports(self, client, manager_token):
        """Test that managers can generate reports."""
        headers = {"Authorization": f"Bearer {manager_token}"}
        
        response = await client.get(
            "/api/v1/reports/attendance",
            headers=headers
        )
        assert response.status_code == 200


class TestErrorHandling:
    """Test error handling and validation."""
    
    async def test_missing_required_fields(self, client):
        """Test registration with missing fields."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@company.com"
                # Missing password, username, etc.
            }
        )
        assert response.status_code == 422
    
    async def test_invalid_email_format(self, client):
        """Test registration with invalid email."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "notanemail",
                "username": "testuser",
                "password": "Test123!@#",
                "full_name": "Test User",
                "role": "employee"
            }
        )
        assert response.status_code == 422
    
    async def test_weak_password(self, client):
        """Test registration with weak password."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@company.com",
                "username": "testuser",
                "password": "weak",
                "full_name": "Test User",
                "role": "employee"
            }
        )
        assert response.status_code == 422
    
    async def test_nonexistent_resource(self, client, admin_token):
        """Test accessing nonexistent resource."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = await client.get(
            "/api/v1/employees/nonexistent",
            headers=headers
        )
        assert response.status_code == 404


class TestHealthChecks:
    """Test application health and readiness."""
    
    async def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    async def test_readiness_endpoint(self, client):
        """Test readiness check endpoint."""
        response = await client.get("/api/v1/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["ready"] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
