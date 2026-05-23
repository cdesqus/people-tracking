/**
 * Frontend Integration Tests
 * Tests complete workflows connecting frontend components to backend API
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import EmployeeRegistry from '../pages/EmployeeRegistry';
import * as api from '../services/api';


// Mock API module
jest.mock('../services/api');


describe('Frontend-Backend Integration Tests', () => {
  
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient();
    jest.clearAllMocks();
  });

  const renderWithProviders = (component) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  // ============ Authentication Integration ============

  describe('Authentication Flow', () => {
    
    test('User can register and login', async () => {
      const user = userEvent.setup();
      
      // Mock registration
      api.register.mockResolvedValueOnce({
        user_id: 'user_001',
        email: 'test@company.com',
        role: 'employee'
      });

      // Mock login
      api.login.mockResolvedValueOnce({
        access_token: 'mock_token_123',
        refresh_token: 'mock_refresh_456',
        user: {
          user_id: 'user_001',
          email: 'test@company.com',
          role: 'employee'
        }
      });

      renderWithProviders(<App />);

      // Navigate to registration
      const registerLink = screen.getByRole('link', { name: /register/i });
      await user.click(registerLink);

      // Fill registration form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const fullNameInput = screen.getByLabelText(/full name/i);

      await user.type(emailInput, 'test@company.com');
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'Test123!@#');
      await user.type(fullNameInput, 'Test User');

      // Submit registration
      const registerButton = screen.getByRole('button', { name: /register/i });
      await user.click(registerButton);

      // Wait for navigation to login
      await waitFor(() => {
        expect(screen.getByText(/login/i)).toBeInTheDocument();
      });

      // Fill login form
      const loginEmailInput = screen.getByLabelText(/email/i);
      const loginPasswordInput = screen.getByLabelText(/password/i);

      await user.clear(loginEmailInput);
      await user.type(loginEmailInput, 'test@company.com');
      await user.clear(loginPasswordInput);
      await user.type(loginPasswordInput, 'Test123!@#');

      // Submit login
      const loginButton = screen.getByRole('button', { name: /login/i });
      await user.click(loginButton);

      // Verify token is stored
      await waitFor(() => {
        expect(localStorage.getItem('access_token')).toBe('mock_token_123');
      });

      // Wait for dashboard redirect
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });

    test('User sees error on invalid credentials', async () => {
      const user = userEvent.setup();
      
      api.login.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { detail: 'Invalid credentials' }
        }
      });

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@company.com');
      await user.type(passwordInput, 'wrongpassword');

      const loginButton = screen.getByRole('button', { name: /login/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    test('Token refresh works automatically', async () => {
      const user = userEvent.setup();
      
      api.refreshToken.mockResolvedValueOnce({
        access_token: 'new_token_789',
        refresh_token: 'new_refresh_012'
      });

      renderWithProviders(<Dashboard />);

      // Simulate token expiration and auto-refresh
      localStorage.setItem('access_token', 'expired_token');
      localStorage.setItem('refresh_token', 'valid_refresh_token');

      await waitFor(() => {
        expect(api.refreshToken).toHaveBeenCalledWith('valid_refresh_token');
      });

      expect(localStorage.getItem('access_token')).toBe('new_token_789');
    });
  });

  // ============ Employee Registry Integration ============

  describe('Employee Registry', () => {
    
    test('Admin can register new employee', async () => {
      const user = userEvent.setup();
      
      api.registerEmployee.mockResolvedValueOnce({
        emp_id: 'emp_001',
        name: 'John Doe',
        email: 'john@company.com',
        department: 'Engineering',
        status: 'active'
      });

      renderWithProviders(<EmployeeRegistry />);

      const registerButton = screen.getByRole('button', { name: /register employee/i });
      await user.click(registerButton);

      // Form appears
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const departmentSelect = screen.getByLabelText(/department/i);

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@company.com');
      await user.selectOptions(departmentSelect, 'Engineering');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.registerEmployee).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John Doe',
            email: 'john@company.com',
            department: 'Engineering'
          })
        );
      });

      expect(screen.getByText(/successfully registered/i)).toBeInTheDocument();
    });

    test('Employee list fetches and displays data', async () => {
      api.getEmployees.mockResolvedValueOnce({
        items: [
          {
            emp_id: 'emp_001',
            name: 'John Doe',
            email: 'john@company.com',
            department: 'Engineering'
          },
          {
            emp_id: 'emp_002',
            name: 'Jane Smith',
            email: 'jane@company.com',
            department: 'HR'
          }
        ],
        total: 2
      });

      renderWithProviders(<EmployeeRegistry />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      expect(api.getEmployees).toHaveBeenCalled();
    });

    test('Employee search filters results', async () => {
      const user = userEvent.setup();
      
      api.searchEmployees.mockResolvedValueOnce({
        items: [
          {
            emp_id: 'emp_001',
            name: 'John Doe',
            email: 'john@company.com',
            department: 'Engineering'
          }
        ],
        total: 1
      });

      renderWithProviders(<EmployeeRegistry />);

      const searchInput = screen.getByPlaceholderText(/search employees/i);
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(api.searchEmployees).toHaveBeenCalledWith('John');
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('Employee can be updated', async () => {
      const user = userEvent.setup();
      
      api.updateEmployee.mockResolvedValueOnce({
        emp_id: 'emp_001',
        name: 'John Doe',
        department: 'Management'
      });

      renderWithProviders(<EmployeeRegistry />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const departmentField = screen.getByLabelText(/department/i);
      await user.clear(departmentField);
      await user.type(departmentField, 'Management');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(api.updateEmployee).toHaveBeenCalled();
      });
    });
  });

  // ============ Visitor Management Integration ============

  describe('Visitor Management', () => {
    
    test('Receptionist can check in visitor', async () => {
      const user = userEvent.setup();
      
      api.checkinVisitor.mockResolvedValueOnce({
        visitor_id: 'v_001',
        name: 'Client John',
        status: 'checked_in',
        check_in_time: new Date().toISOString()
      });

      const VisitorCheckin = () => (
        <form onSubmit={(e) => {
          e.preventDefault();
          api.checkinVisitor({
            name: 'Client John',
            email: 'client@external.com',
            organization: 'Client Corp'
          });
        }}>
          <input placeholder="Name" defaultValue="Client John" />
          <input placeholder="Email" defaultValue="client@external.com" />
          <input placeholder="Organization" defaultValue="Client Corp" />
          <button type="submit">Check In</button>
        </form>
      );

      renderWithProviders(<VisitorCheckin />);

      const checkinButton = screen.getByRole('button', { name: /check in/i });
      await user.click(checkinButton);

      await waitFor(() => {
        expect(api.checkinVisitor).toHaveBeenCalled();
      });
    });

    test('Visitor can be checked out', async () => {
      const user = userEvent.setup();
      
      api.checkoutVisitor.mockResolvedValueOnce({
        visitor_id: 'v_001',
        status: 'checked_out',
        duration_minutes: 45
      });

      renderWithProviders(<VisitorCheckin />);

      const checkoutButton = screen.getByRole('button', { name: /check out/i });
      await user.click(checkoutButton);

      await waitFor(() => {
        expect(api.checkoutVisitor).toHaveBeenCalled();
      });

      expect(screen.getByText(/duration: 45 minutes/i)).toBeInTheDocument();
    });

    test('Active visitors list updates in real-time', async () => {
      api.getActiveVisitors.mockResolvedValueOnce({
        items: [
          {
            visitor_id: 'v_001',
            name: 'Client A',
            check_in_time: new Date().toISOString()
          },
          {
            visitor_id: 'v_002',
            name: 'Client B',
            check_in_time: new Date().toISOString()
          }
        ],
        total: 2
      });

      renderWithProviders(<VisitorList />);

      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument();
        expect(screen.getByText('Client B')).toBeInTheDocument();
      });
    });
  });

  // ============ Face Detection Integration ============

  describe('Face Detection', () => {
    
    test('Face search returns matching employees', async () => {
      const user = userEvent.setup();
      
      api.searchFaces.mockResolvedValueOnce({
        matches: [
          {
            emp_id: 'emp_001',
            name: 'John Doe',
            confidence: 95.5,
            match_count: 3
          }
        ]
      });

      const FaceSearch = () => (
        <form onSubmit={(e) => {
          e.preventDefault();
          api.searchFaces({ collection: 'employees' });
        }}>
          <button type="submit">Search Faces</button>
        </form>
      );

      renderWithProviders(<FaceSearch />);

      const searchButton = screen.getByRole('button', { name: /search faces/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        expect(screen.getByText(/95.5%/i)).toBeInTheDocument();
      });
    });
  });

  // ============ Real-time Updates (WebSocket) ============

  describe('Real-time Updates via WebSocket', () => {
    
    test('Dashboard receives detection updates via WebSocket', async () => {
      const mockWebSocket = {
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      };

      global.WebSocket = jest.fn(() => mockWebSocket);

      renderWithProviders(<Dashboard />);

      // Simulate server sending detection
      const messageListener = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1];

      const detection = {
        type: 'detection',
        emp_id: 'emp_001',
        name: 'John Doe',
        confidence: 95.5,
        location: 'Main Entrance',
        timestamp: new Date().toISOString()
      };

      messageListener({
        data: JSON.stringify(detection)
      });

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      });
    });

    test('Multiple concurrent updates are handled', async () => {
      const mockWebSocket = {
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      };

      global.WebSocket = jest.fn(() => mockWebSocket);

      renderWithProviders(<Dashboard />);

      const messageListener = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1];

      // Send multiple updates
      const updates = [
        { type: 'detection', emp_id: 'emp_001', name: 'John Doe', confidence: 95 },
        { type: 'detection', emp_id: 'emp_002', name: 'Jane Smith', confidence: 92 },
        { type: 'visitor_checkin', visitor_id: 'v_001', name: 'Client A' }
      ];

      updates.forEach(update => {
        messageListener({ data: JSON.stringify(update) });
      });

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
        expect(screen.getByText(/client a/i)).toBeInTheDocument();
      });
    });
  });

  // ============ Reports and Analytics ============

  describe('Reports and Analytics', () => {
    
    test('User can generate attendance report', async () => {
      const user = userEvent.setup();
      
      api.getAttendanceReport.mockResolvedValueOnce({
        period: 'May 2026',
        total_employees: 50,
        records: [
          {
            emp_id: 'emp_001',
            name: 'John Doe',
            present_days: 20,
            absent_days: 2,
            late_count: 1
          }
        ]
      });

      const Reports = () => (
        <form onSubmit={(e) => {
          e.preventDefault();
          api.getAttendanceReport({ month: '2026-05' });
        }}>
          <button type="submit">Generate Report</button>
        </form>
      );

      renderWithProviders(<Reports />);

      const generateButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        expect(screen.getByText(/20/)).toBeInTheDocument();
      });
    });
  });

  // ============ Error Handling ============

  describe('Error Handling and Edge Cases', () => {
    
    test('Network error is handled gracefully', async () => {
      api.getEmployees.mockRejectedValueOnce(
        new Error('Network error')
      );

      renderWithProviders(<EmployeeRegistry />);

      await waitFor(() => {
        expect(screen.getByText(/error loading employees/i)).toBeInTheDocument();
      });
    });

    test('Server 500 error shows retry option', async () => {
      const user = userEvent.setup();
      
      api.registerEmployee.mockRejectedValueOnce({
        response: { status: 500 }
      });

      renderWithProviders(<EmployeeRegistry />);

      const registerButton = screen.getByRole('button', { name: /register/i });
      await user.click(registerButton);

      const retryButton = await screen.findByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    test('Timeout error is handled', async () => {
      api.getEmployees.mockRejectedValueOnce(
        new Error('Request timeout')
      );

      renderWithProviders(<EmployeeRegistry />);

      await waitFor(() => {
        expect(screen.getByText(/request timeout/i)).toBeInTheDocument();
      });
    });
  });
});
