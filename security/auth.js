const passport = require('passport');
const LocalStrategy = require('passport-local');

let database;

passport.use('admin_local', new LocalStrategy(function (username, password, cb) {
  database.adminAuthenticate(username, password).then(
    out => {
      console.log(out.msg);
      return cb(null, out.data)
    },
    err => cb(null, false, {msg: err})
  )
}))

passport.use('user_local', new LocalStrategy(function (username, password, cb) {

}))

passport.serializeUser(function(user, done) {
  console.log(user)
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


module.exports = function (db) {
  database = db;
  return passport
}