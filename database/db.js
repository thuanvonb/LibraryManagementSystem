const sql = require('mysql2')
const db = require('./database_init.js')
const moment = require('moment')
const registration = require('../security/registration.js')

const connection = { host: 'localhost', user: 'se104', password: 'admin104', database: 'se104'}

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

function addNewStaff(staffData) {
  let accountData = registration.staffRegistration(staffData)
  return new Promise((resolve, reject) => {
    let newStaff = Object.assign(staffData, accountData)
    let query = `insert into Staff (staffId, sName, phone, employmentDate, username, pwd, salt, permissionPreset, permission) values ("${newStaff.staffId}", "${newStaff.sName}", "${newStaff.phone}", "${newStaff.employmentDate.format()}", "${newStaff.username}", "${newStaff.password}", "${newStaff.salt}", ${newStaff.permissionPreset}, ${newStaff.permission})`

    con.query(query, (err, res) => {
      if (err)
        return reject(err);

      resolve(newStaff)
    })
  }).then(newStaff => {
    db.Staff.insert(newStaff, err => new Promise.reject(err))
    return db.Staff.respond('I')
  })
}

function updateStaffPermission(data) {
  return new Promise((resolve, reject) => {
    let query = 'update Staff set permission = ' + data.permission + ', permissionPreset = ' + data.presetId + ' where staffId = "' + data.staffId + '"';
    
    con.query(query, (err, res) => {
      if (err)
        return reject(err)

      let staff = db.Staff.where(d => d.staffid == data.staffId).first
      staff.permission = data.permission
      staff.permissionpreset = data.presetId

      if (data.presetId == null)
        staff.preset = null;
      else
        staff.preset = db.PresetPermission.where(d => d.presetid == data.presetId).first

      resolve(staff)
    })
  })
}

function updateOnePreset(data) {
  return new Promise((resolve, reject) => {
    let query = `update PresetPermission set permission = ${data.permission} where presetId = ${data.id}`
    con.query(query, (err, res) => {
      if (err)
        return reject(err)

      db.PresetPermission.where(d => d.presetid == data.id).first.permission = data.permission
      resolve(data)
    })
  })
}

function updatePreset(updateData) {
  let tobeUpdated = Array.from(updateData)
  let monad = Promise.resolve(tobeUpdated)

  updateData.forEach(v => {
    monad = monad.then(data => {
      let next = data.pop()
      return updateOnePreset(next)
        .then(v => data)
    })
  })

  return monad.then(u => updateData)
}

function removeStaff(staff) {
  return new Promise((resolve, reject) => {
    let query = `update Staff set deleted = 1 where staffId = ${staff.staffid}`
    con.query(query, (err, res) => {
      if (err)
        return reject(err)

      staff.deleted = 1;
      resolve(staff)
    })
  })
}

function removeBook(title) {
  return new Promise((resolve, reject) => {
    let query = `delete from BookAuthor where titleId = ` + title.titleid
    con.query(query, (err, res) => {
      if (err)
        return reject(err);

      db.BookAuthor.delete(title)
      resolve(title)
    })
  }).then(title => new Promise((resolve, reject) => {
    let query = `delete from BookTitle where titleId = ` + title.titleid
    con.query(query, (err, res) => {
      if (err)
        return reject(err);

      db.BookTitle.delete(title)
      resolve(title)
    })
  }))
}

exports.database = db;
exports.connect = connect;
exports.insert = insert;
exports.query = q => cb => con.query(q, cb);
exports.utilities = {
  updateParameters,
  prolongCard,
  addNewStaff,
  updateStaffPermission,
  updatePreset,
  removeStaff,
  removeBook
}
// exports.adminAuthenticate = adminAuthenticate
// exports.userAuthenticate = userAuthenticate