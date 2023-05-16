const database = require('./../database/db.js')
const moment = require('moment')
const utils = require('../control/utils.js')
const {EitherM} = require('../control/monads.js')
const {Agg} = require('../database/jsql.js')

const dayDiff = date1 => date2 => moment.duration(date1.diff(date2))

const db = database.database

// monadic
function createNewReader(readerInfo) {
  if (db.ReaderCard.where(d => d.validuntil.diff(moment()) > 0 && d.info.identitynum == readerInfo.identityNum).isNotEmpty())
    return EitherM.error("Số CCCD đã có người đăng ký")

  let valid = utils.between(db.parameters.minAge)(db.parameters.maxAge)

  let outData = Object.assign({}, readerInfo);
  outData.birthday = moment(outData.birthday)

  let validity = valid(dayDiff(moment())(outData.birthday).years())

  if (validity == -1)
    return EitherM.error("Người đọc không đủ tuổi để đăng ký")
  if (validity == 1)
    return EitherM.error("Người đọc quá tuổi để đăng ký")

  return EitherM.pure(outData)
}

function issueNewCard(userInfo, infoId) {
  let out = Object.assign({}, userInfo);
  out.infoId = infoId;
  out.issueDate = moment();
  out.validUntil = moment().add(db.parameters.cardValidDuration, 'days')
  out.debt = 0;
  return EitherM.pure(out);
}

function createNewAuthor(authorName) {
  return EitherM.pure({aName: authorName})
}
function createNewPublisher(publisherName) {
  return EitherM.pure({pName: publisherName})
}
function createNewGenre(genreName) {
  return EitherM.pure({gName: genreName})
}
function createNewBook(bookInfo) {
  return EitherM.pure(Object.assign({}, bookInfo))
}

function createNewPublishment(publishmentInfo) {
  let out = Object.assign({}, publishmentInfo)
  out['totalAmount'] = 0
  return EitherM.pure(out)
}

function createNewImport(importInfo, staffId) {
  let publishment = db.BooksPublish.where(d => d.publishment == importInfo.publishment && d.titleid == importInfo.titleId)

  if (publishment.isEmpty())
    return EitherM.error("Không tìm thấy đợt xuất bản")

  let publishData = publishment.data[0]
  if (moment().year() - publishData.publishyear > db.parameters.validPublishment)
    return EitherM.error('Sách quá cũ để nhập')

  let out = {
    amount: importInfo.amount,
    bpId: publishData.bpid,
    staffId: staffId,
    importDate: moment()
  }
  return EitherM.pure(out)
}

function createBooks(importData) {
  let books = new Array(importData.amount).fill(0).map(v => ({
    importId: importData.importid,
    available: 1,
    stateDesc: "Bình thường"
  }))
  return EitherM.pure(books)
}

function newBorrow(cardId, staffId) {
  return EitherM.pure({
    cardId: cardId,
    staffId: staffId,
    borrowDate: moment(),
    dueDate: moment().add(db.parameters.maxDayBorrow, 'days')
  })
}

function newBorrowBooks(borrowId, books) {
  return EitherM.pure(books.map(bookId => ({
    bookId: bookId,
    borrowId: borrowId
  })))
}

module.exports = {
  createNewReader,
  issueNewCard,
  createNewAuthor,
  createNewPublisher,
  createNewGenre, 
  createNewImport,
  createNewPublishment,
  createNewBook,
  createBooks,
  newBorrow,
  newBorrowBooks
}