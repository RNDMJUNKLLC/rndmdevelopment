import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth, useDatabase } from '@/hooks';
import {
  getSubmissionStats,
  sortSubmissions,
  formatSubmissionDate,
  downloadCSV,
  exportSubmissionsToCSV,
} from '@/utils/formUtils';
import type { ContactFormSubmission } from '@/types';
import { uiActions } from '@store/slices/uiSlice';

interface AdminDashboardState {
  selectedSubmission: ContactFormSubmission | null;
  sortBy: 'date' | 'name' | 'status';
  sortOrder: 'asc' | 'desc';
  filterStatus: 'all' | 'pending' | 'viewed' | 'responded';
}

export const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useAuth();
  const { submissions, loading, subscribeToSubmissions, fetchSubmissions, updateSubmission } = useDatabase();

  const [dashboardState, setDashboardState] = useState<AdminDashboardState>({
    selectedSubmission: null,
    sortBy: 'date',
    sortOrder: 'desc',
    filterStatus: 'all',
  });

  /**
   * Initialize real-time subscription
   */
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    // Fetch initial data
    fetchSubmissions();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToSubmissions(() => {
      // Optionally show toast that submissions were updated
    });

    return () => unsubscribe();
  }, [isLoggedIn, fetchSubmissions, subscribeToSubmissions]);

  /**
   * Handle submission status update
   */
  const handleStatusUpdate = useCallback(
    async (id: string, newStatus: 'pending' | 'viewed' | 'responded') => {
      if (!id) return;

      const result = await updateSubmission(id, { status: newStatus });

      if (result.success) {
        dispatch(
          uiActions.addNotification({
            id: `status-${Date.now()}`,
            type: 'success',
            message: `Submission marked as ${newStatus}`,
            duration: 3000,
          })
        );

        setDashboardState((prev) => ({
          ...prev,
          selectedSubmission: result.data || null,
        }));
      } else {
        dispatch(
          uiActions.addNotification({
            id: `status-error-${Date.now()}`,
            type: 'error',
            message: result.error || 'Failed to update status',
            duration: 5000,
          })
        );
      }
    },
    [updateSubmission, dispatch]
  );

  /**
   * Get sorted and filtered submissions
   */
  const getFilteredAndSortedSubmissions = useCallback(() => {
    let filtered = submissions;

    if (dashboardState.filterStatus !== 'all') {
      filtered = filtered.filter((sub) => sub.status === dashboardState.filterStatus);
    }

    return sortSubmissions(filtered, dashboardState.sortBy, dashboardState.sortOrder);
  }, [submissions, dashboardState.filterStatus, dashboardState.sortBy, dashboardState.sortOrder]);

  /**
   * Handle CSV export
   */
  const handleExportCSV = useCallback(() => {
    const csv = exportSubmissionsToCSV(getFilteredAndSortedSubmissions());
    downloadCSV(csv, `submissions-${new Date().toISOString().split('T')[0]}.csv`);

    dispatch(
      uiActions.addNotification({
        id: `export-${Date.now()}`,
        type: 'success',
        message: 'Submissions exported to CSV',
        duration: 3000,
      })
    );
  }, [getFilteredAndSortedSubmissions, dispatch]);

  // Check if user is logged in
  if (!isLoggedIn) {
    return (
      <div className="section container-max text-center py-24">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-lg text-slate-300 mb-8">
          You need to be logged in to access the admin dashboard.
        </p>
        <button className="btn-primary">Sign In</button>
      </div>
    );
  }

  const filteredSubmissions = getFilteredAndSortedSubmissions();
  const stats = getSubmissionStats(submissions);

  return (
    <div className="section container-max">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-slate-300">Manage and review project inquiries</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="text-2xl font-bold text-accent-600 mb-2">{stats.total}</div>
          <div className="text-sm text-slate-400">Total Submissions</div>
        </div>
        <div className="card p-6">
          <div className="text-2xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
          <div className="text-sm text-slate-400">Pending</div>
        </div>
        <div className="card p-6">
          <div className="text-2xl font-bold text-blue-600 mb-2">{stats.viewed}</div>
          <div className="text-sm text-slate-400">Viewed</div>
        </div>
        <div className="card p-6">
          <div className="text-2xl font-bold text-green-600 mb-2">{stats.responded}</div>
          <div className="text-sm text-slate-400">Responded</div>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
          <div className="flex gap-4 flex-wrap">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={dashboardState.sortBy}
                onChange={(e) =>
                  setDashboardState((prev) => ({
                    ...prev,
                    sortBy: e.target.value as any,
                  }))
                }
                className="input-field py-2 px-3"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium mb-2">Order</label>
              <select
                value={dashboardState.sortOrder}
                onChange={(e) =>
                  setDashboardState((prev) => ({
                    ...prev,
                    sortOrder: e.target.value as any,
                  }))
                }
                className="input-field py-2 px-3"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Filter</label>
              <select
                value={dashboardState.filterStatus}
                onChange={(e) =>
                  setDashboardState((prev) => ({
                    ...prev,
                    filterStatus: e.target.value as any,
                  }))
                }
                className="input-field py-2 px-3"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="viewed">Viewed</option>
                <option value="responded">Responded</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button onClick={handleExportCSV} className="btn-secondary">
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-300">Loading submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-300 mb-4">No submissions found</p>
          <p className="text-sm text-slate-400">
            Inquiries will appear here when submitted
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <button
              key={submission.id}
              onClick={() =>
                setDashboardState((prev) => ({
                  ...prev,
                  selectedSubmission: submission,
                }))
              }
              className="card p-6 hover:bg-white/5 transition text-left w-full"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                  <h3 className="font-bold text-lg mb-1">{submission.name}</h3>
                  <p className="text-sm text-slate-400 mb-2">
                    {submission.email}
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-medium">{submission.projectType}</span>
                    {' • '}
                    <span>{submission.budget}</span>
                  </p>
                  <p className="text-sm text-slate-400">
                    {formatSubmissionDate(submission.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      submission.status === 'pending'
                        ? 'badge-pending'
                        : submission.status === 'viewed'
                          ? 'badge-viewed'
                          : 'badge-responded'
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail View */}
      {dashboardState.selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-96 overflow-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Submission Details</h2>
              <button
                onClick={() =>
                  setDashboardState((prev) => ({
                    ...prev,
                    selectedSubmission: null,
                  }))
                }
                className="text-2xl hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-400">Name</label>
                <p className="text-lg">{dashboardState.selectedSubmission.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Email</label>
                <p className="text-lg">{dashboardState.selectedSubmission.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Company</label>
                <p className="text-lg">{dashboardState.selectedSubmission.company || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Project Type</label>
                <p className="text-lg">{dashboardState.selectedSubmission.projectType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Budget</label>
                <p className="text-lg">{dashboardState.selectedSubmission.budget}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Timeline</label>
                <p className="text-lg">{dashboardState.selectedSubmission.timeline}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Message</label>
                <p className="text-lg whitespace-pre-wrap">{dashboardState.selectedSubmission.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Date</label>
                <p className="text-lg">
                  {formatSubmissionDate(dashboardState.selectedSubmission.timestamp)}
                </p>
              </div>
            </div>

            {/* Status Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleStatusUpdate(dashboardState.selectedSubmission?.id || '', 'pending')
                }
                className={`flex-1 py-2 px-4 rounded transition ${
                  dashboardState.selectedSubmission.status === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() =>
                  handleStatusUpdate(dashboardState.selectedSubmission?.id || '', 'viewed')
                }
                className={`flex-1 py-2 px-4 rounded transition ${
                  dashboardState.selectedSubmission.status === 'viewed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                Viewed
              </button>
              <button
                onClick={() =>
                  handleStatusUpdate(dashboardState.selectedSubmission?.id || '', 'responded')
                }
                className={`flex-1 py-2 px-4 rounded transition ${
                  dashboardState.selectedSubmission.status === 'responded'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                Responded
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
