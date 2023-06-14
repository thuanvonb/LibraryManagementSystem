const passport = require('passport');
const LocalStrategy = require('passport-local');
const db = require('./../database/db.js')
const {hashPassword, passwordCompare} = require('./passwordHashing.js')
const {starling} = require('../control/combinators.js')
const UserManager = require('./users.js')

function adminPermissionExtract(staffData) {
  let getPData = n => {
    // console.log(staffData, n)
    if (staffData.permission != null)
      return staffData.permission
    return staffData.preset.permission
  }

  let bitAt = t => n => (n >> t) % 2;

  let getPermission = n => {
    let p = getPData(n)
    return bitAt(n)(p)
  }

  let full = () => getPermission(0)
  return {
    get fullControl() {return full()},
    get services() {return full() || getPermission(1)},
    get libControl() {return full() || getPermission(2)},
    get report() {return full() || getPermission(3)},
    get staffControl() {return full() || getPermission(4)}
  }
}

function userAuthenticate(username, password, errCb) {
  return new Promise((resolve, reject) => {
    let q = db.database.WebUser.where(d => d.username == username)
    if (q.isEmpty())
      return reject("Incorrect username or password")
    db.query('select pwd from WebUser where userUUID = \'' + q.data[0].useruuid + "'")
      ((err, res) => {
        if (err)
          return reject(err);
        
        if (!passwordCompare(password, res[0].pwd))
          return reject("Incorrect username or password");
        resolve({
          msg: "Authentication succeeded", 
          data: {
            userUUID: q.data[0].useruuid,
            username: q.data[0].username,
            isAdmin: false
          }
        });
      })
  })
}

function adminAuthenticate(username, password) {
  return new Promise((resolve, reject) => {
    let q = db.database.Staff.where(d => d.username == username && d.deleted == 0)
    if (q.isEmpty())
      return reject("Incorrect username or password")
    db.query('select pwd from Staff where staffId = \'' + q.data[0].staffid + "'")
      ((err, res) => {
        if (err)
          return reject(err);
        
        if (!passwordCompare(password, res[0].pwd))
          return reject("Incorrect username or password");
        resolve({
          msg: "Authentication succeeded", 
          data: {
            staffId: q.data[0].staffid,
            sName: q.data[0].sname,
            permission: adminPermissionExtract(q.data[0]),
            isAdmin: true
          }
        });
      })
  })
}

passport.use('admin_local', new LocalStrategy(function (username, password, cb) {
  adminAuthenticate(username, password).then(
    out => {
      console.log(out.msg);
      return cb(null, out.data)
    },
    err => cb(null, false, {msg: err})
  )
}))

passport.use('user_local', new LocalStrategy(function (username, password, cb) {
  userAuthenticate(username, password).then(
    out => {
      console.log(out.msg);
      return cb(null, out.data)
    },
    err => cb(null, false, {msg: err})
  )
}))

passport.serializeUser(function(user, done) {
  console.log(user)
  UserManager.addUser(user, user.staffId)
  done(null, user.staffId);
});

passport.deserializeUser(function(id, done) {
  UserManager.findUserById(id, (err, user) => {
    done(err, user);
  })
});


module.exports = passport