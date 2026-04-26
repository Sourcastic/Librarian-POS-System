
-- USE LMS;
-- If LMS doesn't exist yet, uncomment the following two lines:
-- CREATE DATABASE LMS;
USE LMS;

-- Admins
INSERT INTO Admins (Fullname, Email, Password, Contact, Role) VALUES
('Alice Johnson', 'alice@lms.com', 'hashed_pw_1', '1234567890', 'superadmin'),
('Bob Smith', 'bob@lms.com', 'hashed_pw_2', '0987654321', 'librarian'),
('Carol Davis', 'carol@lms.com', 'hashed_pw_3', '2223334444', 'assistant');

-- Users
INSERT INTO Users (Fullname, Email, Contact, Join_date, cardStatus) VALUES
('Charlie Ray', 'charlie@mail.com', '5551234567', '2023-09-15', 'active'),
('Dana Lee', 'dana@mail.com', '5557654321', '2024-01-20', 'inactive'),
('Eli Thompson', 'eli@mail.com', '5559876543', '2024-02-10', 'inactive'),
('Fiona Hart', 'fiona@mail.com', '5554567890', '2024-03-05', 'active');

-- Publishers
INSERT INTO Publishers (Publ_name, Contact, Address) VALUES
('Pearson Education', '1112223333', '221B Baker Street, London'),
('O’Reilly Media', '4445556666', '1005 Gravenstein Highway North, CA'),
('Penguin Books', '7778889999', '375 Hudson St, New York, NY');

-- Books
INSERT INTO Books (ISBN, Title, Author, Year_of_Publication, Genre, Language, Publisher_id) VALUES
('978-0-13-110362-7', 'C Programming Language', 'Brian Kernighan', 1988, 'Programming', 'English', 1),
('978-1-491-94728-6', 'Learning JavaScript', 'Ethan Brown', 2016, 'Web Development', 'English', 2),
('978-0-14-143951-8', 'Pride and Prejudice', 'Jane Austen', 1813, 'Fiction', 'English', 3),
('978-0-13-235088-4', 'Clean Code', 'Robert C. Martin', 2008, 'Programming', 'English', 1);

delete from Borrowing where User_id >= 1 

select * from Fines;

delete from Users where User_id = 6;