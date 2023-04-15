const passport = require('passport');
const LocalStrategy = require('passport-local');
const db = require('./../database/db.js')
const {hashPassword, passwordCompare} = require('./passwordHashing.js')

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
    let q = db.database.Staff.where(d => d.username == username)
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
            permission: adminPermissionExtract(q.data[0].permission),
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
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


module.exports = passport