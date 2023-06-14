const {hashPassword, createSalt} = require('./passwordHashing.js')
const moment = require('moment')
const uuid = require('uuid')
const {normalize} = require('../control/utils.js')

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

function staffRegistration(staffData) {
  let name = normalize(staffData.sName).replace(/đ/g, 'd').split(' ')
  let username = name.slice(-1)[0].toLowerCase()
  username += name.slice(0, -1).map(v => v.charAt(0).toLowerCase()).join('')
  username += staffData.phone.slice(-3)
  let password = hashPassword(staffData.phone)
  let salt = createSalt(12)

  return {username, password, salt}
}

exports.userRegistration = userRegistration
exports.staffRegistration = staffRegistration