import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FormsState, ContactFormSubmission } from '@/types';

const initialState: FormsState = {
  submissions: [],
  currentSubmission: null,
  loading: false,
  error: null,
  status: 'idle',
};

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    setSubmissions: (state: FormsState, action: PayloadAction<ContactFormSubmission[]>) => {
      state.submissions = action.payload;
    },
    addSubmission: (state: FormsState, action: PayloadAction<ContactFormSubmission>) => {
      state.submissions.push(action.payload);
    },
    updateSubmission: (state: FormsState, action: PayloadAction<ContactFormSubmission>) => {
      const index = state.submissions.findIndex((s: ContactFormSubmission) => s.id === action.payload.id);
      if (index !== -1) {
        state.submissions[index] = action.payload;
      }
    },
    setCurrentSubmission: (state: FormsState, action: PayloadAction<ContactFormSubmission | null>) => {
      state.currentSubmission = action.payload;
    },
    setLoading: (state: FormsState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setStatus: (state: FormsState, action: PayloadAction<'idle' | 'loading' | 'success' | 'error'>) => {
      state.status = action.payload;
    },
    setError: (state: FormsState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state: FormsState) => {
      state.error = null;
    },
    clearCurrentSubmission: (state: FormsState) => {
      state.currentSubmission = null;
    },
  },
});

export const formsActions = formsSlice.actions;
export default formsSlice.reducer;
