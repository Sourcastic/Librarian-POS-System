// src/AddUser.js
import React, { useState } from 'react';

function AddUser() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [cardHolder, setCardHolder] = useState('No'); // default to "No"
  const [message, setMessage] = useState('');

  const handleAddUser = async (e) => {
    e.preventDefault();

    const res = await fetch('/addUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, contact, cardHolder }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('User added successfully!');
      setFullname('');
      setEmail('');
      setContact('');
      setCardHolder('No');
    } else {
      setMessage(data.error || 'Failed to add user.');
    }
  };

  return (
    <div className="form-container">
      <h2>Add User</h2>
      <form onSubmit={handleAddUser}>
        <label>
          Full Name:
          <input type="text" value={fullname} onChange={e => setFullname(e.target.value)} required />
        </label>
        <label>
          Email:
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Contact:
          <input type="text" value={contact} onChange={e => setContact(e.target.value)} />
        </label>
        <label>
          Card Holder:
          <select value={cardHolder} onChange={e => setCardHolder(e.target.value)}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>
        <button type="submit">Add User</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default AddUser;
