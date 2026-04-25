import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { ref, set, update as dbUpdate } from 'firebase/database';
import { auth, database } from '@services/firebase';
import { authActions } from '@store/slices/authSlice';
import type { RootState, User, UserProfile, ServiceResponse } from '@/types';

/**
 * Custom hook for Firebase authentication
 * Manages user login, signup, logout, and auth state
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoggedIn, loading, error } = useSelector((state: RootState) => state.auth);

  /**
   * Initialize auth listener on mount
   */
  useEffect(() => {
    if (!auth) {
      dispatch(authActions.setLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        dispatch(authActions.setUser(user));
      } else {
        dispatch(authActions.logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  /**
   * Sign up a new user
   */
  const signup = useCallback(
    async (email: string, password: string, displayName?: string): Promise<ServiceResponse<User>> => {
      try {
        if (!auth) throw new Error('Firebase is not configured');
        dispatch(authActions.setLoading(true));
        dispatch(authActions.setError(null));

        const result = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName) {
          await updateProfile(result.user, { displayName });
        }

        const user: User = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        };

        // Persist user record under /users/{uid} so the admin dashboard can list them
        if (database) {
          try {
            await set(ref(database, `users/${user.uid}`), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              dateJoined: Date.now(),
              dateJoinedISO: new Date().toISOString(),
              source: 'rndmdevelopment',
            });
          } catch (dbErr) {
            // Non-fatal — auth user was created
            console.warn('Failed to write user record to RTDB:', dbErr);
          }
        }

        dispatch(authActions.setUser(user));
        dispatch(authActions.setLoading(false));

        return {
          success: true,
          data: user,
          message: 'Account created successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Signup failed';
        dispatch(authActions.setError(errorMessage));
        dispatch(authActions.setLoading(false));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [dispatch]
  );

  /**
   * Sign in with email and password
   */
  const signin = useCallback(
    async (email: string, password: string): Promise<ServiceResponse<User>> => {
      try {
        if (!auth) throw new Error('Firebase is not configured');
        dispatch(authActions.setLoading(true));
        dispatch(authActions.setError(null));

        const result = await signInWithEmailAndPassword(auth, email, password);

        const user: User = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        };

        // Update lastLogin timestamp under /users/{uid}
        if (database) {
          try {
            await dbUpdate(ref(database, `users/${user.uid}`), {
              lastLogin: Date.now(),
              lastLoginISO: new Date().toISOString(),
              email: user.email,
              displayName: user.displayName,
            });
          } catch (dbErr) {
            console.warn('Failed to update user lastLogin:', dbErr);
          }
        }

        dispatch(authActions.setUser(user));
        dispatch(authActions.setLoading(false));

        return {
          success: true,
          data: user,
          message: 'Signed in successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
        dispatch(authActions.setError(errorMessage));
        dispatch(authActions.setLoading(false));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [dispatch]
  );

  /**
   * Sign out the current user
   */
  const signout = useCallback(async (): Promise<ServiceResponse<null>> => {
    try {
      if (!auth) throw new Error('Firebase is not configured');
      dispatch(authActions.setLoading(true));
      await firebaseSignOut(auth);
      dispatch(authActions.logout());
      dispatch(authActions.setLoading(false));

      return {
        success: true,
        message: 'Signed out successfully',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      dispatch(authActions.setError(errorMessage));
      dispatch(authActions.setLoading(false));

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [dispatch]);

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback(
    async (profile: Partial<UserProfile>): Promise<ServiceResponse<User>> => {
      try {
        if (!auth || !auth.currentUser) {
          throw new Error(!auth ? 'Firebase is not configured' : 'No user logged in');
        }

        dispatch(authActions.setLoading(true));

        await updateProfile(auth.currentUser, {
          displayName: profile.displayName || auth.currentUser.displayName,
          photoURL: profile.displayName === '' ? null : auth.currentUser.photoURL,
        });

        const updatedUser: User = {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
        };

        dispatch(authActions.setUser(updatedUser));
        dispatch(authActions.setLoading(false));

        return {
          success: true,
          data: updatedUser,
          message: 'Profile updated successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
        dispatch(authActions.setError(errorMessage));
        dispatch(authActions.setLoading(false));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [dispatch]
  );

  /**
   * Clear auth error
   */
  const clearError = useCallback(() => {
    dispatch(authActions.clearError());
  }, [dispatch]);

  return {
    // State
    user,
    isLoggedIn,
    loading,
    error,

    // Actions
    signup,
    signin,
    signout,
    updateUserProfile,
    clearError,
  };
};

export default useAuth;
