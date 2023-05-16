const sql = require('mysql2')
const db = require('./database_init.js')
const moment = require('moment')

const connection = { host: 'localhost', user: 'root', password: 'sangdoan', database: 'se104'}

// console.log('new connection')

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

function updateParameters(params) {
  return new Promise((resolve, reject) => {
    let setQuery = []
    for (let key in params)
      setQuery.push(key + " = " + params[key])

    // console.log('update Parameters set ' + setQuery.join(', '))

    con.query('update Parameters set ' + setQuery.join(', '), (err, res) => {
      if (err)
        return reject(err);
      for (let key in params)
        db.parameters[key] = params[key]
      resolve(db.parameters)
    })
  })
}

function prolongCard(cardId) {
  return new Promise((resolve, reject) => {
    let until = moment().add(db.parameters.cardValidDuration, 'days')
    let query = `update readercard set validUntil = "${until.format()}" where cardId = "${cardId}"`

    con.query(query, (err, res) => {
      if (err)
        return reject(err);

      let data = db.ReaderCard.where(d => d.cardid == cardId).data[0]
      data.validuntil = until
      resolve(data)
    })
  })
}

const query = q => cb => con.query(q, cb)

exports.database = db;
exports.connect = connect;
exports.insert = insert;
exports.query = query;
exports.updateParameters = updateParameters
exports.prolongCard = prolongCard
// exports.adminAuthenticate = adminAuthenticate
// exports.userAuthenticate = userAuthenticate