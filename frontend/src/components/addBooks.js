import React, { useState } from 'react';

function AddBook() {
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    year: '',
    genre: '',
    language: '',
    publisher_id: ''
  });


  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/addBooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error('Failed to add book');
      }
      alert('Book added successfully!');
      setFormData({
        Title: '',
        Author: '',
        ISBN: '',
        Year_of_Publication: '',
        Genre: '',
        Language: '',
        Publisher_id: ''
      });
    } catch (err) {
      console.error(err);
      alert('Error adding book');
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Book</h2>
      <form onSubmit={handleSubmit}>
        <label>Title: <input name="title" value={formData.title} onChange={handleChange} required /></label>
        <label>Author: <input name="author" value={formData.author} onChange={handleChange} required /></label>
        <label>ISBN: <input name="isbn" value={formData.isbn} onChange={handleChange} required /></label>
        <label>Year: <input name="year" value={formData.year} onChange={handleChange} required /></label>
        <label>Genre: <input name="genre" value={formData.genre} onChange={handleChange} required /></label>
        <label>Language: <input name="language" value={formData.language} onChange={handleChange} required /></label>
        <label>Publisher ID: <input name="publisher_id" value={formData.publisher_id} onChange={handleChange} required /></label>

        <button id="submitBtn" type="submit">Add Book</button>
      </form>
    </div>
  );
}

export default AddBook;
