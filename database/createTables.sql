create database se104;

use se104;

create table WebUser (
  userUUID varchar(36) primary key,
  username varchar(30),
  pwd varchar(100),
  salt varchar(30),
  deleted bit default 0,
  createDate datetime,
  webName varchar(50) character set utf8mb4,
  gender varchar(10),
  email varchar(50),
  phone varchar(15),
  dob datetime
);

create table Staff (
  staffId char(6) primary key,
  sName varchar(50) character set utf8mb4,
  phone varchar(15),
  employmentDate datetime,
  username varchar(30),
  pwd varchar(100),
  salt varchar(30)
);

create table CardInfo (
  infoId int primary key auto_increment,
  rName varchar(50) character set utf8mb4,
  addr varchar(50) character set utf8mb4,
  birthday datetime,
  email varchar(30),
  identityNum varchar(15)
);

create table ReaderCard (
  cardId char(8) primary key,
  infoId int references CardInfo(infoId),
  readerType int,
  issueDate datetime,
  validUntil datetime,
  debt decimal(10, 2) default 0,
  userUUID varchar(36) references WebUser(userUUID),
  staffId char(6) references Staff(staffId)
);

create table Genre (
  genreId int primary key auto_increment,
  gName varchar(20)
);

create table Author (
  authorId int primary key auto_increment,
  aName varchar(50)
);

create table Publisher (
  publisherId int primary key auto_increment,
  pName varchar(40)
);

create table Book (
  bookId int primary key auto_increment,
  publisherId int references Publisher(publisherId),
  publishYear int,
  price decimal(10, 2),
  totalAmount int
);

create table BookImport (
  importId int primary key auto_increment,
  bookId int references Book(bookId),
  amount int,
  staffId char(6) references Staff(staffId),
  importDate datetime
);

create table BookAuthor (
  bookId int references Book(bookId),
  authorId int references Author(authorId),
  primary key (bookId, authorId)
);

create table BookGenre (
  bookId int references Book(bookId),
  genreId int references Genre(genreId),
  primary key (bookId, genreId)
);

create table Borrowing (
  borrowId int primary key auto_increment,
  cardId char(8) references ReaderCard(cardId),
  borrowDate datetime,
  dueDate datetime,
  staffId char(6) references Staff(staffId)
);

create table BorrowingContents (
  borrowId int references Borrowing(borrowId),
  bookId int references Book(bookId),
  primary key (borrowId, bookId)
);

create table Returning (
  returnId int primary key auto_increment,
  cardId int references ReaderCard(cardId),
  returnDate datetime,
  overdueFine decimal(10, 2),
  staffId char(6) references Staff(staffId)
);

create table ReturningContents (
  returnId int references Returning(returnId),
  borrowId int references Borrowing(borrowId),
  bookId int references Book(bookId),
  isLost bit default 0,
  primary key (returnId, bookId)
);

create table FineInvoice (
  invoiceId int primary key auto_increment,
  cardId int references ReaderCard(cardId),
  paid decimal(10, 2),
  staffId char(6) references Staff(staffId)
);

create table Parameters (
  minAge int,
  maxAge int,
  cardValidDuration int,
  validPublishment int,
  maxBorrow int,
  maxDayBorrow int,
  overdueFinePerDay int
);