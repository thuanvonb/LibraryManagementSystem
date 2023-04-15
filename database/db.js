const sql = require('mysql2')
const db = require('./database_init.js')

const connection = { host: 'localhost', user: 'user', password: 'password', database: 'se104'}

console.log('new connection')

let con = sql.createConnection(connection)

function connect(importCompleteCb) {
  return new Promise((resolve, reject) => {
    con.connect(err => {
      reject(err)
    })
    db.linkDatabase(con);
    db.importDatabase(importCompleteCb, reject);
    resolve();
  })
}

function insert(tableName, data) {
  return db.insert(tableName, data)
}

const query = q => cb => con.query(q, cb)

exports.database = db;
exports.connect = connect;
exports.insert = insert;
exports.query = query
// exports.adminAuthenticate = adminAuthenticate
// exports.userAuthenticate = userAuthenticate