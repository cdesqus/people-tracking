import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Visitor } from '@types/management';

interface VisitorState {
  visitors: Visitor[];
  selectedVisitor: Visitor | null;
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  statusFilter: 'all' | 'checked_in' | 'checked_out' | 'expired';
  success: string | null;
}

const initialState: VisitorState = {
  visitors: [],
  selectedVisitor: null,
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 10,
  searchTerm: '',
  statusFilter: 'checked_in',
  success: null,
};

const visitorSlice = createSlice({
  name: 'visitors',
  initialState,
  reducers: {
    // Fetch visitors
    fetchVisitorsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVisitorsSuccess: (
      state,
      action: PayloadAction<{ visitors: Visitor[]; total: number }>
    ) => {
      state.loading = false;
      state.visitors = action.payload.visitors;
      state.total = action.payload.total;
    },
    fetchVisitorsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Check-in visitor
    checkInVisitorStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    },
    checkInVisitorSuccess: (state, action: PayloadAction<Visitor>) => {
      state.loading = false;
      state.visitors.unshift(action.payload);
      state.total += 1;
      state.success = 'Visitor checked in successfully';
    },
    checkInVisitorError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Check-out visitor
    checkOutVisitorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    checkOutVisitorSuccess: (state, action: PayloadAction<Visitor>) => {
      state.loading = false;
      const index = state.visitors.findIndex(
        (v) => v.id === action.payload.id
      );
      if (index !== -1) {
        state.visitors[index] = action.payload;
      }
      if (state.selectedVisitor?.id === action.payload.id) {
        state.selectedVisitor = action.payload;
      }
      state.success = 'Visitor checked out successfully';
    },
    checkOutVisitorError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update visitor
    updateVisitorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateVisitorSuccess: (state, action: PayloadAction<Visitor>) => {
      state.loading = false;
      const index = state.visitors.findIndex(
        (v) => v.id === action.payload.id
      );
      if (index !== -1) {
        state.visitors[index] = action.payload;
      }
      if (state.selectedVisitor?.id === action.payload.id) {
        state.selectedVisitor = action.payload;
      }
      state.success = 'Visitor updated successfully';
    },
    updateVisitorError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete visitor
    deleteVisitorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteVisitorSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.visitors = state.visitors.filter(
        (v) => v.id !== action.payload
      );
      state.total -= 1;
      state.success = 'Visitor deleted successfully';
    },
    deleteVisitorError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Select visitor
    selectVisitor: (state, action: PayloadAction<Visitor | null>) => {
      state.selectedVisitor = action.payload;
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
    setStatusFilter: (
      state,
      action: PayloadAction<'all' | 'checked_in' | 'checked_out' | 'expired'>
    ) => {
      state.statusFilter = action.payload;
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
    updateVisitorRealtime: (state, action: PayloadAction<Partial<Visitor>>) => {
      const visitor = state.visitors.find(
        (v) => v.id === (action.payload as any).id
      );
      if (visitor) {
        Object.assign(visitor, action.payload);
      }
    },
  },
});

export const {
  fetchVisitorsStart,
  fetchVisitorsSuccess,
  fetchVisitorsError,
  checkInVisitorStart,
  checkInVisitorSuccess,
  checkInVisitorError,
  checkOutVisitorStart,
  checkOutVisitorSuccess,
  checkOutVisitorError,
  updateVisitorStart,
  updateVisitorSuccess,
  updateVisitorError,
  deleteVisitorStart,
  deleteVisitorSuccess,
  deleteVisitorError,
  selectVisitor,
  setCurrentPage,
  setPageSize,
  setSearchTerm,
  setStatusFilter,
  clearSuccess,
  clearError,
  updateVisitorRealtime,
} = visitorSlice.actions;

export default visitorSlice.reducer;
