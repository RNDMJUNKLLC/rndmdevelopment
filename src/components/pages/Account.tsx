import React, { useState, useEffect } from 'react';
import SEOHead from '@components/SEOHead';
import { useAuth, useDatabase, useDiscord } from '@/hooks';
import LoginForm from '@components/forms/LoginForm';
import SignupForm from '@components/forms/SignupForm';
import AdminDashboard from '@components/admin/AdminDashboard';
import type { ContactFormSubmission, SOSSubmission } from '@/types';

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
const SOSTab: React.FC<{
  userEmail: string;
  userName: string;
  userSubmissions: ContactFormSubmission[];
}> = ({ userEmail, userName, userSubmissions }) => {
  const { sendSOSNotification, sending } = useDiscord();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: userName,
    business: '',
    email: userEmail,
    phone: '',
    project: '',
    projectId: '',
    requestType: 'Bug Fix / Issue',
    timeline: 'Flexible',
    priority: 'Normal',
    details: '',
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.details.trim()) return;

    const sosPayload: SOSSubmission = {
      ...form,
      timestamp: Date.now(),
    };

    await sendSOSNotification(sosPayload);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">SOS Sent!</h3>
        <p className="text-slate-400 mb-6">
          Your support request has been sent to our team. We&apos;ll get back to you shortly.
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

  const requestTypes = [
    'Bug Fix / Issue',
    'Feature Request',
    'Status Update',
    'General Support',
    'Billing / Invoice',
    'Other',
  ];

  const timelines = ['ASAP', 'Within 24 Hours', 'Within a Week', 'Flexible'];

  const priorities: { value: string; icon: string; color: string }[] = [
    { value: 'Low', icon: '🟢', color: 'bg-green-500/20 border-green-500 text-green-300' },
    { value: 'Normal', icon: '🎯', color: 'bg-yellow-500/20 border-yellow-500 text-yellow-300' },
    { value: 'High', icon: '🔴', color: 'bg-orange-500/20 border-orange-500 text-orange-300' },
    { value: 'Critical', icon: '🚨', color: 'bg-red-500/20 border-red-500 text-red-300' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-xl font-bold text-red-400 mb-1 flex items-center gap-2">
          🆘 SOS - Project Support Request
        </h3>
        <p className="text-slate-500 text-sm">
          Fill out the details below and we&apos;ll get back to you as soon as possible.
        </p>
      </div>

      {/* Row 1: Name / Business / Email */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="sos-name" className="block text-sm font-medium text-slate-300 mb-1">
            👤 Name
          </label>
          <input
            id="sos-name"
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label htmlFor="sos-business" className="block text-sm font-medium text-slate-300 mb-1">
            🏢 Business
          </label>
          <input
            id="sos-business"
            type="text"
            value={form.business}
            onChange={(e) => update('business', e.target.value)}
            placeholder="Company name"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="sos-email" className="block text-sm font-medium text-slate-300 mb-1">
            📧 Email
          </label>
          <input
            id="sos-email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>

      {/* Row 2: Phone / Project / Project ID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="sos-phone" className="block text-sm font-medium text-slate-300 mb-1">
            📞 Phone
          </label>
          <input
            id="sos-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="Phone number"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="sos-project" className="block text-sm font-medium text-slate-300 mb-1">
            📁 Project
          </label>
          {userSubmissions.length > 0 ? (
            <select
              id="sos-project"
              value={form.project}
              onChange={(e) => {
                const selected = userSubmissions.find((s) => s.projectType === e.target.value);
                update('project', e.target.value);
                if (selected?.id) update('projectId', selected.id);
              }}
              className="input-field"
            >
              <option value="">Select a project</option>
              {userSubmissions.map((s) => (
                <option key={s.id} value={s.projectType}>
                  {s.projectType}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          ) : (
            <input
              id="sos-project"
              type="text"
              value={form.project}
              onChange={(e) => update('project', e.target.value)}
              placeholder="Project name"
              className="input-field"
            />
          )}
        </div>
        <div>
          <label htmlFor="sos-projectId" className="block text-sm font-medium text-slate-300 mb-1">
            🎯 Project ID
          </label>
          <input
            id="sos-projectId"
            type="text"
            value={form.projectId}
            onChange={(e) => update('projectId', e.target.value)}
            placeholder="Auto-filled or enter manually"
            className="input-field"
          />
        </div>
      </div>

      {/* Row 3: Request Type / Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sos-requestType" className="block text-sm font-medium text-slate-300 mb-1">
            🔧 Request Type
          </label>
          <select
            id="sos-requestType"
            value={form.requestType}
            onChange={(e) => update('requestType', e.target.value)}
            className="input-field"
          >
            {requestTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sos-timeline" className="block text-sm font-medium text-slate-300 mb-1">
            ⏰ Timeline
          </label>
          <select
            id="sos-timeline"
            value={form.timeline}
            onChange={(e) => update('timeline', e.target.value)}
            className="input-field"
          >
            {timelines.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          🚨 Priority
        </label>
        <div className="flex gap-3 flex-wrap">
          {priorities.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update('priority', p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                form.priority === p.value
                  ? p.color
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              {p.icon} {p.value}
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div>
        <label htmlFor="sos-details" className="block text-sm font-medium text-slate-300 mb-1">
          📝 Details
        </label>
        <textarea
          id="sos-details"
          value={form.details}
          onChange={(e) => update('details', e.target.value)}
          rows={5}
          placeholder="Describe your issue or request in detail..."
          className="input-field resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={sending || !form.details.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {sending ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          '🆘 Submit Support Request'
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
                userSubmissions={userSubmissions}
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