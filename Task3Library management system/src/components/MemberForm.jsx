/**
 * MemberForm Component
 * 
 * Modal form for registering or editing library members
 * Uses Bootstrap form styling and validation
 * 
 * Props:
 * - member: Member data for editing (null for new member)
 * - onSubmit: Callback function when form is submitted
 * - onClose: Callback function to close the modal
 */

import { useState, useEffect } from 'react';

export default function MemberForm({ member, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    membershipStatus: 'active'
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        membershipStatus: member.membershipStatus
      });
    }
  }, [member]);

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        membershipStatus: 'active'
      });
      setSubmitted(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      membershipStatus: 'active'
    });
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">
              {member ? 'Edit Member' : 'Register New Member'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleCancel}
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            <form onSubmit={handleSubmit} noValidate>
              {/* First Name Field */}
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  className={`form-control ${submitted && errors.firstName ? 'is-invalid' : ''}`}
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>

              {/* Last Name Field */}
              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  className={`form-control ${submitted && errors.lastName ? 'is-invalid' : ''}`}
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>

              {/* Email Field */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  className={`form-control ${submitted && errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              {/* Membership Status */}
              <div className="mb-3">
                <label htmlFor="membershipStatus" className="form-label">
                  Membership Status
                </label>
                <select
                  className="form-select"
                  id="membershipStatus"
                  name="membershipStatus"
                  value={formData.membershipStatus}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Info Message */}
              <div className="alert alert-info" role="alert">
                <small>
                  <strong>Note:</strong> Maximum borrow limit is 5 books per member.
                  Membership date will be automatically set to today's date for new members.
                </small>
              </div>
            </form>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-success" 
              onClick={handleSubmit}
            >
              {member ? 'Update Member' : 'Register Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
