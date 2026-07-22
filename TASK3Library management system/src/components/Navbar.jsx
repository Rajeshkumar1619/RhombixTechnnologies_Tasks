/**
 * Navbar Component
 * 
 * Displays the main navigation bar with links to:
 * - Dashboard
 * - Books Management
 * - Members Management
 * 
 * Uses Bootstrap navbar for responsive design
 */

import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div className="container-fluid">
        {/* Library Logo/Brand */}
        <Link className="navbar-brand" to="/">
          <i className="bi bi-book"></i> 📚 Library Management System
        </Link>

        {/* Toggle button for mobile */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                📊 Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/books">
                📖 Books
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/members">
                👥 Members
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
