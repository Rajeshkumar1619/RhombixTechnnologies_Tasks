/**
 * BookList Component
 * 
 * Displays all books in a responsive grid using Bootstrap Cards
 * Uses Bootstrap 12-column grid system:
 * - 3 columns on desktop (col-lg-4)
 * - 2 columns on tablet (col-md-6)
 * - 1 column on mobile (col-12)
 * 
 * Features:
 * - Search and filter by title/author
 * - Sort functionality
 * - Action buttons: Edit, Delete, Borrow
 * - Empty state message
 */

import { useState, useEffect } from 'react';
import { booksAPI } from '../services/api';
import './BookList.css';

export default function BookList({ onEdit, onDelete, refreshTrigger }) {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books from API
  useEffect(() => {
    fetchBooks();
  }, [refreshTrigger]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await booksAPI.getAll();
      setBooks(data);
      setFilteredBooks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search and filter logic
  useEffect(() => {
    let filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort logic
    if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'author') {
      filtered.sort((a, b) => a.author.localeCompare(b.author));
    } else if (sortBy === 'availability') {
      filtered.sort((a, b) => b.availableCopies - a.availableCopies);
    }

    setFilteredBooks(filtered);
  }, [searchTerm, sortBy, books]);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.delete(id);
        fetchBooks();
        onDelete && onDelete();
      } catch (err) {
        alert('Failed to delete book');
        console.error(err);
      }
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
      {/* Search and Filter Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            {/* Search */}
            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="col-12 col-md-6">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="availability">Sort by Availability</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={fetchBooks}></button>
        </div>
      )}

      {/* Books Grid - Bootstrap 12-Column Responsive Grid */}
      {filteredBooks.length === 0 ? (
        <div className="alert alert-info text-center py-5">
          <h5>📚 No books found</h5>
          <p>Start by adding some books to your library</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBooks.map(book => (
            <div key={book.id} className="col-12 col-md-6 col-lg-4">
              {/* Bootstrap Card */}
              <div className="card book-card h-100 shadow-sm hover-card">
                {/* Card Header with Status Badge */}
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 flex-grow-1">{book.category}</h6>
                  <span className={`badge ${book.availableCopies > 0 ? 'bg-success' : 'bg-danger'}`}>
                    {book.availableCopies > 0 ? 'Available' : 'Borrowed'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  <h5 className="card-title text-truncate" title={book.title}>
                    {book.title}
                  </h5>
                  <p className="card-text text-muted">
                    <small><strong>Author:</strong> {book.author}</small>
                  </p>

                  {/* Book Details */}
                  <div className="book-details mb-3">
                    <div className="detail-row">
                      <span className="detail-label">ISBN:</span>
                      <span className="detail-value">{book.isbn}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Published:</span>
                      <span className="detail-value">{book.publishYear}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Copies:</span>
                      <span className="detail-value">
                        {book.availableCopies} / {book.totalCopies}
                      </span>
                    </div>
                  </div>

                  {/* Availability Progress */}
                  <div className="mb-3">
                    <small>Availability</small>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${book.availableCopies > 0 ? 'bg-success' : 'bg-danger'}`}
                        style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Action Buttons */}
                <div className="card-footer bg-light d-flex gap-2">
                  <button
                    className="btn btn-sm btn-primary flex-grow-1"
                    onClick={() => onEdit(book)}
                    title="Edit book"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger flex-grow-1"
                    onClick={() => handleDelete(book.id)}
                    title="Delete book"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 text-center text-muted">
        <small>
          Showing {filteredBooks.length} of {books.length} books
        </small>
      </div>
    </div>
  );
}
