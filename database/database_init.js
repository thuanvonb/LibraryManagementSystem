const Database = require('./database.js')
const Table = require('./jsql.js').Table

let WebUser = new Table("WebUser", ['userUUID', 'username', 'deleted', 'createDate', 'webName', 'gender', 'email', 'phone', 'dob'])

let Staff = new Table("Staff", ['staffId', 'sName', 'phone', 'employmentDate', 'username', 'permission', 'permissionPreset', 'deleted'])

let CardInfo = new Table("CardInfo", ['infoId', 'rName', 'addr', 'birthday', 'email', 'identityNum'])

let ReaderCard = new Table("ReaderCard", ['cardId', 'infoId', 'readerType', 'issueDate', 'userUUID', 'validUntil', 'debt', 'staffId'])

let Genre = new Table("Genre", ['genreId', 'gName'])
let Author = new Table("Author", ['authorId', 'aName'])
let Publisher = new Table("Publisher", ['publisherId', 'pName'])

let BookTitle = new Table("BookTitle", ['titleId', 'bName', 'genreId', 'isbn'])
let BookAuthor = new Table("BookAuthor", ['titleId', 'authorId'])
let BooksPublish = new Table("BooksPublish", ['bpId', 'titleId', 'publishment', 'publishYear', 'totalAmount', 'price', 'publisherId'])

let BookImport = new Table("BookImport", ['importId', 'bpId', 'amount', 'staffId', 'importDate'])
let Book = new Table("Book", ['bookId', 'importId', 'available', 'stateDesc'])

let Borrowing = new Table("Borrowing", ['borrowId', 'cardId', 'borrowDate', 'dueDate', 'staffId'])
let BorrowingContents = new Table("BorrowingContents", ['borrowId', 'bookId'])

let Returning = new Table("Returning", ['returnId', 'cardId', 'returnDate', 'overdueFine', 'debtAtTime', 'staffId'])
let ReturningContents = new Table("ReturningContents", ['returnId', 'bookId', 'borrowId', 'isLost'])

let FineInvoice = new Table("FineInvoice", ['invoiceId', 'cardId', 'paid', 'remaining', 'staffId', 'invoiceDate'])

let PresetPermission = new Table("PresetPermission", ['presetId', 'permission', 'permissionName'])

WebUser           .addPrimaryKey(['userUUID'])
Staff             .addPrimaryKey(['staffId'])
CardInfo          .addPrimaryKey(['infoId'])
ReaderCard        .addPrimaryKey(['cardId'])
Genre             .addPrimaryKey(['genreId'])
Author            .addPrimaryKey(['authorId'])
Publisher         .addPrimaryKey(['publisherId'])
BookTitle         .addPrimaryKey(['titleId'])
BookAuthor        .addPrimaryKey(['titleId', 'authorId'])
BooksPublish      .addPrimaryKey(['bpId'])
BookImport        .addPrimaryKey(['importId'])
Book              .addPrimaryKey(['bookId'])
Borrowing         .addPrimaryKey(['borrowId'])
BorrowingContents .addPrimaryKey(['borrowId', 'bookId'])
Returning         .addPrimaryKey(['returnId'])
ReturningContents .addPrimaryKey(['returnId', 'bookId'])
FineInvoice       .addPrimaryKey(['invoiceId'])

Staff             .addForeignKey('permissionPreset', PresetPermission, 'presetId', 'preset')
ReaderCard        .addForeignKey('userUUID', WebUser, 'userUUID', 'user')
ReaderCard        .addForeignKey('infoId', CardInfo, 'infoId', 'info')
ReaderCard        .addForeignKey('staffId', Staff, 'staffId', 'staff')
BookTitle         .addForeignKey('genreId', Genre, 'genreId', 'genre')
BookAuthor        .addForeignKey('titleId', BookTitle, 'titleId', 'title')
BookAuthor        .addForeignKey('authorId', Author, 'authorId', 'author')
BooksPublish      .addForeignKey('titleId', BookTitle, 'titleId', 'title')
BooksPublish      .addForeignKey('publisherId', Publisher, 'publisherId', 'publisher')
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



let db = new Database('se104', [WebUser, Staff, CardInfo, ReaderCard, Publisher, Genre, Author, BookTitle, BookAuthor, BooksPublish, BookImport, Book, Borrowing, BorrowingContents, Returning, ReturningContents, FineInvoice, PresetPermission])

module.exports = db