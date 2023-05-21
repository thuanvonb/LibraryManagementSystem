let users = []
let sockets = []

function findUserById(id, cb) {
  if (users[id])
    cb(null, users[id])
  else
    cb("Unknown user", false)
}

function findUserById_Sync(id) {
  return users[id]
}

function findSocketById(id) {
  return sockets[id]
}

function addUser(instance, id) {
  users[id] = instance
}

function addUserSocket(socket) {
  sockets[socket.request.session.passport.user] = socket
}

const socketUser = socket => findUserById_Sync(socket.request.session.passport.user)

module.exports = {
  findUserById,
  addUser,
  socketUser,
  addUserSocket,
  findSocketById
}