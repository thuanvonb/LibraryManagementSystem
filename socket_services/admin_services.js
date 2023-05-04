const db = require('../database/db.js')
const requestInput = require('../requests/requestIn.js')
const {encodeToCode128, socketUser} = require('../control/utils.js')
const csr_support = require('./csr.js')
const {EitherM} = require('../control/monads.js')

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

  let dataOut = db.database.ReaderCard.data.map(d => ({
    cardId: d.cardid,
    rName: d.info.rname,
    cardType: d.readertype,
    issueDate: d.issuedate.format('YYYY-MM-DD'),
    validUntil: d.validuntil.format('YYYY-MM-DD')
  }))

  socket.emit('getReaderData_accepted', dataOut)
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

const sk_importBook = socket => data => {
  if (!socketUser(socket).permission.libControl)
    return socket.emit('importBook_rejected', 'No permission')

  let eitherM;

  if (db.database.BookTitle.where(d => d.bname == data.bName).isNotEmpty()) {
    eitherM = EitherM.pure(db.database.BookTitle.where(d => d.bname == data.bName).data[0])
      .then(bt => {
        let publish = db.database.BooksPublish.where(d => d.titleid == bt.titleid && d.publishment == data.publishment)
        if (publish.isNotEmpty())
          return EitherM.pure(publish.data[0])
        return requestInput.createNewPublishment({
          titleId: bt.titleid,
          publishment: data.publishment,
          publishYear: data.publishYear,
          price: data.price
        }).then(newPublish => db.insert('BooksPublish', newPublish))
      })
  } else {
    let author = db.database.Author.where(d => d.aname == data.aName)
    if (author.isEmpty())
      eitherM = requestInput.createNewAuthor(data.aName)
        .then(data => db.insert("Author", data))
    else
      eitherM = EitherM.pure(author.data[0])

    let publisher = db.database.Publisher.where(d => d.pname == data.pName)
    if (publisher.isEmpty())
      eitherM = eitherM.then(ok => requestInput.createNewPublisher(data.pName))
        .then(data => db.insert("Publisher", data))
    else
      eitherM = eitherM.then(ok => EitherM.pure(publisher.data[0]))

    let genre = db.database.Genre.where(d => d.gname == data.gName)
    if (genre.isEmpty())
      eitherM = eitherM.then(ok => requestInput.createNewGenre(data.gName))
        .then(data => db.insert("Genre", data))
    else
      eitherM = eitherM.then(ok => EitherM.pure(genre.data[0]))

    eitherM = eitherM.then(ok => requestInput.createNewBook({
      bName: data.bName,
      genreId: db.database.Genre.where(d => d.gname == data.gName).data[0].genreid,
      publisherId: db.database.Publisher.where(d => d.pname == data.pName).data[0].publisherid,
      authorId: db.database.Author.where(d => d.aname == data.aName).data[0].authorid
    })).then(data => db.insert("BookTitle", data))
      .then(newBook => requestInput.createNewPublishment({
        titleId: newBook.titleid,
        publishment: data.publishment,
        publishYear: data.publishYear,
        price: data.price
      })).then(newPublish => db.insert('BooksPublish', newPublish))

  }

  eitherM.then(publishment => requestInput.createNewImport({
    bpId: publishment.bpid,
    amount: data.amount,
    staffId: socketUser(socket).staffId
  })).then(newImport => db.insert('BookImport', newImport))
  .then(importData => {
    db.database.BooksPublish.where(d => d.bpid == importData.bpid).data[0].totalamount += importData.amount;
    return requestInput.createBooks(importData)
  }).then(books => db.insert("Book", books))
  .then(books => {
    let importData = books[0].import
    socket.emit('importBook_accepted', {
      importId: importData.importid,
      bName: importData.bp.title.bname,
      publishment: importData.bp.publishment,
      importDate: importData.importdate.format('YYYY-MM-DD'),
      amount: importData.amount
    })
  }, error => socket.emit('importBook_rejected', error.toString()))
}

function adminServices(socket) {
  socket.on('getNewCardId', sk_getNewCard(socket))
  socket.on('issueCard', sk_issueCard(socket))
  socket.on('getReaderData', sk_getReaderData(socket))
  socket.on('renderData', csr_support.sk_getAdminRenderData(socket))
  socket.on('getParams', sk_getParams(socket))
  socket.on('updateParams', sk_updateParams(socket))

  socket.on('importBook', sk_importBook(socket))
}

module.exports = adminServices