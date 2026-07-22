/**
 * App.jsx - Main Application Component
 * 
 * Sets up routing for the Library Management System
 * Integrates all pages and components
 * 
 * Routes:
 * - / : Dashboard
 * - /books : Books Management
 * - /members : Members Management
 * - /borrowing : Borrowing Management
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BooksPage from './pages/BooksPage';
import MembersPage from './pages/MembersPage';
import BorrowingPage from './pages/BorrowingPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/borrowing" element={<BorrowingPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer bg-dark text-white mt-5">
          <div className="container-fluid py-4">
            <div className="row">
              <div className="col-md-6">
                <h6>Library Management System</h6>
                <p className="text-muted">
                  A comprehensive web-based system for managing library operations.
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <p className="text-muted mb-0">
                  © 2026 Computer Science Department
                </p>
                <small className="text-muted">Built with React & Bootstrap</small>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
