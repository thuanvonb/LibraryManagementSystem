const hashPassword = require('../security/passwordHashing.js').hashPassword

let pass = process.argv[2]
if (pass == undefined) {
  console.error("Require one more argument. Format: `node gimmePwd.js <password>`")
  process.exit(1)
}

if (pass.length < 8) {
  console.error("Your password need to be at least 8-character long")
  process.exit(1)
}


console.log(hashPassword(pass))