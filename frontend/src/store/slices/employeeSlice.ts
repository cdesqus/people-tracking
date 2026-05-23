import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '@types/management';

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  departmentFilter: string;
  success: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  selectedEmployee: null,
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 10,
  searchTerm: '',
  departmentFilter: '',
  success: null,
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    // Fetch employees
    fetchEmployeesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEmployeesSuccess: (
      state,
      action: PayloadAction<{ employees: Employee[]; total: number }>
    ) => {
      state.loading = false;
      state.employees = action.payload.employees;
      state.total = action.payload.total;
    },
    fetchEmployeesError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create employee
    createEmployeeStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    },
    createEmployeeSuccess: (state, action: PayloadAction<Employee>) => {
      state.loading = false;
      state.employees.unshift(action.payload);
      state.total += 1;
      state.success = 'Employee registered successfully';
    },
    createEmployeeError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update employee
    updateEmployeeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateEmployeeSuccess: (state, action: PayloadAction<Employee>) => {
      state.loading = false;
      const index = state.employees.findIndex(
        (e) => e.id === action.payload.id
      );
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
      if (state.selectedEmployee?.id === action.payload.id) {
        state.selectedEmployee = action.payload;
      }
      state.success = 'Employee updated successfully';
    },
    updateEmployeeError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete employee
    deleteEmployeeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteEmployeeSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.employees = state.employees.filter(
        (e) => e.id !== action.payload
      );
      state.total -= 1;
      state.success = 'Employee deleted successfully';
    },
    deleteEmployeeError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Select employee
    selectEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },

    // Set pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },

    // Set filters
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setDepartmentFilter: (state, action: PayloadAction<string>) => {
      state.departmentFilter = action.payload;
      state.currentPage = 1;
    },

    // Clear messages
    clearSuccess: (state) => {
      state.success = null;
    },
    clearError: (state) => {
      state.error = null;
    },

    // WebSocket update
    updateEmployeeRealtimeStart: (state) => {
      // No-op for WebSocket update
    },
    updateEmployeeRealtime: (state, action: PayloadAction<Partial<Employee>>) => {
      const employee = state.employees.find(
        (e) => e.id === (action.payload as any).id
      );
      if (employee) {
        Object.assign(employee, action.payload);
      }
    },
  },
});

export const {
  fetchEmployeesStart,
  fetchEmployeesSuccess,
  fetchEmployeesError,
  createEmployeeStart,
  createEmployeeSuccess,
  createEmployeeError,
  updateEmployeeStart,
  updateEmployeeSuccess,
  updateEmployeeError,
  deleteEmployeeStart,
  deleteEmployeeSuccess,
  deleteEmployeeError,
  selectEmployee,
  setCurrentPage,
  setPageSize,
  setSearchTerm,
  setDepartmentFilter,
  clearSuccess,
  clearError,
  updateEmployeeRealtime,
} = employeeSlice.actions;

export default employeeSlice.reducer;
