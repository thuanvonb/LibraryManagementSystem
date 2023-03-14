const sql = require('mysql2')
const {hashPassword, passwordCompare} = require('../security/passwordHashing.js')
const db = require('./database_init.js')

const connection = { host: 'localhost', user: 'se104', password: 'admin104', database: 'se104'}

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

function userAuthenticate(username, password, errCb) {

}

function adminAuthenticate(username, password) {
  return new Promise((resolve, reject) => {
    let q = db.Staff.where(d => d.username == username)
    if (q.isEmpty())
      return reject("Incorrect username")
    con.query('select pwd from Staff where staffId = \'' + q.data[0].staffid + "'", (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      if (!passwordCompare(password, res[0].pwd))
        return reject("Incorrect username or password");
      resolve({
        msg: "Authentication succeeded", 
        data: {
          staffId: q.data[0].staffid,
          sName: q.data[0].sname
        }
      });
    })
  })
}

exports.connect = connect;
exports.adminAuthenticate = adminAuthenticate