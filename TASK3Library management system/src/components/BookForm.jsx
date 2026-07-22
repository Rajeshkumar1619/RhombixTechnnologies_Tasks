/**
 * BookForm Component
 * 
 * Modal form for adding or editing books
 * Uses Bootstrap form styling and validation
 * 
 * Props:
 * - book: Book data for editing (null for new book)
 * - onSubmit: Callback function when form is submitted
 * - onClose: Callback function to close the modal
 */

import { useState, useEffect } from 'react';

export default function BookForm({ book, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Fiction',
    publishYear: new Date().getFullYear(),
    totalCopies: 1
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        publishYear: book.publishYear,
        totalCopies: book.totalCopies
      });
    }
  }, [book]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }
    if (!formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required';
    }
    if (formData.publishYear > new Date().getFullYear()) {
      newErrors.publishYear = 'Publish year cannot be in the future';
    }
    if (formData.totalCopies < 1) {
      newErrors.totalCopies = 'Total copies must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'publishYear' || name === 'totalCopies' 
        ? parseInt(value) 
        : value
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
        title: '',
        author: '',
        isbn: '',
        category: 'Fiction',
        publishYear: new Date().getFullYear(),
        totalCopies: 1
      });
      setSubmitted(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: 'Fiction',
      publishYear: new Date().getFullYear(),
      totalCopies: 1
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
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {book ? 'Edit Book' : 'Add New Book'}
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
              {/* Title Field */}
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Book Title *
                </label>
                <input
                  type="text"
                  className={`form-control ${submitted && errors.title ? 'is-invalid' : ''}`}
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter book title"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Author Field */}
              <div className="mb-3">
                <label htmlFor="author" className="form-label">
                  Author *
                </label>
                <input
                  type="text"
                  className={`form-control ${submitted && errors.author ? 'is-invalid' : ''}`}
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Enter author name"
                />
                {errors.author && <div className="invalid-feedback">{errors.author}</div>}
              </div>

              {/* ISBN Field */}
              <div className="mb-3">
                <label htmlFor="isbn" className="form-label">
                  ISBN *
                </label>
                <input
                  type="text"
                  className={`form-control ${submitted && errors.isbn ? 'is-invalid' : ''}`}
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder="Enter ISBN"
                />
                {errors.isbn && <div className="invalid-feedback">{errors.isbn}</div>}
              </div>

              {/* Category and Publish Year in row */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Romance">Romance</option>
                    <option value="Dystopian">Dystopian</option>
                    <option value="Biography">Biography</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="publishYear" className="form-label">
                    Publish Year *
                  </label>
                  <input
                    type="number"
                    className={`form-control ${submitted && errors.publishYear ? 'is-invalid' : ''}`}
                    id="publishYear"
                    name="publishYear"
                    value={formData.publishYear}
                    onChange={handleChange}
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                  {errors.publishYear && <div className="invalid-feedback">{errors.publishYear}</div>}
                </div>
              </div>

              {/* Total Copies Field */}
              <div className="mb-3">
                <label htmlFor="totalCopies" className="form-label">
                  Total Copies *
                </label>
                <input
                  type="number"
                  className={`form-control ${submitted && errors.totalCopies ? 'is-invalid' : ''}`}
                  id="totalCopies"
                  name="totalCopies"
                  value={formData.totalCopies}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                />
                {errors.totalCopies && <div className="invalid-feedback">{errors.totalCopies}</div>}
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
              className="btn btn-primary" 
              onClick={handleSubmit}
            >
              {book ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
