/**
 * MemberList Component
 * 
 * Displays all members in a responsive Bootstrap table
 * Features:
 * - Pagination
 * - Search functionality
 * - Action buttons: Edit, Delete
 * - Status indicators
 * - Empty state message
 */

import { useState, useEffect } from 'react';
import { membersAPI } from '../services/api';
import './MemberList.css';

const ITEMS_PER_PAGE = 5;

export default function MemberList({ onEdit, onDelete, refreshTrigger }) {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch members from API
  useEffect(() => {
    fetchMembers();
  }, [refreshTrigger]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await membersAPI.getAll();
      setMembers(data);
      setFilteredMembers(data);
      setError(null);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search logic
  useEffect(() => {
    const filtered = members.filter(member =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [searchTerm, members]);

  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await membersAPI.delete(id);
        fetchMembers();
        onDelete && onDelete();
      } catch (err) {
        alert('Failed to delete member');
        console.error(err);
      }
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-warning';
      case 'suspended':
        return 'bg-danger';
      default:
        return 'bg-secondary';
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
      {/* Search Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={fetchMembers}></button>
        </div>
      )}

      {/* Members Table - Responsive Bootstrap Table */}
      {filteredMembers.length === 0 ? (
        <div className="alert alert-info text-center py-5">
          <h5>👥 No members found</h5>
          <p>Start by registering some library members</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Member Since</th>
                  <th>Status</th>
                  <th>Books Borrowed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map(member => (
                  <tr key={member.id} className="member-row">
                    <td className="fw-bold">{member.id}</td>
                    <td>
                      <div className="member-name">
                        👤 {member.firstName} {member.lastName}
                      </div>
                    </td>
                    <td className="text-muted">{member.email}</td>
                    <td className="text-muted">
                      <small>{new Date(member.membershipDate).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <span className={`badge text-white ${getStatusBadge(member.membershipStatus)}`}>
                        {member.membershipStatus.charAt(0).toUpperCase() + member.membershipStatus.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info">
                        {member.borrowedBooks} / {member.maxBorrowLimit}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => onEdit(member)}
                          title="Edit member"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(member.id)}
                          title="Delete member"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="card-footer d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredMembers.length)} of {filteredMembers.length} members
              </small>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
