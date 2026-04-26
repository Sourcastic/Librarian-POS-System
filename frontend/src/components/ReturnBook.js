import React, { useState } from 'react';

function ReturnBook() {
  const [isbn, setIsbn] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isReturned, setIsReturned] = useState(false);  // State to track if book is returned
  const [fine, setFine] = useState(0);

const handleReturnBook = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`/returnBook/${isbn}`, {
      method: 'PUT',
    });
    console.log('Response object:', res);
    if (res.ok) {

      const data = await res.json();  // Assuming this response gives the fine information
      setFine(data.fine || 0);         // Set the fine if available
      setIsReturned(true);             // Mark the book as returned
      setMessage('Book returned successfully');
      setIsbn('');
      setError('');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to return the book');
      setMessage('');
    }
  } catch (err) {
    console.error('Error:', err);
    setError('Error returning the book');
    setMessage('');
  }
};

app.put('/payFine/:isbn', async (req, res) => {
  const { isbn } = req.params;  // Extract ISBN from URL parameter

  try {
    const pool = await sql.connect(config);

    // Check if the fine exists and is unpaid for the given ISBN
    const fineResult = await pool.request()
      .input('isbn', sql.VarChar, isbn)
      .query(`
        SELECT Fine_id, Fine_amount
        FROM Fines
        WHERE ISBN = @isbn AND Paid_status = 'unpaid'
        ORDER BY Fine_id DESC
        LIMIT 1
      `);

    if (fineResult.recordset.length === 0) {
      // No unpaid fine found
      return res.status(404).json({ error: 'No unpaid fine found for this ISBN' });
    }

    const fine = fineResult.recordset[0];
    const fineId = fine.Fine_id;
    const fineAmount = fine.Fine_amount;

    // Mark the fine as paid
    await pool.request()
      .input('fineId', sql.Int, fineId)
      .query(`
        UPDATE Fines
        SET Paid_status = 'paid'
        WHERE Fine_id = @fineId
      `);

    // Record the transaction in the Transactions table
    await pool.request()
      .input('userId', sql.Int, 1)  // Placeholder for User_id, should come from session or token
      .input('isbn', sql.VarChar, isbn)
      .input('fineId', sql.Int, fineId)
      .input('fineAmount', sql.Float, fineAmount)
      .query(`
        INSERT INTO Transactions (User_id, ISBN, Fine_id, Amount, Trans_date)
        VALUES (@userId, @isbn, @fineId, @fineAmount, GETDATE())
      `);

    // Respond with a success message
    res.json({ message: 'Fine paid successfully' });

  } catch (err) {
    console.error('Error paying fine:', err);
    res.status(500).json({ error: 'Error paying the fine' });
  }
});

        console.log('isReturned:', isReturned);
    console.log('fine:', fine, typeof fine);

  return (
    <div className="form-container">
      <h2>Return Book</h2>
      <form onSubmit={handleReturnBook}>
        <label>
          ISBN:
          <input
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            required
          />
        </label>
        <button type="submit">Return Book</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}




      {/* Show Pay Fine button only if book is returned and fine is present */}
      {isReturned && fine > 0 && (
        <div>
          <button onClick={handlePayFine}>Pay ${fine}</button>
        </div>
      )}
    </div>
  );
}

export default ReturnBook;
