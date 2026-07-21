/**
 * Borrowing Page Component
 * 
 * Main page for managing book borrowing and returns
 * This page hosts the BorrowingManager component
 * 
 * Features:
 * - Record book borrowing
 * - Record book returns
 * - View active borrowing records
 * - Track overdue books
 */

import BorrowingManager from '../components/BorrowingManager';

export default function BorrowingPage() {
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="container-fluid py-4 border-bottom mb-4">
        <h1 className="h2">📚 Borrowing Management</h1>
        <p className="text-muted">Manage book borrowing and returns</p>
      </div>

      {/* Borrowing Manager Component */}
      <BorrowingManager />
    </div>
  );
}
