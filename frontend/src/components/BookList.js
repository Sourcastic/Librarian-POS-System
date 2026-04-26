import React from 'react';

function BookList({
  books,
  searchTerm,
  setSearchTerm,
  searchField,
  setSearchField,
  handleFetchBooks,
}) {
  return (
    <div className="main-content">
      <h1>Books List</h1>

      <div className="search-bar">
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={`Search by ${searchField}`}
        />

        <select value={searchField} onChange={e => setSearchField(e.target.value)}>
          <option value="Title">Title</option>
          <option value="ISBN">ISBN</option>
          <option value="Author">Author</option>
          <option value="Genre">Genre</option>
          <option value="Year_of_Publication">Year</option>
          <option value="Language">Language</option>
          <option value="PublisherName">Publisher</option>
        </select>

        <button className="loadBooksBtn" onClick={handleFetchBooks}>Load Books</button>
      </div>

      <div id="booksList">
        {books.length === 0 ? (
          <p>No books loaded.</p>
        ) : (
          books.map(book => (
            <div key={book.ISBN} className="book-item">
              <h3>{book.Title}</h3>
              <p>Author: {book.Author}</p>
              <p>ISBN: {book.ISBN}</p>
              <p>Year: {book.Year_of_Publication}</p>
              <p>Genre: {book.Genre}</p>
              <p>Language: {book.Language}</p>
              <p>Publisher Name: {book.PublisherName}</p>
              <p>Publisher ID: {book.PublisherID}</p>
              <p>Status: {book.BorrowStatus}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookList;
