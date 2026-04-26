use master;
GO
create database LMS;
GO
use LMS;
GO
--  This schema has now better varaibel names .... some data constraints 
-- we have added the delete and update casding

-- we have added the Admin table for better control 
-- password for security
-- it does not have USER id as Foriegn key because we are assuming that user can only be a client not an ADmin
-- But it do allows multiple admin roles
create table Admins (
    Admin_id int primary key IDENTITY(1,1),
    Fullname varchar(80) not null,
    Email varchar(90) unique not null,
    Password varchar(255) not null, -- storing hashed passwords
    contact varchar(15),
     role varchar(20) check (role in ('superadmin', 'librarian', 'assistant')) default 'librarian'
);

-- it now uses identity 1,1 for auto increament
create table Users (
    User_id int primary key identity(1,1),
    Fullname varchar(80) not null,
    Email varchar(90) unique not null,
    Contact varchar(15),
    cardStatus varchar(10) check (cardStatus in ('active', 'inactive')) default 'inactive',
    join_date date not null
);

-- publishers table some renameing is done
create table Publishers (
    Publisher_id int primary key identity(1,1),
    Publ_name varchar(100) not null,
    contact varchar(15),
    Address text null
);

-- books table
create table Books (
    ISBN varchar(17) primary key,
    Title varchar(100) not null,
    Author varchar(80) not null,
    Year_of_Publication int,
    Genre varchar(50),
    Language varchar(30),
    Publisher_id int,
    foreign key (Publisher_id) references Publishers(Publisher_id) on delete cascade on update cascade
);

-- borrowing table with composite key (user_id, isbn)
CREATE TABLE Borrowing (
    User_id      INT         NOT NULL,
    ISBN         VARCHAR(17) NOT NULL,
    Borrow_date  DATETIME   NOT NULL DEFAULT GETDATE(),
    Due_Date     DATE        NOT NULL,
    Fine         DECIMAL(10,2) DEFAULT 0.00,
    Return_status VARCHAR(10) 
        CHECK (Return_status IN ('borrowed','returned')) 
        DEFAULT 'borrowed',
    PRIMARY KEY (User_id, ISBN, Borrow_date),
    FOREIGN KEY (User_id) REFERENCES Users(User_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ISBN) REFERENCES Books(ISBN) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
GO

-- fines table (removing borrow_id)
create table Fines (
    Fine_id int primary key identity(1,1),
    User_id int not null,
    ISBN varchar(17) not null,
    Borrow_date datetime not null,
    Fine_amount decimal(10,2) not null check (fine_amount >= 0),
  Paid_status varchar(10) check (paid_status in ('paid', 'unpaid')) default 'unpaid',
    foreign key (User_id,ISBN, Borrow_date) references borrowing(User_id, ISBN, Borrow_date) on delete cascade on update cascade
);

-- transactions table (removing borrow_id)
create table Transactions (
    Trans_id int identity(1,1) primary key,
    User_id int not null,
    ISBN varchar(17) not null,
    Borrow_date datetime not null,
    Fine_id int not null,
    Trans_date date,
    Amount decimal(10,2) not null check (amount >= 0),
    foreign key (User_id, ISBN, Borrow_date) references Borrowing(User_id, ISBN, Borrow_date) on delete cascade on update cascade,
    foreign key (Fine_id) references Fines(Fine_id)
);

GO
CREATE FUNCTION dbo.fn_GetBorrowStatus (@isbn VARCHAR(17))
RETURNS VARCHAR(10)
AS
BEGIN
    DECLARE @status VARCHAR(10)

    IF EXISTS (
        SELECT 1
        FROM Borrowing
        WHERE ISBN = @isbn AND Return_status = 'borrowed'
    )
        SET @status = 'borrowed'
    ELSE
        SET @status = 'available'

    RETURN @status
END



GO
GO
CREATE OR ALTER TRIGGER trg_OnReturnBook
ON Borrowing
AFTER UPDATE
AS
BEGIN

  INSERT INTO Fines (User_id, ISBN, Borrow_date, Fine_amount, Paid_status)
  SELECT
      i.User_id,
      i.ISBN,
      i.Borrow_date,
      -- calculate fine: 10 for first late day + 1 per additional late day
      --10 + (DATEDIFF(day, i.Due_Date, GETDATE()) - 1), --hardcoded for testing
      16,
      'unpaid'
  FROM inserted i
  JOIN deleted d
    ON i.User_id     = d.User_id
   AND i.ISBN        = d.ISBN
   AND i.Borrow_date = d.Borrow_date
  WHERE 
    -- book was borrowed and now is returned
    d.Return_status = 'borrowed'
    AND i.Return_status = 'returned'
    -- only if it’s overdue
    --AND DATEDIFF(day, i.Due_Date, GETDATE()) > 0 --for testing
END;
GO






GO
CREATE OR ALTER TRIGGER trg_OnFinePaid_InsertTransaction
ON Fines
AFTER UPDATE
AS
BEGIN

  INSERT INTO Transactions
    (User_id, ISBN, Borrow_date, Fine_id, Trans_date, Amount)
  SELECT
    i.User_id,
    i.ISBN,
    i.Borrow_date,
    i.Fine_id,
    GETDATE(),       
    i.Fine_amount    
  FROM inserted i
  JOIN deleted d
    ON i.Fine_id = d.Fine_id
  WHERE 
    d.Paid_status = 'unpaid' 
    AND i.Paid_status = 'paid';
END;
GO


