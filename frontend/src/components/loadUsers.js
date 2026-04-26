import React, { useState, useEffect } from 'react';

function LoadUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // Fetching users data from the server
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/Users');
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError('Error loading users');
      }
    };
    fetchUsers();
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <div className="user-list-container">
      <h2>Users List</h2>
      {error && <p className="error-message">{error}</p>}
      <ul>
        {users.map(user => (
          <li key={user.User_id} className="user-card">
            <div className="user-info">
                <p><strong>User id:</strong> {user.User_id}</p>
              <p><strong>Name:</strong> {user.Fullname}</p>
              <p><strong>Email:</strong> {user.Email}</p>
              <p><strong>Contact:</strong> {user.Contact}</p>
              <p><strong>Join Date:</strong> {user.join_date}</p>
              <p><strong>Card Holder:</strong> {user.cardStatus}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LoadUsers;
