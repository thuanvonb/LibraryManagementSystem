const database = require('./../database/db.js')
const moment = require('moment')
const utils = require('../control/utils.js')
const {EitherM} = require('../control/monads.js')

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

function createNewImport(importInfo) {
  let out = Object.assign({}, importInfo)
  let currentYear = moment().year()
  let publishYear = db.BooksPublish.where(d => d.bpid == importInfo.bpId).data[0].publishyear
  if (currentYear - publishYear > db.parameters.validPublishment)
    return EitherM.error("Sách quá cũ để nhập")

  out.importDate = moment()
  return EitherM.pure(out)
}

function createBooks(importData) {
  // console.log(importData.amount)
  let books = new Array(importData.amount).fill(0).map(v => ({
    importId: importData.importid,
    available: 1,
    stateDesc: "Bình thường"
  }))
  // console.log(new Array(importData.amount))
  // console.log(new Array(importData.amount).fill(0))
  // console.log(new Array(importData.amount).fill(0).map(v => ({
  //   importId: importData.importid,
  //   available: 1,
  //   stateDesc: "Bình thường"
  // })))
  return EitherM.pure(books)
}

exports.createNewReader = createNewReader
exports.issueNewCard = issueNewCard
exports.createNewAuthor = createNewAuthor
exports.createNewPublisher = createNewPublisher
exports.createNewGenre = createNewGenre
exports.createNewBook = createNewBook
exports.createNewImport = createNewImport
exports.createNewPublishment = createNewPublishment
exports.createBooks = createBooks