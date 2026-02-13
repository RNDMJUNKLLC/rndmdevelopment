import React, { useState, useEffect } from 'react';
import SEOHead from '@components/SEOHead';
import { useAuth, useDatabase, useDiscord } from '@/hooks';
import LoginForm from '@components/forms/LoginForm';
import SignupForm from '@components/forms/SignupForm';
import AdminDashboard from '@components/admin/AdminDashboard';
import type { ContactFormSubmission } from '@/types';

type AuthMode = 'login' | 'signup';
type AccountTab = 'submissions' | 'sos' | 'profile' | 'admin';

/* ───── Status Badge ───── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const classes: Record<string, string> = {
    pending: 'badge-pending',
    viewed: 'badge-viewed',
    responded: 'badge-responded',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${classes[status] || 'bg-slate-700 text-slate-300'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

/* ───── My Submissions Tab ───── */
const SubmissionsTab: React.FC<{
  submissions: ContactFormSubmission[];
  loading: boolean;
}> = ({ submissions, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">No Submissions Yet</h3>
        <p className="text-slate-500">
          Your form submissions will appear here once you send an inquiry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub) => (
        <div key={sub.id} className="card p-6 group">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h4 className="font-semibold text-white group-hover:text-purple-300 transition">
                {sub.projectType}
              </h4>
              <p className="text-xs text-slate-500">
                {new Date(sub.timestamp).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <StatusBadge status={sub.status} />
          </div>
          <p className="text-slate-400 text-sm line-clamp-2">{sub.message}</p>
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span>💰 {sub.budget}</span>
            <span>⏱ {sub.timeline}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ───── SOS Request Tab ───── */
const SOSTab: React.FC<{ userEmail: string; userName: string }> = ({
  userEmail,
  userName,
}) => {
  const { sendDiscordNotification, sending } = useDiscord();
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const sosSubmission = {
      name: userName,
      email: userEmail,
      projectType: `🚨 SOS Request (${urgency.toUpperCase()})`,
      budget: 'N/A',
      timeline: 'ASAP',
      message: reason,
      status: 'pending' as const,
    };

    await sendDiscordNotification(
      { ...sosSubmission, timestamp: Date.now() } as ContactFormSubmission,
      'sos'
    );

    setSubmitted(true);
    setReason('');
  };

  if (submitted) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">SOS Sent!</h3>
        <p className="text-slate-400 mb-6">
          Your request has been sent to our team on Discord. We&apos;ll get back to you shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn-secondary"
        >
          Send Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-xl font-bold text-red-400 mb-1 flex items-center gap-2">
          🚨 Request Update / SOS
        </h3>
        <p className="text-slate-500 text-sm">
          Need a status update on a project or have an urgent issue? Let us know.
        </p>
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Urgency Level
        </label>
        <div className="flex gap-3">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setUrgency(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                urgency === level
                  ? level === 'high'
                    ? 'bg-red-500/20 border border-red-500 text-red-300'
                    : level === 'medium'
                    ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-300'
                    : 'bg-green-500/20 border border-green-500 text-green-300'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reason */}
      <div>
        <label
          htmlFor="sos-reason"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          What do you need?
        </label>
        <textarea
          id="sos-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          placeholder="Describe your request or issue..."
          className="input-field resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={sending || !reason.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {sending ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          '🚨 Send SOS Request'
        )}
      </button>
    </form>
  );
};

/* ───── Profile Tab ───── */
const ProfileTab: React.FC<{
  user: { uid: string; email: string | null; displayName: string | null };
  onSignOut: () => void;
}> = ({ user, onSignOut }) => {
  return (
    <div className="max-w-xl space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Profile Information</h3>

      <div className="card p-6 space-y-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Email
          </label>
          <p className="text-lg text-white mt-1">{user.email}</p>
        </div>
        {user.displayName && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Display Name
            </label>
            <p className="text-lg text-white mt-1">{user.displayName}</p>
          </div>
        )}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            User ID
          </label>
          <p className="text-sm font-mono text-slate-400 mt-1 break-all">
            {user.uid}
          </p>
        </div>
      </div>

      <button onClick={onSignOut} className="btn-primary bg-red-500/20 hover:bg-red-500/30 border border-red-500/30">
        Sign Out
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   Main Account Page
   ═══════════════════════════════════════════════════════ */
export const Account: React.FC = () => {
  const { user, isLoggedIn, signout } = useAuth();
  const { submissions, loading, fetchSubmissions } = useDatabase();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [activeTab, setActiveTab] = useState<AccountTab>('submissions');

  // Fetch user submissions when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchSubmissions();
    }
  }, [isLoggedIn, fetchSubmissions]);

  // Filter submissions for current user
  const userSubmissions = submissions.filter(
    (s) => s.userId === user?.uid || s.email === user?.email
  );

  /* ─── Logged-in view ─── */
  if (isLoggedIn && user) {
    const tabs: { id: AccountTab; label: string; icon: string }[] = [
      { id: 'submissions', label: 'My Submissions', icon: '📋' },
      { id: 'sos', label: 'SOS Request', icon: '🚨' },
      { id: 'profile', label: 'Profile', icon: '👤' },
      { id: 'admin', label: 'Admin', icon: '🔧' },
    ];

    return (
      <>
        <SEOHead
          title="My Account | RNDM Development"
          description="Manage your RNDM Development account, view submissions, and request updates."
          path="/account"
          keywords="account, profile, submissions, admin"
        />
        <div className="section container-max relative z-10">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-purple-400 mb-1">
              Account
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
              Welcome, {user.displayName || user.email?.split('@')[0]}
            </h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white border-b-2 border-purple-400'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in-up">
            {activeTab === 'submissions' && (
              <SubmissionsTab submissions={userSubmissions} loading={loading} />
            )}
            {activeTab === 'sos' && (
              <SOSTab
                userEmail={user.email || ''}
                userName={user.displayName || user.email || 'User'}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileTab user={user} onSignOut={signout} />
            )}
            {activeTab === 'admin' && <AdminDashboard />}
          </div>
        </div>
      </>
    );
  }

  /* ─── Not logged-in view ─── */
  return (
    <>
      <SEOHead
        title="Account | RNDM Development"
        description="Sign in or create an account on RNDM Development."
        path="/account"
        keywords="account, sign in, signup, authentication"
      />
      <div className="section container-max relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="font-display text-3xl font-bold text-gradient mb-2">Account Access</h1>
            <p className="text-slate-500">Sign in to manage your submissions and profile</p>
          </div>

          {/* Auth Mode Tabs */}
          <div className="flex gap-1 mb-8 border-b border-white/10">
            <button
              onClick={() => setAuthMode('login')}
              className={`px-5 py-2.5 font-medium text-sm transition-all rounded-t-lg ${
                authMode === 'login'
                  ? 'text-white bg-white/10 border-b-2 border-purple-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`px-5 py-2.5 font-medium text-sm transition-all rounded-t-lg ${
                authMode === 'signup'
                  ? 'text-white bg-white/10 border-b-2 border-purple-400'
                  : 'text-slate-500 hover:text-slate-300'
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
    </>
  );
};

export default Account;