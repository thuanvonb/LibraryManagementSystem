const database = require('./../database/db.js')
const moment = require('moment')
const utils = require('../control/utils.js')
const {EitherM} = require('../control/monads.js')
const {Agg} = require('../database/jsql.js')

const dayDiff = date1 => date2 => moment.duration(date1.diff(date2))

const db = database.database

function verifyNumberOfBorrowing(cardId, bookIds) {
  let borrowingBooks = db.BorrowingContents.where((bc, fn) => bc.borrow.cardid == cardId && 
    fn.notexists(
      db.ReturningContents.where(rc => 
        rc.borrowid == bc.borrowid && rc.bookid == bc.bookid)
    )
  ).aggregation([Agg.count(), 0, 'borrowingBooks']).data[0].borrowingBooks

  if (bookIds.length + borrowingBooks > db.parameters.maxBorrow) {
    let exceeded = bookIds.length + borrowingBooks - db.parameters.maxBorrow
    return exceeded
  }
  return 0
}

function verifyDuplicateBorrowing(cardId, bookIds) {
  return db.BorrowingContents.where((bc, fn) => bc.borrow.cardid == cardId &&
    bookIds.includes(bc.bookid) && fn.notexists(
      db.ReturningContents.where(rc => 
        rc.borrowid == bc.borrowid && rc.bookid == bc.bookid)
    )
  ).isEmpty() && 
    db.Book.where(d => bookIds.includes(d.bookid))
      .project('import').project('bp').project('title')
      .select('titleid')
      .distinct()
      .aggregation([Agg.count(), 0, 'distinctBooks']).data[0].distinctBooks == bookIds.length
}

function verifyOverdueBook(cardId) {
  return db.BorrowingContents.where((bc, fn) => bc.borrow.cardid == cardId &&
    fn.notexists(
      db.ReturningContents.where(rc => 
        rc.borrowid == bc.borrowid && rc.bookid == bc.bookid)
    ) && bc.borrow.duedate.diff(moment()) < 0
  ).isEmpty()
}

function verifyAvailability(bookIds) {
  return db.Book.where(d => bookIds.includes(d.bookid) && d.available == 0).isEmpty()
}

function verifyISBN(isbn) {
  let regex = /^(?:ISBN(?:-13)?:? )?(?=[0-9]{13}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)97[89][- ]?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9]$/;

  if (!regex.test(isbn))
    return null;

  let outputISBN = isbn.replace(/[- ]|^ISBN(?:-1[03])?:?/g, "");
  let chars = outputISBN.split("")
  let last = chars.pop();
  let sum = 0;

  // Compute the ISBN-13 check digit
  for (let i = 0; i < chars.length; i++)
    sum += (i % 2 * 2 + 1) * parseInt(chars[i], 10);

  let check = 10 - (sum % 10);
  if (check == 10)
    check = "0";

  if (check == last)
    return outputISBN

  return null;
}

module.exports = {
  verifyISBN,
  verifyNumberOfBorrowing,
  verifyDuplicateBorrowing,
  verifyOverdueBook,
  verifyAvailability
}