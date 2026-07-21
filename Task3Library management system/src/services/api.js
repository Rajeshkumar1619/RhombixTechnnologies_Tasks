/**
 * API Service Layer for Library Management System
 * 
 * This module provides all API calls for Books, Members, and Borrowing Records
 * Following REST principles with proper HTTP method usage:
 * - GET: Retrieve resources (Idempotent)
 * - POST: Create new resources (NOT Idempotent)
 * - PUT: Update existing resources (Idempotent)
 * - DELETE: Remove resources (Idempotent)
 */

const API_BASE_URL = 'http://localhost:3001';

// ============ BOOKS API ============
// Resource: /books
// Represents book catalog and inventory

export const booksAPI = {
  /**
   * GET /books - Retrieve all books
   * Idempotent: Yes - Multiple calls return same data
   */
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${API_BASE_URL}/books?${queryString}` : `${API_BASE_URL}/books`;
      console.log(`[GET] ${url}`);
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  /**
   * GET /books/:id - Retrieve specific book by ID
   * Idempotent: Yes - Same book returned every time
   */
  getById: async (id) => {
    try {
      const url = `${API_BASE_URL}/books/${id}`;
      console.log(`[GET] ${url}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Book not found: ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching book ${id}:`, error);
      throw error;
    }
  },

  /**
   * POST /books - Create new book
   * NOT Idempotent: Each call creates a new book
   * Request body: { title, author, isbn, category, publishYear, totalCopies }
   */
  create: async (bookData) => {
    try {
      const url = `${API_BASE_URL}/books`;
      console.log(`[POST] ${url}`, bookData);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookData,
          availableCopies: bookData.totalCopies,
          status: 'available'
        })
      });
      if (!response.ok) throw new Error('Failed to create book');
      return await response.json();
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  /**
   * PUT /books/:id - Update existing book (full replacement)
   * Idempotent: Yes - Replacing with same data produces same result
   * Request body: Updated book data
   */
  update: async (id, bookData) => {
    try {
      const url = `${API_BASE_URL}/books/${id}`;
      console.log(`[PUT] ${url}`, bookData);
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      if (!response.ok) throw new Error('Failed to update book');
      return await response.json();
    } catch (error) {
      console.error(`Error updating book ${id}:`, error);
      throw error;
    }
  },

  /**
   * DELETE /books/:id - Delete book
   * Idempotent: Yes - Deleting same book twice has same effect
   */
  delete: async (id) => {
    try {
      const url = `${API_BASE_URL}/books/${id}`;
      console.log(`[DELETE] ${url}`);
      const response = await fetch(url, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete book');
      return response.ok;
    } catch (error) {
      console.error(`Error deleting book ${id}:`, error);
      throw error;
    }
  }
};

// ============ MEMBERS API ============
// Resource: /members
// Represents library members and their information

export const membersAPI = {
  /**
   * GET /members - Retrieve all members
   * Idempotent: Yes
   */
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${API_BASE_URL}/members?${queryString}` : `${API_BASE_URL}/members`;
      console.log(`[GET] ${url}`);
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  /**
   * GET /members/:id - Retrieve specific member
   * Idempotent: Yes
   */
  getById: async (id) => {
    try {
      const url = `${API_BASE_URL}/members/${id}`;
      console.log(`[GET] ${url}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Member not found: ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching member ${id}:`, error);
      throw error;
    }
  },

  /**
   * POST /members - Register new member
   * NOT Idempotent: Each call creates new member
   * Request body: { firstName, lastName, email, membershipStatus }
   */
  create: async (memberData) => {
    try {
      const url = `${API_BASE_URL}/members`;
      console.log(`[POST] ${url}`, memberData);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...memberData,
          membershipDate: new Date().toISOString().split('T')[0],
          borrowedBooks: 0,
          maxBorrowLimit: 5
        })
      });
      if (!response.ok) throw new Error('Failed to create member');
      return await response.json();
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  /**
   * PUT /members/:id - Update member information
   * Idempotent: Yes
   */
  update: async (id, memberData) => {
    try {
      const url = `${API_BASE_URL}/members/${id}`;
      console.log(`[PUT] ${url}`, memberData);
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      if (!response.ok) throw new Error('Failed to update member');
      return await response.json();
    } catch (error) {
      console.error(`Error updating member ${id}:`, error);
      throw error;
    }
  },

  /**
   * DELETE /members/:id - Deactivate member
   * Idempotent: Yes
   */
  delete: async (id) => {
    try {
      const url = `${API_BASE_URL}/members/${id}`;
      console.log(`[DELETE] ${url}`);
      const response = await fetch(url, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete member');
      return response.ok;
    } catch (error) {
      console.error(`Error deleting member ${id}:`, error);
      throw error;
    }
  }
};

// ============ BORROWING RECORDS API ============
// Resource: /borrow-records
// Hierarchical routes: /members/:memberId/borrowed-books, /books/:bookId/borrow-history
// Represents borrowing transactions and history

export const borrowingAPI = {
  /**
   * GET /borrow-records - List all borrowing records
   * Idempotent: Yes
   */
  getAll: async () => {
    try {
      const url = `${API_BASE_URL}/borrow-records`;
      console.log(`[GET] ${url}`);
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching borrow records:', error);
      throw error;
    }
  },

  /**
   * GET /members/:memberId/borrowed-books - Get books borrowed by specific member
   * Hierarchical resource structure demonstrating relationship
   * Idempotent: Yes
   */
  getMemberBorrowedBooks: async (memberId) => {
    try {
      const url = `${API_BASE_URL}/borrow-records?memberId=${memberId}&status=borrowed`;
      console.log(`[GET] ${url}`);
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching borrowed books for member ${memberId}:`, error);
      throw error;
    }
  },

  /**
   * GET /books/:bookId/borrow-history - Get borrowing history of specific book
   * Hierarchical resource structure demonstrating relationship
   * Idempotent: Yes
   */
  getBookHistory: async (bookId) => {
    try {
      const url = `${API_BASE_URL}/borrow-records?bookId=${bookId}`;
      console.log(`[GET] ${url}`);
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching history for book ${bookId}:`, error);
      throw error;
    }
  },

  /**
   * POST /borrow-records - Record a borrow transaction
   * NOT Idempotent: Each call creates new borrow record
   * Request body: { bookId, memberId, borrowDate, dueDate }
   */
  recordBorrow: async (borrowData) => {
    try {
      const url = `${API_BASE_URL}/borrow-records`;
      console.log(`[POST] ${url}`, borrowData);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...borrowData,
          returnDate: null,
          status: 'borrowed'
        })
      });
      if (!response.ok) throw new Error('Failed to record borrow');
      return await response.json();
    } catch (error) {
      console.error('Error recording borrow:', error);
      throw error;
    }
  },

  /**
   * PUT /borrow-records/:recordId - Update borrow record (e.g., record return)
   * Idempotent: Yes - Same data produces same result
   * Request body: { status, returnDate }
   */
  recordReturn: async (recordId, returnData) => {
    try {
      const url = `${API_BASE_URL}/borrow-records/${recordId}`;
      console.log(`[PUT] ${url}`, returnData);
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...returnData,
          status: 'returned'
        })
      });
      if (!response.ok) throw new Error('Failed to record return');
      return await response.json();
    } catch (error) {
      console.error(`Error recording return for record ${recordId}:`, error);
      throw error;
    }
  },

  /**
   * DELETE /borrow-records/:recordId - Delete borrow record
   * Idempotent: Yes
   */
  delete: async (recordId) => {
    try {
      const url = `${API_BASE_URL}/borrow-records/${recordId}`;
      console.log(`[DELETE] ${url}`);
      const response = await fetch(url, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete borrow record');
      return response.ok;
    } catch (error) {
      console.error(`Error deleting borrow record ${recordId}:`, error);
      throw error;
    }
  }
};

/**
 * REST PRINCIPLES DEMONSTRATION:
 * 
 * 1. STATELESSNESS:
 *    - Each request contains all necessary information
 *    - Server doesn't store client context between requests
 *    - Example: We use /borrow-records?memberId=1 instead of maintaining session state
 *    - No dependency on previous requests; each call is independent
 * 
 * 2. IDEMPOTENCE:
 *    - GET endpoints: Always idempotent (read-only)
 *    - PUT endpoints: Idempotent (replace entire resource)
 *    - DELETE endpoints: Idempotent (deleting twice = same result)
 *    - POST endpoints: NOT idempotent (creates new resource each time)
 *
 * 3. RESOURCE-ORIENTED DESIGN:
 *    - Using plural nouns: /books, /members, /borrow-records
 *    - No verbs in URLs: /books/1 instead of /getBook/1
 *    - Hierarchical relationships: /members/:id/borrowed-books
 */
