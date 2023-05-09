const database = require('./../database/db.js')
const moment = require('moment')
const utils = require('../control/utils.js')
const {EitherM} = require('../control/monads.js')
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

exports.getReaderData = getReaderData
exports.getBookData = getBookData