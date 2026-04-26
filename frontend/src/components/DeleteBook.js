import React, { useState } from 'react';

function DeleteBook() {
  const [isbn, setIsbn] = useState('');
  const [message, setMessage] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`/Deletebook/${isbn}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Error deleting book');
      } else {
        setMessage('Book deleted successfully');
        setIsbn('');
      }
    } catch (error) {
      setMessage('An error occurred while deleting the book');
    }
  };

  return (
    <div className="form-container">
      <h2>Delete Book</h2>
      <form onSubmit={handleDelete}>
        <label>
          <input
            type="text"
            placeholder="Enter ISBN to delete"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            required
          />
        </label>
        <button type="submit">Delete Book</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DeleteBook;
