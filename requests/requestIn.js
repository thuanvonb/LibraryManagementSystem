const database = require('./../database/db.js')
const moment = require('moment')
const utils = require('../control/utils.js')
const {EitherM} = require('../control/monads.js')

const dayDiff = date1 => date2 => moment.duration(date1.diff(date2))

const db = database.database

// monadic
function createNewReader(readerInfo) {
  let valid = utils.between(db.parameters.minAge)(db.parameters.maxAge)

  let outData = Object.assign({}, readerInfo);
  outData.birthday = moment(outData.birthday)

  let validity = valid(dayDiff(moment())(outData.birthday).years())

  if (validity == -1)
    return EitherM.error("Underage reader")
  if (validity == 1)
    return EitherM.error("Overage reader")

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

function importNewBook(imInfo) {
  return new Promise((resolve, reject) => {
    if (db.BookTitle.where(d => d.bname == imInfo.bname).isEmpty())
      return reject ("Book does not exist")
    if (db.Author.where(d => d.aname == imInfo.aname).isEmpty()) 
      return reject("Author does not exist")
    if (db.Genre.where(g => g.gname == imInfo.gname).isEmpty())
      return reject("Genre does not exist")
    const validP = db.parameters.validPublishment 
    if (fromNow(imInfo.publishYear).year() > validP) 
      return reject("Publishment is no longer valid")
    let outData = Object.assign({}, imInfo)

    return resolve(outData)
  })
}

function addBookTitle(btInfo) {
  return new Promise((resolve, reject) => {
    let outData = Object.assign({}, btInfo)
    outData.genreid = db.Genre.where(d => d.gname == btInfo.gname).data[0].genreid
    outData.authorid = db.Author.where(d => d.aname == btInfo.aname).data[0].authorid
    outData.publisherid = db.Publisher.where(d => d.pname == btInfo.pname).data[0].publisherid
    return resolve(outData)
  })
}

function addBooksPulish(bpInfo) {
  return new Promise((resolve, reject) => {
    let outData = Object.assign({}, bpInfo)
    outData.titleid = db.BookTitle.where(d => d.bname == bpInfo.bname).data[0].titleid
    return resolve(outData)
  })
}

exports.createNewReader = createNewReader
exports.issueNewCard = issueNewCard