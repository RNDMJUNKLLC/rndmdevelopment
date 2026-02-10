import React, { useState } from 'react';
import { useAuth } from '@/hooks';
import LoginForm from '@components/forms/LoginForm';
import SignupForm from '@components/forms/SignupForm';

type AuthMode = 'login' | 'signup';

export const Account: React.FC = () => {
  const { user, isLoggedIn, signout } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  if (isLoggedIn && user) {
    return (
      <div className="section container-max">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold mb-2">Welcome, {user.displayName || user.email}!</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">You are logged in to your account.</p>

            <div className="space-y-4 mb-8 bg-slate-50 dark:bg-slate-700 p-6 rounded">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              {user.displayName && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Display Name</label>
                  <p className="text-lg">{user.displayName}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">User ID</label>
                <p className="text-lg font-mono text-sm">{user.uid}</p>
              </div>
            </div>

            <button
              onClick={() => signout()}
              className="btn-primary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section container-max">
      <div className="max-w-md mx-auto">
        {/* Auth Mode Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setAuthMode('login')}
            className={`px-4 py-2 font-medium transition ${
              authMode === 'login'
                ? 'text-accent-600 border-b-2 border-accent-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`px-4 py-2 font-medium transition ${
              authMode === 'signup'
                ? 'text-accent-600 border-b-2 border-accent-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        {authMode === 'login' ? (
          <LoginForm onSuccess={() => setAuthMode('login')} />
        ) : (
          <SignupForm onSuccess={() => setAuthMode('login')} />
        )}
      </div>
    </div>
  );
};

export default Account;
