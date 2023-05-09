const db = require('../database/db.js')
const requestInput = require('../requests/requestIn.js')
const requestOutput = require('../requests/requestOut.js')
const {encodeToCode128, socketUser} = require('../control/utils.js')
const csr_support = require('./csr.js')
const {EitherM} = require('../control/monads.js')
const moment = require('moment')

function getNewCardId() {
  while (true) {
    let t = Math.floor(Math.random()*100000000).toString().padStart(8, '0');
    if (db.database.ReaderCard.where(d => d.cardid == t).isEmpty())
      return t;
  }
}

const sk_getNewCard = socket => data => {
  let id = getNewCardId()
  let idBar = encodeToCode128(id)
  socket.emit('cardId', {id, idBar})
}

const sk_issueCard = socket => data => {
  let user = socketUser(socket)
  if (!user.permission.services)
    return socket.emit('issueCard_rejected', "No permission")

  if (data.reader.oldId) {

  } else {
    requestInput.createNewReader(data.reader).then(readerData => {
      return db.insert("CardInfo", readerData)
    }).then(readerData => {
      return requestInput.issueNewCard(data.card, readerData.infoid)
    }).then(data => {
      data.staffId = user.staffId;
      return db.insert("ReaderCard", data)
    }).then(data => {
      // console.log(data)
      socket.emit('issueCard_accepted', {
        cardId: data.cardid,
        rName: data.info.rname,
        cardType: data.readertype,
        issueDate: data.issuedate.format('YYYY-MM-DD'),
        validUntil: data.validuntil.format('YYYY-MM-DD')
      })
    }).catch(err => socket.emit('issueCard_rejected', err))
  }
}

const sk_getReaderData = socket => data => {
  if (!socketUser(socket).permission.services)
    return socket.emit('getReaderData_rejected', "No permission")

  // console.log(db.database.ReaderCard.data)

  requestOutput.getReaderData()
    .then(dataOut => socket.emit('getReaderData_accepted', dataOut),
      error => {
        console.log(error)
        socket.emit('getReaderData_rejected', error)
      })
}

const sk_getParams = socket => data => {
  if (!socketUser(socket).permission.libControl)
    return socket.emit('getParams_rejected', 'No permission')

  socket.emit('getParams_accepted', db.database.parameters)
}

const sk_updateParams = socket => data => {
  if (!socketUser(socket).permission.libControl)
    return socket.emit('updateParams_rejected', 'No permission')

  db.updateParameters(data).then(result => {
    socket.emit('updateParams_accepted', result)
  }).catch(err => {
    socket.emit('updateParams_rejected', err)
  })
}

const addIfNE = context => data => {
  let dat = db.database[context.table].where(d => d[context.attr] == context.test(data))
  if (dat.isNotEmpty())
    return EitherM.pure(dat.data[0])
  return context.prepareFunc(data).then(newData => db.insert(context.table, newData))
}

const sk_addTitle = socket => data => {
  if (!socketUser(socket).permission.libControl)
    return socket.emit('importBook_rejected', 'No permission')

  console.log(data)
  let startMonad = EitherM.pure(0);
  const addToAuthor = addIfNE({
    table: 'Author',
    attr: 'aname',
    prepareFunc: requestInput.createNewAuthor,
    test: data => data
  })
  const addToGenre = addIfNE({
    table: 'Genre',
    attr: 'gname',
    prepareFunc: requestInput.createNewGenre,
    test: data => data
  })

  if (db.database.BookTitle.where(d => d.isbn == data.isbn).isNotEmpty())
    return socket.emit('addTitle_rejected', 'Sách đã được thêm trước đó.')

  data.authors.reduce((currMonad, author) => currMonad.then(d => addToAuthor(author)), startMonad)
    .then(d => addToGenre(data.gName))
    .then(d => requestInput.createNewBook({
      bName: data.bName,
      genreId: db.database.Genre.where(d => d.gname == data.gName).data[0].genreid,
      isbn: data.isbn
    }))
    .then(newTitle => db.insert('BookTitle', newTitle))
    .then(title => db.insert('BookAuthor', data.authors.map(aName => 
        db.database.Author.where(d => d.aname == aName).data[0].authorid
      ).map(authorId => ({
        titleId: title.titleid,
        authorId: authorId
      }))
    )).then(dat => {
      socket.emit('addTitle_accepted', {
        titleId: dat[0].titleid,
        bName: data.bName,
        gName: data.gName,
        authorNames: data.authors,
        isbn: data.isbn
      })
    }, error => {
      console.log(error)
      socket.emit('addTitle_rejected', error.toString())
    })
}

const sk_getBookData = socket => data => {
  if (!socketUser(socket).permission.libControl)
    return socket.emit('getBookData_rejected', 'No permission')

  requestOutput.getBookData().then(data => socket.emit('getBookData_accepted', data),
    error => {
      console.log(error)
      socket.emit('getBookData_rejected', error.toString())
    })
}

const sk_addPublish = socket => data => {
  if (!socketUser(socket).permission.libControl)
    return socket.emit('addPublish_rejected', 'No permission')

  addIfNE({
    table: 'Publisher',
    attr: 'pname',
    prepareFunc: requestInput.createNewPublisher,
    test: data => data
  })(data.pName)
    .then(publisher => {
      let newPublish = Object.assign({}, data)
      delete newPublish.pName;
      newPublish.publisherId = publisher.publisherid
      return requestInput.createNewPublishment(newPublish)
    })
    .then(publishData => db.insert('BooksPublish', publishData))
    .then(newPublish => {
      socket.emit('addPublish_accepted', {
        publishment: newPublish.publishment,
        publisher: newPublish.publisher.pname,
        publishYear: newPublish.publishyear,
        imported: 0,
        remaining: 0,
        price: newPublish.price,
        canImport: moment().year() - newPublish.publishyear <= db.database.parameters.validPublishment
      })
    }, error => {
      console.log(error)
      socket.emit('addPublish_rejected', error.toString())
    })
}

const sk_importBook = socket => data => {
  if (!socketUser(socket).permission.libControl)
    return socket.emit('importBook_rejected', 'No permission')

  requestInput.createNewImport(data, socketUser(socket).staffId)
    .then(newImport => db.insert('BookImport', newImport))
    .then(importData => {
      db.database.BooksPublish.where(d => d.bpid == importData.bpid).data[0].totalamount += importData.amount;
      return requestInput.createBooks(importData)
    }).then(books => db.insert("Book", books))
    .then(d => socket.emit('importBook_accepted', data), error => {
      console.log(error)
      socket.emit('importBook_rejected', error.toString())
    })
}

function adminServices(socket) {
  socket.on('getNewCardId', sk_getNewCard(socket))
  socket.on('issueCard', sk_issueCard(socket))
  socket.on('getReaderData', sk_getReaderData(socket))
  socket.on('renderData', csr_support.sk_getAdminRenderData(socket))
  socket.on('getParams', sk_getParams(socket))
  socket.on('updateParams', sk_updateParams(socket))

  socket.on('getBookData', sk_getBookData(socket))
  socket.on('addTitle', sk_addTitle(socket))
  socket.on('addPublish', sk_addPublish(socket))
  socket.on('importBook', sk_importBook(socket))
}

module.exports = adminServices