const database = require('./../database/db.js')
const moment = require('moment')
const utils = require('../control/utils.js')
const {EitherM, MaybeM} = require('../control/monads.js')
const {Agg} = require('../database/jsql.js')

const db = database.database

function getReaderData() {
  return EitherM.pure(db.ReaderCard.data.map(d => ({
    cardId: d.cardid,
    rName: d.info.rname,
    cardType: d.readertype,
    issueDate: d.issuedate.format('YYYY-MM-DD'),
    validUntil: d.validuntil.format('YYYY-MM-DD'),
    debt: d.debt
  })))
}

function getBookData() {
  let bookData = db.BookTitle.data.map(d => ({
    titleId: d.titleid,
    bName: d.bname,
    gName: d.genre.gname,
    authors: db.BookAuthor.where(d2 => d2.titleid == d.titleid).data
      .map(v => v.author.aname),
    isbn: d.isbn,
    publishments: db.BooksPublish.where(d2 => d2.titleid == d.titleid).data
      .map(v => ({
        publishment: v.publishment,
        publisher: v.publisher.pname,
        publishYear: v.publishyear,
        imported: v.totalamount,
        price: v.price,
        remaining: db.Book.where(d2 => d2.import.bp.bpid == v.bpid && d2.available)
          .aggregation([Agg.count(), 0, 'remaining']).data[0].remaining,
        canImport: moment().year() - v.publishyear <= db.parameters.validPublishment
      }))
  }))
  return EitherM.pure(bookData)
}

function searchBook(id) {
  let extractions = id.match(/(\d{3})\-?(\d{2})\-?(\d{4})/)
  let titleId = +extractions[1]
  let publishment = +extractions[2]
  let bookId = +extractions[3]

  let book = db.Book.where(d => d.bookid == bookId && d.import.bp.publishment == publishment && d.import.bp.titleid == titleId)

  if (book.isEmpty())
    return MaybeM.error()

  return MaybeM.pure(book.data[0])
}

function searchBookById(id) {
  let maybeBook = searchBook(id)

  return maybeBook.bind(bookData => {
    let data = {
      titleId: bookData.import.bp.title.titleid,
      bName: bookData.import.bp.title.bname,
      gName: bookData.import.bp.title.genre.gname,
    }

    data.authors = db.BookAuthor.where(d => d.titleid == data.titleId).project('author').data.map(v => v.aname).join(', ')

    return MaybeM.pure(data)
  })
}

function fromBorrow(borrow) {
  return {
    borrowId: borrow.borrowid,
    cardId: borrow.cardid,
    rName: borrow.card.info.rname,
    borrowDate: borrow.borrowdate.format('YYYY-MM-DD'),
    dueDate: borrow.duedate.format('YYYY-MM-DD'),
    contents: []
  }
}

function fromReturn(returning) {
  return {
    returnId: returning.returnid,
    cardId: returning.cardid,
    rName: returning.card.info.rname,
    returnDate: returning.returndate.format('YYYY-MM-DD'),
    totalFine: returning.overduefine,
    debtAtTime: returning.debtattime
  }
}

function bookIdFromBook(book) {
  let titleId = ("" + book.import.bp.titleid).padStart(3, 0);
  let publishId = ("" + book.import.bp.publishment).padStart(2, 0)
  let bookId = ("" + book.bookid).padStart(4, 0);
  return titleId + '-' + publishId + "-" + bookId;
}

function fromBook(book) {
  return {
    bookId: bookIdFromBook(book),
    bName: book.import.bp.title.bname
  }
}

function fromBookToBorrow(book) {
  let out = fromBook(book)
  return Object.assign({
    gName: book.import.bp.title.genre.gname,
    authors: db.BookAuthor.where(d => d.titleid == book.import.bp.titleid).map(d => d.author.aname).join(', '),
    returnId: null
  }, out)
}

const fromBookToReturn = book => {
  let out = fromBook(book.book)
  out.borrowDate = book.borrow.borrowdate.format('YYYY-MM-DD')
  out.borrowingDays = book.return.returndate.startOf('day').diff(book.borrow.borrowdate.startOf('day'), 'days')
  out.fine = Math.max(0, book.return.returndate.startOf('day').diff(book.borrow.duedate.startOf('day'), 'days')) * db.parameters.overdueFinePerDay
  if (book.isLost)
    out.fine += 3 * book.book.import.bp.price
  out.note = book.islost ? "Mất sách" : ""
  return out;
}

function getBorrowData() {
  let output = db.Borrowing.map(fromBorrow)
  db.BorrowingContents.groupBy('borrowid').aggregation([Agg.count(), 0, 'amount']).map(d => {
    output.forEach(r => {
      if (r.borrowId == d.borrowid)
        r.amount = d.amount;
    })
  })

  let mapper = {}
  db.BorrowingContents.forEach(book => {
    if (!mapper[book.borrowid])
      mapper[book.borrowid] = []
    mapper[book.borrowid].push(fromBookToBorrow(book.book))
  })


  db.ReturningContents.forEach(ret => {
    mapper[ret.borrowid].forEach(book => {
      let b = book.bookId
      if (+b.substring(b.length-4) == ret.bookid)
        book.returnId = ret.returnid
    })
  })

  output.forEach(out => out.contents = mapper[out.borrowId])
  return EitherM.pure(output)
}

function newBorrow(booksData) {
  let out = fromBorrow(booksData[0].borrow)
  out.contents = booksData.map(book => fromBookToBorrow(book.book))
  out.amount = booksData.length
  return EitherM.pure(out)
}

function getReaderBorrowedBooks(cardId) {
  let card = db.ReaderCard.where(d => d.cardid == cardId).data[0]

  let output = {
    rName: card.info.rname,
    totalDebt: card.debt,
    borrowContents: []
  }

  let borrows = db.BorrowingContents.where((d, fn) => d.borrow.cardid == cardId && fn.notexists(
    db.ReturningContents.where(d2 => d2.borrowid == d.borrowid && d2.bookid == d.bookid)
  )).map(data => {
    let dayPass = moment().startOf('day').diff(data.borrow.borrowdate.startOf('day'), 'days')
    let dayOverdue = moment().startOf('day').diff(data.borrow.duedate.startOf('day'), 'days')
    return {
      bookId: bookIdFromBook(data.book),
      bName: data.book.import.bp.title.bname,
      borrowDate: data.borrow.borrowdate.format('YYYY-MM-DD'),
      borrowingDays: dayPass,
      fine: Math.max(dayOverdue, 0) * db.parameters.overdueFinePerDay
    }
  })

  output.borrowContents = borrows
  return EitherM.pure(output)
}

function newReturn(booksData) {
  let out = fromReturn(booksData[0].return)
  out.contents = booksData.map(fromBookToReturn)
  out.amount = booksData.length
  return EitherM.pure(out)
}

function getReturnData() {
  let output = db.Returning.map(fromReturn)
  db.ReturningContents.groupBy('returnid').aggregation([Agg.count(), 0, 'amount']).map(d => {
    output.forEach(r => {
      if (r.returnId == d.returnid)
        r.amount = d.amount;
    })
  })

  let mapper = {}
  db.ReturningContents.forEach(data => {
    if (!mapper[data.returnid])
      mapper[data.returnid] = []
    mapper[data.returnid].push(fromBookToReturn(data))
  })

  output.forEach(out => out.contents = mapper[out.returnId])
  return EitherM.pure(output)
}

function fromInvoice(data) {
  return {
    invoiceId: data.invoiceid,
    cardId: data.cardid,
    rName: data.card.info.rname,
    invoiceDate: data.invoicedate.format('YYYY-MM-DD'),
    paid: data.paid,
    remaining: data.remaining
  }
}

function getInvoices() {
  return EitherM.pure(db.FineInvoice.map(fromInvoice))
}

function getBookBorrowContext(isbn) {
  if (db.BookTitle.where(d => d.isbn == isbn).isEmpty())
    return EitherM.error("Không tìm thấy sách")
  let output = db.BorrowingContents.where(d => d.book.import.bp.title.isbn == isbn)
    .project('borrow')
    .map(data => ({
      cardId: data.cardid,
      rName: data.card.info.rname,
      borrowId: data.borrowid,
      borrowDate: data.borrowdate.format('YYYY-MM-DD')
    }))

  let mapper = {}
  db.ReturningContents.where(d => d.book.import.bp.title.isbn == isbn).forEach(data => {
    mapper[data.borrowid] = data.returnid;
  })

  output.forEach(v => {
    v.returnId = mapper[v.borrowId]
  })

  return EitherM.pure(output)
}

function getBookId_Status(isbn) {
  if (db.BookTitle.where(d => d.isbn == isbn).isEmpty())
    return EitherM.error("Không tìm thấy sách")
  let status = db.Book.where(d => d.import.bp.title.isbn == isbn)
    .map(d => {
      let bookId = bookIdFromBook(d)
      return {bookId, available: d.available}
    })

  return EitherM.pure(status)
}

module.exports = {
  getReaderData,
  getBookData,
  searchBookById,
  searchBook,
  newBorrow,
  getBorrowData,
  getReaderBorrowedBooks,
  newReturn,
  getReturnData,
  fromInvoice,
  getInvoices,
  getBookBorrowContext,
  getBookId_Status
}