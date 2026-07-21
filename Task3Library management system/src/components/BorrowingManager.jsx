/**
 * BorrowingManager Component
 * 
 * Manages borrowing and returning of books
 * Two-column layout:
 * - Left: Borrow Book section with dropdowns
 * - Right: Return Book section
 * - Central table showing active borrowing records
 * 
 * Features:
 * - Select book and member from dropdowns
 * - Track due dates
 * - Highlight overdue books
 * - Record book returns
 */

import { useState, useEffect } from 'react';
import { booksAPI, membersAPI, borrowingAPI } from '../services/api';
import './BorrowingManager.css';

export default function BorrowingManager() {
  // State management
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Borrow form state
  const [borrowForm, setBorrowForm] = useState({
    bookId: '',
    memberId: '',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: ''
  });

  // Return form state
  const [returnForm, setReturnForm] = useState({
    recordId: '',
    returnDate: new Date().toISOString().split('T')[0]
  });

  // Fetch all required data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksData, membersData, recordsData] = await Promise.all([
        booksAPI.getAll(),
        membersAPI.getAll(),
        borrowingAPI.getAll()
      ]);
      setBooks(booksData);
      setMembers(membersData);
      setBorrowRecords(recordsData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate due date (14 days from borrow date)
  const updateDueDate = (borrowDate) => {
    const date = new Date(borrowDate);
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  // Handle borrow form change
  const handleBorrowChange = (e) => {
    const { name, value } = e.target;
    let newForm = { ...borrowForm, [name]: value };

    if (name === 'borrowDate') {
      newForm.dueDate = updateDueDate(value);
    }

    setBorrowForm(newForm);
  };

  // Handle borrow submission (POST)
  const handleBorrow = async (e) => {
    e.preventDefault();

    if (!borrowForm.bookId || !borrowForm.memberId) {
      alert('Please select both a book and a member');
      return;
    }

    try {
      // Check if book is available
      const book = books.find(b => b.id === parseInt(borrowForm.bookId));
      if (!book || book.availableCopies <= 0) {
        alert('This book is not available');
        return;
      }

      // Create borrow record (POST - not idempotent)
      await borrowingAPI.recordBorrow({
        bookId: parseInt(borrowForm.bookId),
        memberId: parseInt(borrowForm.memberId),
        borrowDate: borrowForm.borrowDate,
        dueDate: borrowForm.dueDate
      });

      // Update book availability
      const updatedBook = {
        ...book,
        availableCopies: book.availableCopies - 1,
        status: book.availableCopies - 1 === 0 ? 'borrowed' : 'available'
      };
      await booksAPI.update(book.id, updatedBook);

      // Update member borrowed count
      const member = members.find(m => m.id === parseInt(borrowForm.memberId));
      const updatedMember = {
        ...member,
        borrowedBooks: member.borrowedBooks + 1
      };
      await membersAPI.update(member.id, updatedMember);

      // Reset form and refresh data
      setBorrowForm({
        bookId: '',
        memberId: '',
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: ''
      });

      alert('Book borrowed successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to record borrow');
      console.error(err);
    }
  };

  // Handle return submission (PUT - idempotent)
  const handleReturn = async (e) => {
    e.preventDefault();

    if (!returnForm.recordId) {
      alert('Please select a borrowing record');
      return;
    }

    try {
      const record = borrowRecords.find(r => r.id === parseInt(returnForm.recordId));

      // Update borrow record (PUT - idempotent)
      await borrowingAPI.recordReturn(record.id, {
        returnDate: returnForm.returnDate,
        status: 'returned'
      });

      // Update book availability
      const book = books.find(b => b.id === record.bookId);
      const updatedBook = {
        ...book,
        availableCopies: book.availableCopies + 1,
        status: 'available'
      };
      await booksAPI.update(book.id, updatedBook);

      // Update member borrowed count
      const member = members.find(m => m.id === record.memberId);
      const updatedMember = {
        ...member,
        borrowedBooks: Math.max(0, member.borrowedBooks - 1)
      };
      await membersAPI.update(member.id, updatedMember);

      // Reset form and refresh data
      setReturnForm({
        recordId: '',
        returnDate: new Date().toISOString().split('T')[0]
      });

      alert('Book returned successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to record return');
      console.error(err);
    }
  };

  // Check if a record is overdue
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date().toDateString() !== new Date(dueDate).toDateString();
  };

  // Get active borrow records
  const activeBorrows = borrowRecords.filter(r => r.status === 'borrowed');

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
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={fetchData}></button>
        </div>
      )}

      {/* Two Column Layout - Bootstrap Grid */}
      <div className="row g-4 mb-4">
        {/* Left Column: Borrow Book */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📚 Borrow Book</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleBorrow}>
                {/* Select Book */}
                <div className="mb-3">
                  <label htmlFor="bookId" className="form-label">
                    Select Book <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="bookId"
                    name="bookId"
                    value={borrowForm.bookId}
                    onChange={handleBorrowChange}
                    required
                  >
                    <option value="">-- Choose a book --</option>
                    {books
                      .filter(b => b.availableCopies > 0)
                      .map(book => (
                        <option key={book.id} value={book.id}>
                          {book.title} by {book.author} ({book.availableCopies} available)
                        </option>
                      ))}
                  </select>
                </div>

                {/* Select Member */}
                <div className="mb-3">
                  <label htmlFor="memberId" className="form-label">
                    Select Member <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="memberId"
                    name="memberId"
                    value={borrowForm.memberId}
                    onChange={handleBorrowChange}
                    required
                  >
                    <option value="">-- Choose a member --</option>
                    {members
                      .filter(m => m.membershipStatus === 'active' && m.borrowedBooks < m.maxBorrowLimit)
                      .map(member => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName} ({member.borrowedBooks}/{member.maxBorrowLimit} books)
                        </option>
                      ))}
                  </select>
                </div>

                {/* Borrow Date */}
                <div className="mb-3">
                  <label htmlFor="borrowDate" className="form-label">
                    Borrow Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="borrowDate"
                    name="borrowDate"
                    value={borrowForm.borrowDate}
                    onChange={handleBorrowChange}
                  />
                </div>

                {/* Due Date (Auto-calculated) */}
                <div className="mb-3">
                  <label htmlFor="dueDate" className="form-label">
                    Due Date <span className="text-muted">(14 days from borrow date)</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="dueDate"
                    name="dueDate"
                    value={borrowForm.dueDate}
                    disabled
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  📤 Record Borrow
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Return Book */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">♻️ Return Book</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleReturn}>
                {/* Select Borrowing Record */}
                <div className="mb-3">
                  <label htmlFor="recordId" className="form-label">
                    Select Book to Return <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="recordId"
                    name="recordId"
                    value={returnForm.recordId}
                    onChange={(e) => setReturnForm({ ...returnForm, recordId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose a borrowing record --</option>
                    {activeBorrows.map(record => {
                      const book = books.find(b => b.id === record.bookId);
                      const member = members.find(m => m.id === record.memberId);
                      const overdue = isOverdue(record.dueDate);
                      return (
                        <option key={record.id} value={record.id}>
                          {book?.title} - {member?.firstName} {member?.lastName}
                          {overdue ? ' (⚠️ OVERDUE)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Return Date */}
                <div className="mb-3">
                  <label htmlFor="returnDate" className="form-label">
                    Return Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="returnDate"
                    name="returnDate"
                    value={returnForm.returnDate}
                    onChange={(e) => setReturnForm({ ...returnForm, returnDate: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-success w-100">
                  ✅ Record Return
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Active Borrowing Records Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">📋 Active Borrowing Records</h5>
        </div>

        {activeBorrows.length === 0 ? (
          <div className="card-body text-center py-5">
            <p className="text-muted">No active borrowing records</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Book Title</th>
                  <th>Member</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeBorrows.map(record => {
                  const book = books.find(b => b.id === record.bookId);
                  const member = members.find(m => m.id === record.memberId);
                  const overdue = isOverdue(record.dueDate);

                  return (
                    <tr key={record.id} className={overdue ? 'table-danger' : ''}>
                      <td className="fw-bold">{book?.title}</td>
                      <td>{member?.firstName} {member?.lastName}</td>
                      <td>{new Date(record.borrowDate).toLocaleDateString()}</td>
                      <td className={overdue ? 'fw-bold' : ''}>
                        {new Date(record.dueDate).toLocaleDateString()}
                        {overdue && <span className="ms-2 badge bg-danger">OVERDUE</span>}
                      </td>
                      <td>
                        <span className="badge bg-warning">Borrowed</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
