import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Branch {
  id: string;
  name: string;
  city: string;
  code: string;
}

interface BranchState {
  branches: Branch[];
}

const LOCAL_STORAGE_KEY = 'cctv_branches';

const defaultBranches: Branch[] = [
  { id: 'br-hq', name: 'Headquarters (Jakarta)', city: 'Jakarta', code: 'JKT-HQ' },
  { id: 'br-bdg', name: 'Bandung Branch', city: 'Bandung', code: 'BDG-01' },
  { id: 'br-sby', name: 'Surabaya Branch', city: 'Surabaya', code: 'SBY-02' },
  { id: 'br-mdn', name: 'Medan Branch', city: 'Medan', code: 'MDN-03' },
  { id: 'br-ygk', name: 'Yogyakarta Branch', city: 'Yogyakarta', code: 'YGK-04' },
];

const loadInitialBranches = (): Branch[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading branches from localStorage', error);
  }
  return defaultBranches;
};

const initialState: BranchState = {
  branches: loadInitialBranches(),
};

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    addBranch: (state, action: PayloadAction<Omit<Branch, 'id'>>) => {
      const newId = `br-${Date.now()}`;
      const newBranch: Branch = {
        id: newId,
        ...action.payload,
      };
      state.branches.push(newBranch);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.branches));
      } catch (error) {
        console.error('Error writing branches to localStorage', error);
      }
    },
    deleteBranch: (state, action: PayloadAction<string>) => {
      state.branches = state.branches.filter((b) => b.id !== action.payload);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.branches));
      } catch (error) {
        console.error('Error writing branches to localStorage', error);
      }
    },
  },
});

export const { addBranch, deleteBranch } = branchSlice.actions;
export default branchSlice.reducer;
