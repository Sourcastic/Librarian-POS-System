import React, { useState } from 'react';

function BorrowBook() {
  const [userId, setUserId] = useState('');
  const [isbn, setIsbn] = useState('');
  const [message, setMessage] = useState('');

  const handleBorrow = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/borrowBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isbn })
      });

      const text = await res.text(); // Get raw text response
      console.log('RAW RESPONSE:', text);

      try {
        const data = JSON.parse(text); // Try parsing the response
        if (res.ok) {
          setMessage(data.message || 'Book borrowed successfully!');
        } else {
          setMessage(data.error || 'Failed to borrow book');
        }
      } catch (jsonErr) {
        console.error('JSON parse error:', jsonErr);
        setMessage('Unexpected server response');
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setMessage('Could not connect to the server');
    }
  };

  return (
    <div className="form-container">
      <h2>Borrow Book</h2>
      <form onSubmit={handleBorrow}>
        <label>User ID:
          <input type="text" value={userId} onChange={e => setUserId(e.target.value)} required />
        </label>
        <label>ISBN:
          <input type="text" value={isbn} onChange={e => setIsbn(e.target.value)} required />
        </label>
        <button type="submit">Borrow</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default BorrowBook;
