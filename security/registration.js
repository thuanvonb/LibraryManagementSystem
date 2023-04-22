const {hashPassword, createSalt} = require('./passwordHashing.js')
const moment = require('moment')
const uuid = require('uuid')

function userRegistration(userForm) {
  let user = Object.assign({}, userForm)
  for (let field in user) {
    if (user[field] == '')
      user[field] = null
  }
  if (user.dob != null)
    user.dob = moment(user.dob)

  user.createDate = moment()
  user.deleted = 0
  user.userUUID = uuid.v4()
  userPwd = {}
  userPwd.pwd = hashPassword(user.pwd)
  userPwd.salt = createSalt(12)

  return [user, userPwd]
}

exports.userRegistration = userRegistration