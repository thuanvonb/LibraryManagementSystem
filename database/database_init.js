const Database = require('./database.js')
const Table = require('./jsql.js').Table

let WebUser = new Table("WebUser", ['userUUID', 'username', 'deleted', 'createDate', 'webName', 'gender', 'email', 'phone', 'dob'])

let Staff = new Table("Staff", ['staffId', 'sName', 'phone', 'employmentDate', 'username', 'permission'])

let CardInfo = new Table("CardInfo", ['infoId', 'rName', 'addr', 'birthday', 'email', 'identityNum'])

let ReaderCard = new Table("ReaderCard", ['cardId', 'infoId', 'readerType', 'issueDate', 'userUUID', 'validUntil', 'debt', 'staffId'])

let Genre = new Table("Genre", ['genreId', 'gName'])
let Author = new Table("Author", ['authorId', 'aName'])
let Publisher = new Table("Publisher", ['publisherId', 'pName'])

let BookTitle = new Table("BookTitle", ['titleId', 'bName', 'genreId', 'authorId', 'publisherId'])
let BooksPublish = new Table("BooksPublish", ['bpId', 'titleId', 'publishment', 'publishYear', 'totalAmount', 'price'])

let BookImport = new Table("BookImport", ['importId', 'bpId', 'amount', 'staffId', 'importDate'])
let Book = new Table("Book", ['bookId', 'importId', 'available', 'stateDesc'])

let Borrowing = new Table("Borrowing", ['borrowId', 'cardId', 'borrowDate', 'dueDate', 'staffId'])
let BorrowingContents = new Table("BorrowingContents", ['borrowId', 'bookId'])

let Returning = new Table("Returning", ['returnId', 'cardId', 'returnDate', 'overdueFine', 'staffId'])
let ReturningContents = new Table("ReturningContents", ['returnId', 'bookId', 'borrowId', 'isLost'])

let FineInvoice = new Table("FineInvoice", ['invoiceId', 'cardId', 'paid', 'staffId'])

WebUser           .addPrimaryKey(['userUUID'])
Staff             .addPrimaryKey(['staffId'])
CardInfo          .addPrimaryKey(['infoId'])
ReaderCard        .addPrimaryKey(['cardId'])
Genre             .addPrimaryKey(['genreId'])
Author            .addPrimaryKey(['authorId'])
Publisher         .addPrimaryKey(['publisherId'])
BookTitle         .addPrimaryKey(['titleId'])
BooksPublish      .addPrimaryKey(['bpId'])
BookImport        .addPrimaryKey(['importId'])
Book              .addPrimaryKey(['bookId'])
Borrowing         .addPrimaryKey(['borrowId'])
BorrowingContents .addPrimaryKey(['borrowId', 'bookId'])
Returning         .addPrimaryKey(['returnId'])
ReturningContents .addPrimaryKey(['returnId', 'bookId'])
FineInvoice       .addPrimaryKey(['invoiceId'])

ReaderCard        .addForeignKey('userUUID', WebUser, 'userUUID', 'user')
ReaderCard        .addForeignKey('infoId', CardInfo, 'infoId', 'info')
ReaderCard        .addForeignKey('staffId', Staff, 'staffId', 'staff')
BookTitle         .addForeignKey('genreId', Genre, 'genreId', 'genre')
BookTitle         .addForeignKey('authorId', Author, 'authorId', 'author')
BookTitle         .addForeignKey('publisherId', Publisher, 'publisherId', 'publisher')
BooksPublish      .addForeignKey('titleId', BookTitle, 'titleId', 'title')
BookImport        .addForeignKey('bpId', BooksPublish, 'bpId', 'bp')
BookImport        .addForeignKey('staffId', Staff, 'staffId', 'staff')
Book              .addForeignKey('importId', BookImport, 'importId', 'import')
Borrowing         .addForeignKey('cardId', ReaderCard, 'cardId', 'card')
Borrowing         .addForeignKey('staffId', Staff, 'staffId', 'staff')
BorrowingContents .addForeignKey('bookId', Book, 'bookId', 'book')
BorrowingContents .addForeignKey('borrowId', Borrowing, 'borrowId', 'borrow')
Returning         .addForeignKey('cardId', ReaderCard, 'cardId', 'card')
Returning         .addForeignKey('staffId', Staff, 'staffId', 'staff')
ReturningContents .addForeignKey('bookId', Book, 'bookId', 'book')
ReturningContents .addForeignKey('returnId', Returning, 'returnId', 'return')
ReturningContents .addForeignKey('borrowId', Borrowing, 'borrowId', 'borrow')
FineInvoice       .addForeignKey('cardId', ReaderCard, 'cardId', 'card')
FineInvoice       .addForeignKey('staffId', Staff, 'staffId', 'staff')

CardInfo          .autoPrimary()
Author            .autoPrimary()
Publisher         .autoPrimary()
Genre             .autoPrimary()
BookTitle         .autoPrimary()
BooksPublish      .autoPrimary()
BookImport        .autoPrimary()
Book              .autoPrimary()
Borrowing         .autoPrimary()
Returning         .autoPrimary()
FineInvoice       .autoPrimary()



let db = new Database('se104', [WebUser, Staff, CardInfo, ReaderCard, Publisher, Genre, Author, BookTitle, BooksPublish, BookImport, Book, Borrowing, BorrowingContents, Returning, ReturningContents, FineInvoice])

module.exports = db