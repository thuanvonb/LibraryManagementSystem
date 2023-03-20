const moment = require('moment')
const sql = require('mysql2')
const {hashPassword, passwordCompare} = require('../security/passwordHashing.js')
const db = require('./database_init.js')

const connection = { host: 'localhost', user: 'root', password: 'sangdoan', database: 'se104'}

let con = sql.createConnection(connection)

const dayDiff = date1 => date2 => moment.duration(date1.diff(date2))
const fromNow = dayDiff(moment())

function connect() {
  return new Promise((resolve, reject) => {
    con.connect(err => {
      reject(err)
    })
    db.linkDatabase(con);
    db.importDatabase(reject);
    resolve()
  })
}

function adminPermissionExtract(p) {
  let full = (p >> 4) % 2
  return {
    services: (p % 2) | full,
    libControl: ((p >> 1) % 2) | full,
    report: ((p >> 2) % 2) | full,
    staffControl: ((p >> 3) % 2) | full
  }
}

function userAuthenticate(username, password, errCb) {

}

function adminAuthenticate(username, password) {
  return new Promise((resolve, reject) => {
    let q = db.Staff.where(d => d.username == username)
    if (q.isEmpty())
      return reject("Incorrect username or password")
    con.query('select pwd from Staff where staffId = \'' + q.data[0].staffid + "'", (err, res) => {
      if (err)
        return reject(err);
      
      if (!passwordCompare(password, res[0].pwd))
        return reject("Incorrect username or password");
      resolve({
        msg: "Authentication succeeded", 
        data: {
          staffId: q.data[0].staffid,
          sName: q.data[0].sname,
          permission: adminPermissionExtract(q.data[0].permission),
          isAdmin: true
        }
      });
    })
  })
}

/*
  - Check readerType when user inputs
  - This function only checks age
*/
function issueNewCard(userInfo) {
  return new Promise((resolve, reject) => {
    const minAge = db.parameters.minAge
    const maxAge = db.parameters.maxAge
    const cardVD = db.parameters.cardValidDuration
    const issueDate = moment()
    const age = moment.duration(issueDate.diff(userInfo))
    if (age <= maxAge && age >= minAge) {
      const endDate = moment().add(cardVD, "days")
      let outData = Object.assign({}, userInfo)
      outData.endDate = endDate
      outData.issueDate = issueDate
      outData.debt = 0
      return resolve(outData)
    }

    if (age > maxAge) 
      return reject("Overage")
    return reject("Underage")
  })
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

function addBookTitle(btInfo)
{
  return new Promise((resolve, reject) => {
    let outData = Object.assign({}, btInfo)
    outData.genreid = db.Genre.where(d => d.gname == btInfo.gname).data[0].genreid
    outData.authorid = db.Author.where(d => d.aname == btInfo.aname).data[0].authorid
    outData.publisherid = db.Publisher.where(d => d.pname == btInfo.pname).data[0].publisherid
    return resolve(outData)
  })
}

function addBooksPulish(bpInfo)
{
  return new Promise((resolve, reject) => {
    let outData = Object.assign({}, bpInfo)
    outData.titleid = db.BookTitle.where(d => d.bname == bpInfo.bname).data[0].titleid
    return resolve(outData)
  })
}



exports.connect = connect;
exports.adminAuthenticate = adminAuthenticate