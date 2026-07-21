/**
 * Members Page Component
 * 
 * Main page for managing members in the library
 * Combines MemberList and MemberForm components
 * 
 * Features:
 * - Display all members with MemberList component
 * - Register new members with MemberForm modal
 * - Edit existing members
 * - Delete members
 */

import { useState } from 'react';
import MemberList from '../components/MemberList';
import MemberForm from '../components/MemberForm';
import { membersAPI } from '../services/api';

export default function MembersPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle adding new member
  const handleRegisterClick = () => {
    setSelectedMember(null);
    setShowForm(true);
  };

  // Handle editing member
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowForm(true);
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedMember) {
        // Update existing member (PUT - idempotent)
        await membersAPI.update(selectedMember.id, {
          ...selectedMember,
          ...formData
        });
        alert('Member updated successfully!');
      } else {
        // Create new member (POST - not idempotent)
        await membersAPI.create(formData);
        alert('Member registered successfully!');
      }
      setShowForm(false);
      setSelectedMember(null);
      // Trigger refresh of member list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert('Failed to save member');
      console.error(error);
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setSelectedMember(null);
  };

  // Handle member delete
  const handleMemberDelete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2">👥 Members Management</h1>
              <p className="text-muted">Manage library members and registrations</p>
            </div>
            <button
              className="btn btn-success btn-lg"
              onClick={handleRegisterClick}
            >
              ➕ Register New Member
            </button>
          </div>
        </div>
      </div>

      {/* Member List Component */}
      <MemberList
        onEdit={handleEditMember}
        onDelete={handleMemberDelete}
        refreshTrigger={refreshTrigger}
      />

      {/* Member Form Modal */}
      {showForm && (
        <MemberForm
          member={selectedMember}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
