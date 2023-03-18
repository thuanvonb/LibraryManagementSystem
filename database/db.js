const sql = require('mysql2')
const {hashPassword, passwordCompare} = require('../security/passwordHashing.js')
const db = require('./database_init.js')

const connection = { host: 'localhost', user: 'username', password: 'password', database: 'se104'}

let con = sql.createConnection(connection)

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

exports.connect = connect;
exports.adminAuthenticate = adminAuthenticate