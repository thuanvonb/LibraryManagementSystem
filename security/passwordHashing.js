const SHA256 = require("crypto-js/sha256");
const crypto = require("crypto")

const createSalt = n => [...crypto.randomBytes(n)].map(x => x.toString(16).padStart(2, '0')).join('')

function magicNumber(str) {
  let t = [...Buffer.from(str)].map(t => Math.cos(t)).reduce((a, b) => a + b, 0)
  let u = Math.abs(t)
  return Math.round(1000000*(u - Math.floor(u)))
}

function hashPassword(password, salt=undefined) {
  if (salt == undefined)
    salt = createSalt(12)
  let mg = magicNumber(password)
  let idx = mg % (password.length - 3) + 3
  let hashed = SHA256(password.slice(0, idx) + salt + password.slice(idx)).toString()
  return hashed.slice(0, mg % 64) + salt + hashed.slice(mg % 64)
}

function passwordCompare(password, hashed) {
  let mg = magicNumber(password)
  let saltLen = hashed.length - 64
  let salt = hashed.slice(mg % 64, mg % 64 + saltLen)
  return hashed == hashPassword(password, salt)
}


exports.hashPassword = hashPassword
exports.passwordCompare = passwordCompare