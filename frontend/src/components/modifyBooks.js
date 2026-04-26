import React, { useState } from 'react';

function ModifyBook() {
  const [isbnLookup, setIsbnLookup] = useState('');
  const [book, setBook]           = useState(null);
  const [formData, setFormData]   = useState({});
  const [error, setError]         = useState('');

  // 1) Fetch the existing book by ISBN
  const handleLoad = async () => {
    try {
      const res = await fetch(`/books/ISBN/${encodeURIComponent(isbnLookup)}`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setBook(data);
      setFormData({
        title:  data.Title,
        author: data.Author,
        year:   data.Year_of_Publication,
        genre:  data.Genre,
        language: data.Language,
        publisher_id: data.Publisher_id
      });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Book not found');
      setBook(null);
    }
  };

  // 2) Handle field changes
  const handleChange = e => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // 3) Submit the updated data
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/modifyBooks/${encodeURIComponent(isbnLookup)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      alert('Book updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update book');
    }
  };

  return (
    <div className="form-container">
      <h2>Modify Existing Book</h2>

      {/* Step 1: S */}
      <div>
        <input
          type="text"
          placeholder="Enter ISBN to modify"
          value={isbnLookup}
          onChange={e => setIsbnLookup(e.target.value)}
        />
        <button onClick={handleLoad}>Load Book</button>
        {error && <p className="error-message">{error}</p>}
      </div>

      {book && (
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Author:
            <input
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Year:
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Genre:
            <input
              name="genre"
              value={formData.genre}
              onChange={handleChange}
            />
          </label>

          <label>
            Language:
            <input
              name="language"
              value={formData.language}
              onChange={handleChange}
            />
          </label>

          <label>
            Publisher ID:
            <input
              type="number"
              name="publisher_id"
              value={formData.publisher_id}
              onChange={handleChange}
            />
          </label>

          <button type="submit">Update Book</button>
        </form>
      )}
    </div>
  );
}

export default ModifyBook;
