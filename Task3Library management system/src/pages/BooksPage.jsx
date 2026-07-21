/**
 * Books Page Component
 * 
 * Main page for managing books in the library
 * Combines BookList and BookForm components
 * 
 * Features:
 * - Display all books with BookList component
 * - Add new books with BookForm modal
 * - Edit existing books
 * - Delete books
 */

import { useState } from 'react';
import BookList from '../components/BookList';
import BookForm from '../components/BookForm';
import { booksAPI } from '../services/api';

export default function BooksPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle adding new book
  const handleAddClick = () => {
    setSelectedBook(null);
    setShowForm(true);
  };

  // Handle editing book
  const handleEditBook = (book) => {
    setSelectedBook(book);
    setShowForm(true);
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedBook) {
        // Update existing book (PUT - idempotent)
        await booksAPI.update(selectedBook.id, {
          ...selectedBook,
          ...formData
        });
        alert('Book updated successfully!');
      } else {
        // Create new book (POST - not idempotent)
        await booksAPI.create(formData);
        alert('Book added successfully!');
      }
      setShowForm(false);
      setSelectedBook(null);
      // Trigger refresh of book list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert('Failed to save book');
      console.error(error);
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setSelectedBook(null);
  };

  // Handle book delete
  const handleBookDelete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2">📖 Books Management</h1>
              <p className="text-muted">Manage your library's book collection</p>
            </div>
            <button
              className="btn btn-success btn-lg"
              onClick={handleAddClick}
            >
              ➕ Add New Book
            </button>
          </div>
        </div>
      </div>

      {/* Book List Component */}
      <BookList
        onEdit={handleEditBook}
        onDelete={handleBookDelete}
        refreshTrigger={refreshTrigger}
      />

      {/* Book Form Modal */}
      {showForm && (
        <BookForm
          book={selectedBook}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
