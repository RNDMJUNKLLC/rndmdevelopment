import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FormsState, ContactFormSubmission, SOSSubmission } from '@/types';

const initialState: FormsState = {
  submissions: [],
  sosRequests: [],
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
    removeSubmission: (state: FormsState, action: PayloadAction<string>) => {
      state.submissions = state.submissions.filter((s) => s.id !== action.payload);
    },
    setSOSRequests: (state: FormsState, action: PayloadAction<SOSSubmission[]>) => {
      state.sosRequests = action.payload;
    },
    addSOSRequest: (state: FormsState, action: PayloadAction<SOSSubmission>) => {
      state.sosRequests.push(action.payload);
    },
    updateSOSRequest: (state: FormsState, action: PayloadAction<SOSSubmission>) => {
      const index = state.sosRequests.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.sosRequests[index] = action.payload;
      }
    },
    removeSOSRequest: (state: FormsState, action: PayloadAction<string>) => {
      state.sosRequests = state.sosRequests.filter((s) => s.id !== action.payload);
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
