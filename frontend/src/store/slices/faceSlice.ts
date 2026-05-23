import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Face, Person } from '@types/index';

interface FaceState {
  faces: Face[];
  persons: Person[];
  selectedFace: Face | null;
  selectedPerson: Person | null;
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
}

const initialState: FaceState = {
  faces: [],
  persons: [],
  selectedFace: null,
  selectedPerson: null,
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,
};

const faceSlice = createSlice({
  name: 'faces',
  initialState,
  reducers: {
    // Fetch faces
    fetchFacesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFacesSuccess: (state, action: PayloadAction<{ faces: Face[]; total: number }>) => {
      state.loading = false;
      state.faces = action.payload.faces;
      state.total = action.payload.total;
    },
    fetchFacesError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Select face
    selectFace: (state, action: PayloadAction<Face | null>) => {
      state.selectedFace = action.payload;
    },

    // Fetch persons
    fetchPersonsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPersonsSuccess: (state, action: PayloadAction<Person[]>) => {
      state.loading = false;
      state.persons = action.payload;
    },
    fetchPersonsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Select person
    selectPerson: (state, action: PayloadAction<Person | null>) => {
      state.selectedPerson = action.payload;
    },

    // Create person
    createPersonStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPersonSuccess: (state, action: PayloadAction<Person>) => {
      state.loading = false;
      state.persons.push(action.payload);
    },
    createPersonError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update person
    updatePersonStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePersonSuccess: (state, action: PayloadAction<Person>) => {
      state.loading = false;
      const index = state.persons.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.persons[index] = action.payload;
      }
      if (state.selectedPerson?.id === action.payload.id) {
        state.selectedPerson = action.payload;
      }
    },
    updatePersonError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete person
    deletePersonStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deletePersonSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.persons = state.persons.filter((p) => p.id !== action.payload);
      if (state.selectedPerson?.id === action.payload) {
        state.selectedPerson = null;
      }
    },
    deletePersonError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },
  },
});

export const {
  fetchFacesStart,
  fetchFacesSuccess,
  fetchFacesError,
  selectFace,
  fetchPersonsStart,
  fetchPersonsSuccess,
  fetchPersonsError,
  selectPerson,
  createPersonStart,
  createPersonSuccess,
  createPersonError,
  updatePersonStart,
  updatePersonSuccess,
  updatePersonError,
  deletePersonStart,
  deletePersonSuccess,
  deletePersonError,
  setCurrentPage,
  setPageSize,
} = faceSlice.actions;

export default faceSlice.reducer;
