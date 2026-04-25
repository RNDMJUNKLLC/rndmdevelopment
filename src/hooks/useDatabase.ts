import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ref,
  push,
  onValue,
  update,
  remove,
  get,
  Unsubscribe,
} from 'firebase/database';
import { database } from '@services/firebase';
import { formsActions } from '@store/slices/formsSlice';
import type { RootState, ContactFormSubmission, SOSSubmission, ServiceResponse } from '@/types';

/**
 * Custom hook for Firebase Realtime Database operations
 * Handles CRUD operations for form submissions and other data
 */
export const useDatabase = () => {
  const dispatch = useDispatch();
  const { submissions, sosRequests, loading, error } = useSelector((state: RootState) => state.forms);

  /**
   * Add a new form submission to the database
   */
  const addSubmission = useCallback(
    async (submission: Omit<ContactFormSubmission, 'id' | 'timestamp'>): Promise<ServiceResponse<ContactFormSubmission>> => {
      try {
        if (!database) throw new Error('Firebase is not configured');
        dispatch(formsActions.setLoading(true));

        const submissionsRef = ref(database, 'formSubmissions');
        const submissionWithTimestamp = {
          ...submission,
          timestamp: Date.now(),
          status: 'pending' as const,
        };

        const newSubmissionRef = await push(submissionsRef, submissionWithTimestamp);

        const newSubmission: ContactFormSubmission = {
          id: newSubmissionRef.key || '',
          ...submissionWithTimestamp,
        };

        dispatch(formsActions.addSubmission(newSubmission));
        dispatch(formsActions.setLoading(false));

        return {
          success: true,
          data: newSubmission,
          message: 'Submission saved successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add submission';
        dispatch(formsActions.setError(errorMessage));
        dispatch(formsActions.setLoading(false));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [dispatch]
  );

  /**
   * Fetch all form submissions
   */
  const fetchSubmissions = useCallback(
    async (): Promise<ServiceResponse<ContactFormSubmission[]>> => {
      try {
        if (!database) throw new Error('Firebase is not configured');
        dispatch(formsActions.setLoading(true));

        const submissionsRef = ref(database, 'formSubmissions');
        const snapshot = await get(submissionsRef);

        const submissions: ContactFormSubmission[] = [];
        snapshot.forEach((childSnapshot) => {
          submissions.push({
            id: childSnapshot.key || '',
            ...childSnapshot.val(),
          });
        });

        dispatch(formsActions.setSubmissions(submissions));
        dispatch(formsActions.setLoading(false));

        return {
          success: true,
          data: submissions,
          message: 'Submissions fetched successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch submissions';
        dispatch(formsActions.setError(errorMessage));
        dispatch(formsActions.setLoading(false));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [dispatch]
  );

  /**
   * Listen to real-time updates of form submissions
   * Returns an unsubscribe function that should be called on cleanup
   */
  const subscribeToSubmissions = useCallback(
    (callback?: (submissions: ContactFormSubmission[]) => void): Unsubscribe => {
      if (!database) {
        return () => {};
      }

      const submissionsRef = ref(database, 'formSubmissions');

      const unsubscribe = onValue(submissionsRef, (snapshot) => {
        const submissions: ContactFormSubmission[] = [];

        snapshot.forEach((childSnapshot) => {
          submissions.push({
            id: childSnapshot.key || '',
            ...childSnapshot.val(),
          });
        });

        dispatch(formsActions.setSubmissions(submissions));

        if (callback) {
          callback(submissions);
        }
      });

      return unsubscribe;
    },
    [dispatch]
  );

  /**
   * Update a form submission
   */
  const updateSubmission = useCallback(
    async (id: string, updates: Partial<ContactFormSubmission>): Promise<ServiceResponse<ContactFormSubmission>> => {
      try {
        if (!database) throw new Error('Firebase is not configured');
        dispatch(formsActions.setLoading(true));

        const submissionRef = ref(database, `formSubmissions/${id}`);
        await update(submissionRef, updates);

        const updatedSubmission: ContactFormSubmission = {
          id,
          ...submissions.find((s) => s.id === id)!,
          ...updates,
        };

        dispatch(formsActions.updateSubmission(updatedSubmission));
        dispatch(formsActions.setLoading(false));

        return {
          success: true,
          data: updatedSubmission,
          message: 'Submission updated successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update submission';
        dispatch(formsActions.setError(errorMessage));
        dispatch(formsActions.setLoading(false));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [dispatch, submissions]
  );

  /**
   * Delete a form submission
   */
  const deleteSubmission = useCallback(
    async (id: string): Promise<ServiceResponse<null>> => {
      try {
        if (!database) throw new Error('Firebase is not configured');
        dispatch(formsActions.setLoading(true));

        const submissionRef = ref(database, `formSubmissions/${id}`);
        await remove(submissionRef);

        dispatch(formsActions.removeSubmission(id));
        dispatch(formsActions.setLoading(false));

        return {
          success: true,
          message: 'Submission deleted successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete submission';
        dispatch(formsActions.setError(errorMessage));
        dispatch(formsActions.setLoading(false));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [dispatch]
  );

  /**
   * Get a single submission by ID
   */
  const getSubmission = useCallback(
    async (id: string): Promise<ServiceResponse<ContactFormSubmission>> => {
      try {
        if (!database) throw new Error('Firebase is not configured');
        dispatch(formsActions.setLoading(true));

        const submissionRef = ref(database, `formSubmissions/${id}`);
        const snapshot = await get(submissionRef);

        if (!snapshot.exists()) {
          throw new Error('Submission not found');
        }

        const submission: ContactFormSubmission = {
          id: snapshot.key || '',
          ...snapshot.val(),
        };

        dispatch(formsActions.setCurrentSubmission(submission));
        dispatch(formsActions.setLoading(false));

        return {
          success: true,
          data: submission,
          message: 'Submission fetched successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch submission';
        dispatch(formsActions.setError(errorMessage));
        dispatch(formsActions.setLoading(false));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [dispatch]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    dispatch(formsActions.clearError());
  }, [dispatch]);

  /* ─────────────── SOS Requests ─────────────── */

  const addSOSRequest = useCallback(
    async (sos: Omit<SOSSubmission, 'id'>): Promise<ServiceResponse<SOSSubmission>> => {
      try {
        if (!database) throw new Error('Firebase is not configured');
        const sosRef = ref(database, 'sosRequests');
        const payload: Omit<SOSSubmission, 'id'> = {
          ...sos,
          status: sos.status || 'pending',
        };
        const newRef = await push(sosRef, payload);
        const created: SOSSubmission = { id: newRef.key || '', ...payload };
        dispatch(formsActions.addSOSRequest(created));
        return { success: true, data: created, message: 'SOS request saved' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save SOS request';
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const fetchSOSRequests = useCallback(
    async (): Promise<ServiceResponse<SOSSubmission[]>> => {
      try {
        if (!database) throw new Error('Firebase is not configured');
        const sosRef = ref(database, 'sosRequests');
        const snapshot = await get(sosRef);
        const list: SOSSubmission[] = [];
        snapshot.forEach((child) => {
          list.push({ id: child.key || '', ...child.val() });
        });
        dispatch(formsActions.setSOSRequests(list));
        return { success: true, data: list };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SOS requests';
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const subscribeToSOSRequests = useCallback(
    (callback?: (list: SOSSubmission[]) => void): Unsubscribe => {
      if (!database) return () => {};
      const sosRef = ref(database, 'sosRequests');
      return onValue(sosRef, (snapshot) => {
        const list: SOSSubmission[] = [];
        snapshot.forEach((child) => {
          list.push({ id: child.key || '', ...child.val() });
        });
        dispatch(formsActions.setSOSRequests(list));
        if (callback) callback(list);
      });
    },
    [dispatch]
  );

  const updateSOSRequest = useCallback(
    async (id: string, updates: Partial<SOSSubmission>): Promise<ServiceResponse<SOSSubmission>> => {
      try {
        if (!database) throw new Error('Firebase is not configured');
        const sosRef = ref(database, `sosRequests/${id}`);
        await update(sosRef, updates);
        const existing = sosRequests.find((s) => s.id === id);
        const updated: SOSSubmission = { ...(existing as SOSSubmission), ...updates, id };
        dispatch(formsActions.updateSOSRequest(updated));
        return { success: true, data: updated };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update SOS request';
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, sosRequests]
  );

  const deleteSOSRequest = useCallback(
    async (id: string): Promise<ServiceResponse<null>> => {
      try {
        if (!database) throw new Error('Firebase is not configured');
        const sosRef = ref(database, `sosRequests/${id}`);
        await remove(sosRef);
        dispatch(formsActions.removeSOSRequest(id));
        return { success: true, message: 'SOS request deleted' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete SOS request';
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  return {
    // State
    submissions,
    sosRequests,
    loading,
    error,

    // Actions
    addSubmission,
    fetchSubmissions,
    subscribeToSubmissions,
    updateSubmission,
    deleteSubmission,
    getSubmission,
    clearError,
    addSOSRequest,
    fetchSOSRequests,
    subscribeToSOSRequests,
    updateSOSRequest,
    deleteSOSRequest,
  };
};

export default useDatabase;
