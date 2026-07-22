/**
 * Dashboard Page Component
 * 
 * Displays summary statistics for the library:
 * - Total books
 * - Total members
 * - Books currently borrowed
 * - Overdue books
 * 
 * Uses Bootstrap grid and card components for responsive layout
 */

import { useState, useEffect } from 'react';
import { booksAPI, membersAPI, borrowingAPI } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalMembers: 0,
    activeMembers: 0,
    borrowedBooks: 0,
    overdueBooks: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [booksData, membersData, recordsData] = await Promise.all([
        booksAPI.getAll(),
        membersAPI.getAll(),
        borrowingAPI.getAll()
      ]);

      // Calculate statistics
      const totalBooks = booksData.length;
      const availableBooks = booksData.reduce((sum, book) => sum + book.availableCopies, 0);
      const totalMembers = membersData.length;
      const activeMembers = membersData.filter(m => m.membershipStatus === 'active').length;
      const borrowedBooks = recordsData.filter(r => r.status === 'borrowed').length;
      
      // Count overdue books
      const today = new Date();
      const overdueBooks = recordsData.filter(r => {
        return r.status === 'borrowed' && new Date(r.dueDate) < today;
      }).length;

      setStats({
        totalBooks,
        availableBooks,
        totalMembers,
        activeMembers,
        borrowedBooks,
        overdueBooks
      });

      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="page-title">📊 Dashboard</h1>
        <p className="text-muted">Library Management System Overview</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={fetchStats}
          ></button>
        </div>
      )}

      {/* Statistics Cards - Bootstrap Grid (2 columns on desktop, 1 on mobile) */}
      <div className="row g-4 mb-5">
        {/* Total Books */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="stat-card bg-primary">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h6 className="stat-label">Total Books</h6>
              <h2 className="stat-value">{stats.totalBooks}</h2>
            </div>
          </div>
        </div>

        {/* Available Books */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="stat-card bg-success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h6 className="stat-label">Available Books</h6>
              <h2 className="stat-value">{stats.availableBooks}</h2>
            </div>
          </div>
        </div>

        {/* Total Members */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="stat-card bg-info">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h6 className="stat-label">Total Members</h6>
              <h2 className="stat-value">{stats.totalMembers}</h2>
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="stat-card bg-warning">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h6 className="stat-label">Active Members</h6>
              <h2 className="stat-value">{stats.activeMembers}</h2>
            </div>
          </div>
        </div>

        {/* Borrowed Books */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="stat-card bg-secondary">
            <div className="stat-icon">📤</div>
            <div className="stat-content">
              <h6 className="stat-label">Currently Borrowed</h6>
              <h2 className="stat-value">{stats.borrowedBooks}</h2>
            </div>
          </div>
        </div>

        {/* Overdue Books */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="stat-card bg-danger">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h6 className="stat-label">Overdue Books</h6>
              <h2 className="stat-value">{stats.overdueBooks}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">📈 Quick Summary</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <div className="summary-stat">
                    <p className="text-muted mb-2">Borrowing Rate</p>
                    <h4 className="text-primary">
                      {stats.totalBooks > 0 
                        ? ((stats.borrowedBooks / (stats.totalBooks + stats.borrowedBooks)) * 100).toFixed(1)
                        : 0}%
                    </h4>
                    <small className="text-muted">Books currently borrowed</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="summary-stat">
                    <p className="text-muted mb-2">Member Engagement</p>
                    <h4 className="text-success">
                      {stats.totalMembers > 0 
                        ? ((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)
                        : 0}%
                    </h4>
                    <small className="text-muted">Active members</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="summary-stat">
                    <p className="text-muted mb-2">Inventory Health</p>
                    <h4 className="text-warning">
                      {stats.totalBooks > 0 
                        ? ((stats.availableBooks / stats.totalBooks) * 100).toFixed(1)
                        : 0}%
                    </h4>
                    <small className="text-muted">Available books</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="summary-stat">
                    <p className="text-muted mb-2">Overdue Item</p>
                    <h4 className={stats.overdueBooks > 0 ? 'text-danger' : 'text-success'}>
                      {stats.overdueBooks}
                    </h4>
                    <small className="text-muted">Books needing attention</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="mt-4 alert alert-info" role="alert">
        <strong>ℹ️ System Information:</strong>
        <ul className="mb-0 mt-2">
          <li>Total catalog size: <strong>{stats.totalBooks}</strong> books</li>
          <li>Registered members: <strong>{stats.totalMembers}</strong> members</li>
          <li>Books in circulation: <strong>{stats.borrowedBooks}</strong> books</li>
          <li>Overdue items that need follow-up: <strong>{stats.overdueBooks}</strong> books</li>
        </ul>
      </div>
    </div>
  );
}
