const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
port: 5000;

app.use(express.static('public'));
let pool;


app.use(express.json());
app.use(cors());

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        trustServerCertificate: true,
        encrypt: false,
    },
};



sql.connect(config).then(p => {
    console.log('Connected to SQL Server');
    pool = p;

    app.listen(5000, () => {
        console.log('Server running at http://localhost:5000');
    });
}).catch(err => {
    console.error('Database connection failed:', err);
});



app.get('/books', async (req, res) => {
    //console.log('GET /books triggered');

    try {
        const result = await pool.request().query(`
        SELECT
        b.ISBN,
        b.Title,
        b.Author,
        b.Year_of_Publication,
        b.Genre,
        b.Language,
        b.Publisher_id,
        p.Publ_name AS PublisherName,
        p.Publisher_id AS PublisherID,
        dbo.fn_GetBorrowStatus(b.ISBN) AS BorrowStatus
        FROM Books b
        LEFT JOIN Publishers p ON b.Publisher_id = p.Publisher_id
        ORDER BY Title, Author, Year_of_Publication
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Book not found', err);
        res.status(500).json({ error: 'Error fetching books' });
    }
});






app.get('/books/:field/:value', async (req, res) => {
    const { field, value } = req.params;

    // Ensure the field is allowed to prevent SQL injection
    const allowedFields = ['ISBN', 'Title', 'Author', 'Genre', 'Year_of_Publication', 'Language', 'PublisherName'];

    if (!allowedFields.includes(field)) {
        return res.status(400).json({ error: 'Invalid search field' });
    }

    try {
        const pool = await sql.connect(config);

        // Dynamically select column based on field
        const column = field === 'PublisherName'
        ? 'p.Publ_name'
        : `b.${field}`;

        const result = await pool.request()
        .input('value', sql.VarChar, value)
        .query(`
        SELECT
        b.*,
        p.Publ_name AS PublisherName,
        p.Publisher_id AS PublisherID,
        dbo.fn_GetBorrowStatus(b.ISBN) AS BorrowStatus
        FROM Books b
        LEFT JOIN Publishers p
        ON b.Publisher_id = p.Publisher_id
        WHERE ${column} = @value
        ORDER BY Title, Author, Year_of_Publication
        `);

        // Check if the result has records
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No books found matching the search criteria' });
        }

        res.json(result.recordset);
    } catch (err) {
        console.error("Error searching books", err);
        res.status(500).json({ error: "Failed to search books" });
    }
});






app.get('/Users', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .query('SELECT User_id, Fullname, Email, Contact, join_date, cardStatus FROM Users');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching users', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});



app.post('/addBooks', async (req, res) => {
    const { isbn, title, author, year, genre, language, publisher_id } = req.body;
    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input('isbn', sql.VarChar(17), isbn)
        .input('title', sql.VarChar(100), title)
        .input('author', sql.VarChar(80), author)
        .input('year', sql.Int, year)
        .input('genre', sql.VarChar(50), genre)
        .input('language', sql.VarChar(30), language)
        .input('publisher_id', sql.Int, publisher_id)
        .query(`INSERT INTO Books (ISBN, Title, Author, Year_of_Publication, Genre, Language, Publisher_id)
        VALUES (@isbn, @title, @author, @year, @genre, @language, @publisher_id)`);

        res.json({ message: "Book added successfully" });
    } catch (err) {
        console.error("Error adding book", err);
        res.status(500).json({ error: "Failed to add book" });
    }
});

app.post('/addUser', async (req, res) => {
    const { fullname, email, contact, cardStatus } = req.body;

    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input('fname',      sql.VarChar(80), fullname)
        .input('mail',       sql.VarChar(90), email)
        .input('num',        sql.VarChar(15), contact)
        .input('cardStatus', sql.VarChar(3),  cardStatus)
        .query(`
        INSERT INTO Users
        (Fullname, Email, Contact, join_date, cardStatus)
        VALUES
        (@fname,   @mail,  @num,     GETDATE(),   @cardStatus)
        `);

        res.json({ message: "User added" });
    } catch (err) {
        console.error("Error adding user", err);
        res.status(500).json({ error: "Failed to add user" });
    }
});


// Update book
app.put('/UpdateBooks/:isbn', async (req, res) => {
    const { isbn } = req.params;
    const { title, author, year, genre, language, publisher_id } = req.body;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('isbn', sql.VarChar(17), isbn)
        .input('title', sql.VarChar(100), title)
        .input('author', sql.VarChar(80), author)
        .input('year', sql.Int, year)
        .input('genre', sql.VarChar(50), genre)
        .input('language', sql.VarChar(30), language)
        .input('publisher_id', sql.Int, publisher_id)
        .query(`UPDATE Books SET Title=@title, Author=@author, Year_of_Publication=@year,
               Genre=@genre, Language=@language, Publisher_id=@publisher_id
               WHERE ISBN=@isbn`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json({ message: "Book updated successfully" });
    } catch (err) {
        console.error("Error updating book", err);
        res.status(500).json({ error: "Failed to update book" });
    }
});


app.put('/updateUser/:id', async (req, res) => {
    const { id } = req.params;
    const {fname,mail,num,date } = req.body;
    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input('user_id',sql.Int,id)
        .input('fname',sql.VarChar(80),fname)
        .input('mail',sql.VarChar(90),mail)
        .input('num',sql.VarChar(15),num)
        .input('date', sql.Date,date)
        .query('update Users set Fullname=@fname,Email=@mail,Contact=@num,Join_date=@date where User_id=user_id');
        res.json({ message: "user added" });
    } catch (err) {
        console.error("Error in adding a user", err);
        res.status(500).json({ error: "Failed to add User" });
    }
});

// Delete a book

app.delete('/Deletebook/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('isbn', sql.VarChar(17), isbn)
        .query('DELETE FROM Books WHERE ISBN=@isbn');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json({ message: "Book deleted successfully" });
    } catch (err) {
        console.error("Error deleting book", err);
        res.status(500).json({ error: "Failed to delete book" });
    }
});




app.put('/returnBook/:isbn', async (req, res) => {
    const { isbn } = req.params;

    try {
        const pool = await sql.connect(config);

        await pool.request()
        .input('isbn', sql.VarChar, isbn)
        .query(`
        UPDATE Borrowing
        SET Return_status = 'returned'
        WHERE ISBN = @isbn AND Return_status = 'borrowed'
        `);

        const fineResult = await pool.request()
        .input('isbn', sql.VarChar, isbn)
        .query(`
        SELECT TOP 1 Fine_amount
        FROM Fines
        WHERE ISBN = @isbn AND Paid_status = 'unpaid'
        ORDER BY Fine_id DESC
        `);

        const fine = fineResult.recordset[0]?.Fine_amount || 0;

        res.json({ fine }); // send the fine back to frontend
    } catch (err) {
        console.error('Error returning book:', err);
        res.status(500).json({ error: 'Failed to return the book' });
    }
});

app.put('/payFine/:isbn', async (req, res) => {
    const { isbn } = req.params;

    try {
        const pool = await sql.connect(config);

        // Check if the fine exists and is unpaid for the given ISBN
        const fineResult = await pool.request()
        .input('isbn', sql.VarChar, isbn)
        .query(`
        SELECT Fine_id
        FROM Fines
        WHERE ISBN = @isbn AND Paid_status = 'unpaid'
        ORDER BY Fine_id DESC
        LIMIT 1
        `);

        if (fineResult.recordset.length === 0) {
            return res.status(404).json({ error: 'No unpaid fine found for this ISBN' });
        }

        const fineId = fineResult.recordset[0].Fine_id;
        const fineAmount = 16; // Hardcoding fine amount to 16

        res.json({ message: 'Fine paid successfully' });

    } catch (err) {
        console.error('Error paying fine:', err);
        res.status(500).json({ error: 'Error paying the fine' });
    }
});


app.delete('/deleteUser/:id',async (req, res) => {
    const { id} = req.params;
    try {
        const pool= await sql.connect(config);
        await pool.request()
        .input('id',sql.Int, id)
        .query('DELETE FROM Users WHERE User_id=@id');
        res.json({ message: "User deleted " });
    } catch (err) {
        console.error("Error deleting user", err);

        res.status(500).json({ error: "Failed to delete user" });
    }
});
app.get('/fines', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Fines');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching fines", err);
        res.status(500).json({ error: "Failed to fetch fines" });
    }
});
app.get('/fines/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('fine_id', sql.Int, fine_id)
        .query('SELECT * FROM Fines WHERE Fine_id = @fine_id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Fine not found" });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error fetching fine", err);
        res.status(500).json({ error: "Failed to fetch fine" });
    }
});
app.post('/addFine', async (req, res) => {
    const { user_id, isbn, borrow_date, fine_amount, paid_status } = req.body;

    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input('user_id', sql.Int, user_id)
        .input('isbn', sql.VarChar(17), isbn)
        .input('borrow_date', sql.Date, borrow_date)
        .input('fine_amount', sql.Decimal(10, 2), fine_amount)
        .input('paid_status', sql.VarChar(10), paid_status)
        .query('INSERT INTO Fines (User_id, ISBN, Borrow_date, Fine_amount, Paid_status) VALUES (@user_id, @isbn, @borrow_date, @fine_amount, @paid_status)');

        res.json({ message: "Fine added successfully" });
    } catch (err) {
        console.error("Error adding fine", err);
        res.status(500).json({ error: "Failed to add fine" });
    }
});
app.put('/updateFine/:id', async (req, res) => {
    const { fine_id } = req.params;
    const { fine_amount, paid_status } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('fine_id', sql.Int,id)
        .input('fine_amount', sql.Decimal(10, 2), fine_amount)
        .input('paid_status', sql.VarChar(10), paid_status)
        .query('UPDATE Fines SET Fine_amount = @fine_amount, Paid_status = @paid_status WHERE Fine_id = @fine_id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Fine not found" });
        }

        res.json({ message: "Fine updated successfully" });
    } catch (err) {
        console.error("Error updating fine", err);
        res.status(500).json({ error: "Failed to update fine" });
    }
});
app.delete('/deleteFine/:id', async (req, res) => {
    const { fine_id } = req.params;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('fine_id', sql.Int,id)
        .query('DELETE FROM Fines WHERE Fine_id = @fine_id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Fine not found" });
        }

        res.json({ message: "Fine deleted successfully" });
    } catch (err) {
        console.error("Error deleting fine", err);
        res.status(500).json({ error: "Failed to delete fine" });
    }
});

app.get('/admins', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Admins');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching admins", err);
        res.status(500).json({ error: "Failed to fetch admins" });
    }
});

app.get('/admins/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('admin_id', sql.Int, id)
        .query('SELECT * FROM Admins WHERE Admin_id = @admin_id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Admin not found" });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error fetching admin", err);
        res.status(500).json({ error: "Failed to fetch admin" });
    }
});

app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('Email', sql.VarChar, username)
        .query('SELECT * FROM Admins WHERE Email = @Email');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const admin = result.recordset[0];

        if (admin.Password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({ message: 'Login successful', role: admin.role });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server errror' });
    }
});



app.post('/addAdmin', async (req, res) => {
    const { fname, email, password, role } = req.body;

    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input('fname', sql.VarChar(80), fname)
        .input('email', sql.VarChar(100), email)
        .input('password', sql.VarChar(255), password) // Store hashed password in real applications
        .input('role', sql.VarChar(50), role)
        .query('INSERT INTO Admins (Fullname, Email, Password, Role) VALUES (@fname, @email, @password, @role)');

        res.json({ message: "Admin added successfully" });
    } catch (err) {
        console.error("Error adding admin", err);
        res.status(500).json({ error: "Failed to add admin" });
    }
});

app.put('/updateAdmin/:admin_id', async (req, res) => {
    const { admin_id } = req.params;
    const { fname, email, password, role } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('admin_id', sql.Int, admin_id)
        .input('fname', sql.VarChar(80), fname)
        .input('email', sql.VarChar(100), email)
        .input('password', sql.VarChar(255), password) // Store hashed password in real applications
        .input('role', sql.VarChar(50), role)
        .query('UPDATE Admins SET Fullname = @fname, Email = @email, Password = @password, Role = @role WHERE Admin_id = @admin_id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Admin not found" });
        }

        res.json({ message: "Admin updated successfully" });
    } catch (err) {
        console.error("Error updating admin", err);
        res.status(500).json({ error: "Failed to update admin" });
    }
});
app.delete('/deleteAdmin/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('admin_id', sql.Int, id)
        .query('DELETE FROM Admins WHERE Admin_id = @admin_id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Admin not found" });
        }

        res.json({ message: "Admin deleted successfully" });
    } catch (err) {
        console.error("Error deleting admin", err);
        res.status(500).json({ error: "Failed to delete admin" });
    }
});

app.get('/transactions', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Transactions');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching transactions", err);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});
app.get('/transactions/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('transaction_id', sql.Int,id)
        .query('SELECT * FROM Transactions WHERE Transaction_id = @transaction_id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Transaction not found" });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error fetching transaction", err);
        res.status(500).json({ error: "Failed to fetch transaction" });
    }
});

app.post('/addTransaction', async (req, res) => {
    const { user_id, book_id, issue_date, due_date, return_date, fine_amount } = req.body;

    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input('user_id', sql.Int, user_id)
        .input('book_id', sql.Int, book_id)
        .input('issue_date', sql.Date, issue_date)
        .input('due_date', sql.Date, due_date)
        .input('return_date', sql.Date, return_date || null) // Nullable field
        .input('fine_amount', sql.Decimal(10, 2), fine_amount || 0.00)
        .query(`INSERT INTO Transactions (User_id, Book_id, Issue_date, Due_date, Return_date, Fine_amount)
        VALUES (@user_id, @book_id, @issue_date, @due_date, @return_date, @fine_amount)`);

        res.json({ message: "Transaction added successfully" });
    } catch (err) {
        console.error("Error adding transaction", err);
        res.status(500).json({ error: "Failed to add transaction" });
    }
});
app.put('/updateTransaction/:id', async (req, res) => {
    const {id} = req.params;
    const { user_id, book_id, issue_date, due_date, return_date, fine_amount } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('transaction_id', sql.Int,id)
        .input('user_id', sql.Int, user_id)
        .input('book_id', sql.Int, book_id)
        .input('issue_date', sql.Date, issue_date)
        .input('due_date', sql.Date, due_date)
        .input('return_date', sql.Date, return_date || null)
        .input('fine_amount', sql.Decimal(10,2), fine_amount || 0.00)
        .query(`UPDATE Transactions SET
        User_id = @user_id,
        Book_id = @book_id,
        Issue_date = @issue_date,
        Due_date = @due_date,
        Return_date = @return_date,
        Fine_amount = @fine_amount
        WHERE Transaction_id = @transaction_id`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.json({ message: "Transaction updated successfully" });
    } catch (err) {
        console.error("Error updating transaction", err);
        res.status(500).json({ error: "Failed to update transaction" });
    }
});
app.delete('/deleteTransaction/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('transaction_id', sql.Int,id)
        .query('DELETE FROM Transactions WHERE Transaction_id = @transaction_id');
        res.json({ message: "Transaction deleted successfully" });
    } catch (err) {
        console.error("Error deleting transaction", err);
        res.status(500).json({ error: "Failed to delete transaction" });
    }
});
app.get('/borrowings', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Borrowing');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching borrowing records", err);
        res.status(500).json({ error: "Failed to fetch borrowing records" });
    }
});
app.get('/borrowings/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('borrow_id', sql.Int,id)
        .query('SELECT * FROM Borrowing WHERE Borrow_id = @borrow_id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Borrowing record not found" });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error fetching borrowing record", err);
        res.status(500).json({ error: "Failed to fetch borrowing record" });
    }
});

app.post('/borrowBook', async (req, res) => {
    const { userId, isbn } = req.body;

    try {
        const pool = await sql.connect(config);

        const userResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`SELECT cardStatus FROM Users WHERE User_id = @userId`);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cardStatus = userResult.recordset[0].CardStatus;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (cardStatus === 'active' ? 120 : 30));

        await pool.request()
        .input('userId', sql.Int, userId)
        .input('isbn', sql.VarChar(17), isbn)
        .input('dueDate', sql.Date, dueDate)
        .query(`
        INSERT INTO Borrowing (User_id, ISBN, Borrow_date, Due_Date, Return_status)
        VALUES (@userId, @isbn, GETDATE(), @dueDate, 'borrowed')
        `);

        return res.json({ message: 'Book borrowed successfully!' });

    } catch (err) {
        console.error("Error in borrowBook route:", err);
        return res.status(500).json({ error: 'Server error borrowing book' });
    }
});



app.put('/updateBorrowing/:id', async (req, res) => {
    const {id} = req.params;
    const { user_id, book_id, borrow_date, due_date, return_date, status } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('borrow_id', sql.Int, id)
        .input('user_id', sql.Int, user_id)
        .input('book_id', sql.Int, book_id)
        .input('borrow_date', sql.Date, borrow_date)
        .input('due_date', sql.Date, due_date)
        .input('return_date', sql.Date, return_date || null) // Nullable field
        .input('status', sql.VarChar(20), status)
        .query(`UPDATE Borrowing SET
        User_id = @user_id,
        Book_id = @book_id,
        Borrow_date = @borrow_date,
        Due_date = @due_date,
        Return_date = @return_date,
        Status = @status
        WHERE Borrow_id = @borrow_id`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Borrowing record not found" });
        }

        res.json({ message: "Borrowing record updated successfully" });
    } catch (err) {
        console.error("Error updating borrowing record", err);
        res.status(500).json({ error: "Failed to update borrowing record" });
    }
});
app.delete('/deleteBorrowing/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('borrow_id', sql.Int, id)
        .query('DELETE FROM Borrowing WHERE Borrow_id = @borrow_id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Borrowing record not found" });
        }

        res.json({ message: "Borrowing record deleted successfully" });
    } catch (err) {
        console.error("Error deleting borrowing record", err);
        res.status(500).json({ error: "Failed to delete borrowing record" });
    }
});

app.get('/cardholders', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM CardHolder');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching cardholders", err);
        res.status(500).json({ error: "Failed to fetch cardholders" });
    }
});

app.get('/cardholders/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('card_id', sql.Int, id)
        .query('SELECT * FROM CardHolder WHERE Card_id = @card_id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "CardHolder not found" });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error fetching cardholder", err);
        res.status(500).json({ error: "Failed to fetch cardholder" });
    }
});


app.get('/publishers', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('select * FROM Publishers');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error !!", err);
        res.status(500).json({ error: "Failed !!!" });
    }
});
app.get('/publishers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('publisher_id', sql.Int, id)
        .query('SELECT * FROM Publishers WHERE Publisher_id = @publisher_id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Publisher not found" });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error 1!!!!", err);
        res.status(500).json({ error: "Failed 1!!" });
    }
});
app.post('/addPublisher', async (req, res) => {
    const { publ_name, contact, address } = req.body;

    if (!publ_name) {
        return res.status(400).json({ error: 'Publisher name is required' });
    }

    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input('publ_name', sql.VarChar, publ_name)
        .input('contact', sql.VarChar, contact || null)
        .input('address', sql.Text, address || null)
        .query(`
        INSERT INTO Publishers (Publ_name, contact, Address)
        VALUES (@publ_name, @contact, @address)
        `);

        res.json({ message: 'Publisher added successfully' });
    } catch (err) {
        console.error('Error!!!!', err);
        res.status(500).json({ error: 'ERROR!!!!2' });
    }
});

app.put('/updatePublisher/:id', async (req, res) => {
    const {id } = req.params;
    const { name, address, contact, email } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('publisher_id', sql.Int, id)
        .input('name', sql.VarChar(100), name)
        .input('address', sql.VarChar(255), address)
        .input('contact', sql.VarChar(20), contact)
        .input('email', sql.VarChar(100), email)
        .query(`UPDATE Publishers SET
        Name = @name,
        Address = @address,
        Contact = @contact,
        Email = @email
        WHERE Publisher_id = @publisher_id`);

        res.json({ message: "Publisher updated " });
    } catch (err) {
        console.error("Error!!!!", err);
        res.status(500).json({ error: "Failed !!" });
    }
});
app.delete('/deletePublisher/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('publisher_id', sql.Int,id)
        .query('delete from Publishers where Publisher_id = @publisher_id');
        res.json({ message: "Publisher deleted!!" });
    } catch (err) {
        console.error("Error!!!", err);
        res.status(500).json({ error: "Failed!!!!" });
    }
});



app.get('/', (req, res) => {
    res.json("backend");
});
