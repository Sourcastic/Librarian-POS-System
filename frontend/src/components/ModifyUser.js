import React, { useState } from 'react';

function ModifyUser() {
  const [userId, setUserId] = useState('');
  const [user, setUser]     = useState(null);
  const [form, setForm]     = useState({});
  const [error, setError]   = useState('');

  const loadUser = async () => {
    try {
      setError('');
      const res = await fetch(`/users/${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setUser(data);
      setForm({
        fullname: data.Fullname,
        email:    data.Email,
        contact:  data.Contact || '',
        cardHolder: data.Card_Holder || 'No'
      });
    } catch (err) {
      console.error(err);
      setError('User not found');
      setUser(null);
    }
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setError('');
      const res = await fetch(`/updateUser/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      alert('User updated successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to update user');
    }
  };

  return (
    <div className="form-container">
      <h2>Modify User</h2>
      <div>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <button onClick={loadUser}>Load User</button>
        {error && <p className="error-message">{error}</p>}
      </div>
      {user && (
        <form onSubmit={handleSubmit}>
          <label>
            Full Name:
            <input
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Contact:
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
            />
          </label>
          <label>
            Card Holder:
            <select
              name="cardHolder"
              value={form.cardHolder}
              onChange={handleChange}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>
          <button type="submit">Update User</button>
        </form>
      )}
    </div>
  );
}

export default ModifyUser;
