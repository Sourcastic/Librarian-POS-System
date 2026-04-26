import React, { useState } from 'react';
import './App.css';

import BookList from './components/BookList';
import AddBook from './components/addBooks';
import ModifyBook from './components/modifyBooks';
import DeleteBook from './components/DeleteBook';
import AddUser from './components/AddUser';
import LoadUsers from './components/loadUsers'
import ModifyUser from './components/ModifyUser'
import DeleteUser from './components/deleteUser'
import BorrowBook from './components/BorrowBook';
import ReturnBook from './components/ReturnBook';



function App() {
  // existing state
  const [books, setBooks]       = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('Title');

  // login / role state
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState(null);  // 'librarian' | 'superadmin' (can also add librarians and delete librarians)

  // which view to show in main
  const [view, setView]         = useState('list');

  const handleFetchBooks = async () => {
    setBooks([]);

    let url = '/books';
    if (searchTerm.trim()) {
      url = `/books/${searchField}/${encodeURIComponent(searchTerm.trim())}`;
    }


    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error('Response is not an array');
      }
      setBooks(data);
      // wherever you load books:
      console.log('books payload:', data);


    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  // login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setRole(data.role);
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = () => {
    setRole(null);
    setView('list');      // back to book list :3
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="menu">
          <h2>Menu</h2>
          <ul>
            <li>
              <button onClick={() => setView('list')}>
                Books
              </button>
            </li>

            {/* librarian‑only links */}
            {role === 'librarian' && (
              <>
                <li>
                  <button onClick={() => setView('addBooks')}>
                    Add Books
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('modifyBooks')}>
                    Modify Books
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('addUser')}>
                    Add User
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('loadUsers')}>
                    Load Users
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('modifyUsers')}>
                    Modify Users
                  </button>
                </li>
              <li>
                <button onClick={() => setView('borrowBook')}>
                  Borrow Book
                </button>
              </li>

              </>
            )}


          </ul>
        </div>

        {/* swap login/logout */}
        {role
          ? <button id="adminBtn" className="adminBtn" onClick={handleLogout}>
              Logout
            </button>
          : <button id="adminBtn" className="adminBtn" onClick={() => setShowLogin(true)}>
              Admin Login
            </button>
        }
      </aside>

      <main className="main-content">
        {view === 'list' && (
          <>
            <BookList
              books={books}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchField={searchField}
              setSearchField={setSearchField}
              handleFetchBooks={handleFetchBooks}
            />

          </>
        )}

        {view === 'addBooks' && role === 'librarian' && (
          <AddBook />
        )}

        {view === 'modifyBooks' && role === 'librarian' && (
          <>
          <ModifyBook />
          <DeleteBook />
          </>
        )}

        {view === 'addUser' && role === 'librarian' && (
          <AddUser />
        )}

        {view === 'loadUsers' && role === 'librarian' && (
          <LoadUsers />
        )}

        {view === 'modifyUsers' && role === 'librarian' && (
          <>
          <ModifyUser />
          <DeleteUser />
          </>
        )}

        {view === 'borrowBook' && role === 'librarian' && (
          <>
          <BorrowBook />
          <ReturnBook />
          </>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal">
          <div className="modal-content">
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
              <label>
                Email:
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Password:
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Login</button>
              <button type="button" onClick={() => setShowLogin(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
