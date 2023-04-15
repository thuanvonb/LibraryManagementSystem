const db = require('../database/db.js')
const requestInput = require('../requests/requestIn.js')
const {encodeToCode128, socketUser} = require('../control/utils.js')
const csr_support = require('./csr.js')

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
    socket.emit('issueCard_rejected', "No permission")

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
      console.log(data)
      socket.emit('issueCard_accepted', {
        cardId: data.cardid,
        readerName: data.info.rname,
        cardtype: data.readertype,
        issueDate: data.issuedate.format('YYYY-MM-DD'),
        validUntil: data.validuntil.format('YYYY-MM-DD')
      })
    }).catch(err => socket.emit('issueCard_rejected', err))
  }
}

const sk_getReaderData = socket => data => {
  if (!socketUser(socket).permission.services)
    socket.emit('getReaderData_rejected', "No permission")

  console.log(db.database.ReaderCard.data)

  let dataOut = db.database.ReaderCard.data.map(d => ({
    cardId: d.cardid,
    readerName: d.info.rname,
    cardtype: d.readertype,
    issueDate: d.issuedate.format('YYYY-MM-DD'),
    validUntil: d.validuntil.format('YYYY-MM-DD')
  }))

  socket.emit('getReaderData_accepted', dataOut)
}

function adminServices(socket) {
  socket.on('getNewCardId', sk_getNewCard(socket))
  socket.on('issueCard', sk_issueCard(socket))
  socket.on('getReaderData', sk_getReaderData(socket))
  socket.on('renderData', csr_support.sk_getAdminRenderData(socket))
}

module.exports = adminServices