const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const session = require('express-session');
const io = new Server(server);
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
const authRouter = require('./routes/authRouter.js')(db)

const passport = require('passport')

// app.use(passport.initialize()) 
// app.use(passport.session())

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
  secret: 'casio',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.authenticate('session'));

app.use('/', entryRouter)
app.use('/', authRouter)

app.get('/admin', (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login')
    return;
  }
  res.send('hi')
})

app.listen(port);
console.log(`Server is running on 127.0.0.1:${port}`);