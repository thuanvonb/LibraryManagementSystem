-- create database se104;

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
  salt varchar(30),
  permission int
  -- mask: 1 - services; 2 - parameter update; 4 - report; 8 - staff control; 16 - full control
);

create table CardInfo (
  infoId int primary key auto_increment,
  rName varchar(50) character set utf8mb4,
  addr varchar(100) character set utf8mb4,
  birthday datetime,
  email varchar(30),
  identityNum varchar(15)
);

create table ReaderCard (
  cardId char(8) primary key,
  infoId int references CardInfo(infoId),
  readerType varchar(10),
  issueDate datetime,
  validUntil datetime,
  debt decimal(10, 2) default 0,
  userUUID varchar(36) references WebUser(userUUID),
  staffId char(6) references Staff(staffId)
);

create table Author (
  authorId int primary key auto_increment,
  aName varchar(50) character set utf8mb4
);

create table Genre (
  genreId int primary key auto_increment,
  gName varchar(30) character set utf8mb4
);

create table Publisher (
  publisherId int primary key auto_increment,
  pName varchar(40) character set utf8mb4
);

create table BookTitle (
  titleId int primary key auto_increment,
  bName varchar(50) character set utf8mb4,
  genreId int references Genre(genreId)
);

create table BookAuthor (
  titleId int references BookTitle(titleId),
  authorId int references Author(authorId),
  primary key (titleId, authorId)
);

create table BooksPublish (
  bpId int primary key auto_increment,
  titleId int references BookTitle(titleId),
  publishment int,
  publishYear int,
  totalAmount int,
  price decimal(10, 2),
  publisherId int references Publisher(publisherId)
);

create table BookImport (
  importId int primary key auto_increment,
  bpId int references BooksPublish(bpId),
  amount int,
  staffId char(6) references Staff(staffId),
  importDate datetime
);

create table Book (
  bookId int primary key auto_increment,
  importId int references BookImport(importId),
  available bit,
  stateDesc varchar(100) character set utf8mb4
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
  staffId char(6) references Staff(staffId),
  invoiceDate datetime
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