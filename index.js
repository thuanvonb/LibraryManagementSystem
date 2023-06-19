const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const session = require('express-session');
const io = new Server(server);
const adminServices = require('./socket_services/admin_services.js')

const port = 7000

const db = require('./database/db.js')
db.connect().then(
  () => console.log('database\'s connected'),
  err => {
    console.error('cannot connect to database')
    console.error(err);
    process.exit(1)
  }
)


const entryRouter = require('./routes/entryRouter.js')
const authRouter = require('./routes/authRouter.js')
const adminServiceRouter = require('./routes/admin-servicesR.js')
const userServiceRouter = require('./routes/user-servicesR.js')

const passport = require('passport')

// app.use(passport.initialize()) 
// app.use(passport.session())

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

let sessionMdw = session({
  // name: 'libmanager',
  secret: 'casio',
  resave: false,
  saveUninitialized: false
})

const adminNamespace = io.of('/admin')

adminNamespace.use((socket, next) => sessionMdw(socket.request, socket.request.res || {}, next))

adminNamespace.on('connection', socket => {
  if (!socket.request.session.passport) {
    socket.emit('redirect', '/admin_Iogin_4365')
    socket.disconnect();
    return;
  }
  // console.log(socket.request.session.passport.user)

  adminServices(socket);
})

app.use(sessionMdw)
app.use(passport.authenticate('session'));

app.use('/', entryRouter)
app.use('/', authRouter)
app.use('/', adminServiceRouter)
app.use('/', userServiceRouter)

server.listen(port, () => {
  console.log(`Server is running on 127.0.0.1:${port}`);
});