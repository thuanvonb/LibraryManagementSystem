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
    validUntil: d.validuntil.format('YYYY-MM-DD')
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

function bookId(book) {
  let titleId = ("" + book.import.bp.titleid).padStart(3, 0);
  let publishId = ("" + book.import.bp.publishment).padStart(2, 0)
  let bookId = ("" + book.bookid).padStart(4, 0);
  return titleId + '-' + publishId + "-" + bookId;
}

function fromBook(book) {
  return {
    bookId: bookId(book),
    bName: book.import.bp.title.bname,
    gName: book.import.bp.title.genre.gname,
    authors: db.BookAuthor.where(d => d.titleid == book.import.bp.titleid).map(d => d.author.aname).join(', '),
    returnId: null
  }
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
    mapper[book.borrowid].push(fromBook(book.book))
  })

  db.ReturningContents.forEach(ret => {
    mapper[ret.borrowid].forEach(book => {
      if (book.bookId == ret.bookid)
        book.returnId = ret.returnid
    })
  })

  output.forEach(out => out.contents = mapper[out.borrowId])
  return EitherM.pure(output)
}

function newBorrow(booksData) {
  let out = fromBorrow(booksData[0].borrow)
  out.contents = booksData.map(book => fromBook(book.book))
  out.amount = booksData.length
  return EitherM.pure(out)
}

module.exports = {
  getReaderData,
  getBookData,
  searchBookById,
  searchBook,
  newBorrow,
  getBorrowData
}