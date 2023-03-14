const Database = require('./database.js')
const Table = require('./jsql.js').Table

let WebUser = new Table("WebUser", ['userUUID', 'username', 'deleted', 'createDate', 'webName', 'gender', 'email', 'phone', 'dob'])

let Staff = new Table("Staff", ['staffId', 'sName', 'phone', 'employmentDate', 'username'])

let CardInfo = new Table("CardInfo", ['infoId', 'rName', 'addr', 'birthday', 'email', 'identityNum'])

let ReaderCard = new Table("ReaderCard", ['cardId', 'infoId', 'readerType', 'issueDate', 'userUUID', 'validUntil', 'debt', 'staffId'])

let Genre = new Table("Genre", ['genreId', 'gName'])
let Author = new Table("Author", ['authorId', 'aName'])
let Publisher = new Table("Publisher", ['publisherId', 'pName'])

let Book = new Table("Book", ['bookId', 'publisherId', 'publishYear', 'price', 'totalAmount'])

let BookImport = new Table("BookImport", ['importId', 'bookId', 'amount', 'staffId', 'importDate'])

let BookAuthor = new Table("BookAuthor", ['bookId', 'authorId'])
let BookGenre = new Table("BookGenre", ['bookId', 'genreId'])

let Borrowing = new Table("Borrowing", ['borrowId', 'cardId', 'borrowDate', 'dueDate', 'staffId'])
let BorrowingContents = new Table("BorrowingContents", ['borrowId', 'bookId'])

let Returning = new Table("Returning", ['returnId', 'cardId', 'returnDate', 'overdueFine', 'staffId'])
let ReturningContents = new Table("ReturningContents", ['returnId', 'bookId', 'borrowId', 'isLost'])

let FineInvoice = new Table("FineInvoice", ['invoiceId', 'cardId', 'paid', 'staffId'])

WebUser           .addPrimaryKey(['userUUID'])
Staff             .addPrimaryKey(['staffId'])
CardInfo          .addPrimaryKey(['infoId'])
ReaderCard        .addPrimaryKey(['cardId'])
Publisher         .addPrimaryKey(['publisherId'])
Book              .addPrimaryKey(['bookId'])
BookImport        .addPrimaryKey(['importId'])
Genre             .addPrimaryKey(['genreId'])
Author            .addPrimaryKey(['authorId'])
BookAuthor        .addPrimaryKey(['bookId', 'authorId'])
BookGenre         .addPrimaryKey(['bookId', 'genreId'])
Borrowing         .addPrimaryKey(['borrowId'])
BorrowingContents .addPrimaryKey(['borrowId', 'bookId'])
Returning         .addPrimaryKey(['returnId'])
ReturningContents .addPrimaryKey(['returnId', 'bookId'])
FineInvoice       .addPrimaryKey(['invoiceId'])

ReaderCard        .addForeignKey('userUUID', WebUser, 'userUUID', 'user')
ReaderCard        .addForeignKey('infoId', CardInfo, 'infoId', 'info')
ReaderCard        .addForeignKey('staffId', Staff, 'staffId', 'staff')
Book              .addForeignKey('publisherId', Publisher, 'publisherId', 'publisher')
BookImport        .addForeignKey('bookId', Book, 'bookId', 'book')
BookAuthor        .addForeignKey('bookId', Book, 'bookId', 'book')
BookAuthor        .addForeignKey('authorId', Author, 'authorId', 'author')
BookGenre         .addForeignKey('bookId', Book, 'bookId', 'book')
BookGenre         .addForeignKey('genreId', Genre, 'genreId', 'genre')
Borrowing         .addForeignKey('cardId', ReaderCard, 'cardId', 'card')
Borrowing         .addForeignKey('staffId', Staff, 'staffId', 'staff')
BorrowingContents .addForeignKey('bookId', Book, 'bookId', 'book')
BorrowingContents .addForeignKey('borrowId', Borrowing, 'borrowId', 'borrow')
Returning         .addForeignKey('cardId', ReaderCard, 'cardId', 'card')
Returning         .addForeignKey('staffId', Staff, 'staffId', 'staff')
ReturningContents .addForeignKey('bookId', Book, 'bookId', 'book')
ReturningContents .addForeignKey('returnId', Returning, 'returnId', 'return')
FineInvoice       .addForeignKey('cardId', ReaderCard, 'cardId', 'card')
FineInvoice       .addForeignKey('staffId', Staff, 'staffId', 'staff')


let db = new Database('se104', [WebUser, Staff, CardInfo, ReaderCard, Publisher, Genre, Author, Book, BookImport, BookAuthor, BookGenre, Borrowing, BorrowingContents, Returning, ReturningContents, FineInvoice])

module.exports = db