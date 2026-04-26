import React, { useState } from 'react';

function DeleteUser() {
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');

  const handleDelete = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/deleteUser/${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server responded ${res.status}`);
      setMessage('User deleted successfully');
      setUserId('');
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="form-container">
      <h2>Delete User</h2>
      <form onSubmit={handleDelete}>
        <label>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
          />
        </label>
        <button type="submit">Delete User</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DeleteUser;
