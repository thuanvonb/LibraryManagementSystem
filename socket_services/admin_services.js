const db = require('../database/db.js')
const requestInput = require('../requests/requestIn.js')
const requestOutput = require('../requests/requestOut.js')
const verifier = require('../requests/verifier.js')
const {encodeToCode128} = require('../control/utils.js')
const csr_support = require('./csr.js')
const {MaybeM, EitherM} = require('../control/monads.js')
const moment = require('moment')
const comb = require('../control/combinators.js')
const {Agg} = require('../database/jsql.js')
const Users = require('../security/users.js')

const socketUser = Users.socketUser

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
  if (!socketUser(socket).permission.services)
    return socket.emit('issueCard_rejected', "No permission")

  comb.if(data.reader.oldId)(() => {
    let reader = db.database.ReaderCard.where(d => d.cardid == data.reader.oldId)
    if (reader.isEmpty())
      return EitherM.error('Không tìm thấy thẻ cũ')
    let info = reader.data[0].info

    if (db.database.ReaderCard.where(d => d.info.infoid == info.infoid && d.validuntil.diff(moment()) > 0).isNotEmpty())
      return EitherM.error('Thẻ chứa thông tin độc giả này vẫn còn hiệu lực.')
    return requestInput.issueNewCard(data.card, info.infoid)
  })(() => requestInput.createNewReader(data.reader)
    .then(readerData => db.insert("CardInfo", readerData))
    .then(readerData => requestInput.issueNewCard(data.card, readerData.infoid))
  )().then(data => {
    data.staffId = socketUser(socket).staffId;
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
  }, err => {
    console.log(err)
    socket.emit('issueCard_rejected', err.toString())
  })

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

const sk_getCardData = socket => data => {
  if (!socketUser(socket).permission.services)
    return socket.emit('getCardData_rejected', "No permission")

  let cardDb = db.database.ReaderCard.where(d => d.cardid == data)

  if (cardDb.isEmpty())
    return socket.emit('getCardData_rejected', 'Không tìm thấy độc giả')

  let card = cardDb.data[0]

  socket.previousLookup = card.cardid

  socket.emit('getCardData_accepted', {
    rName: card.info.rname,
    birthday: card.info.birthday.format('YYYY-MM-DD'),
    readerType: card.readertype,
    addr: card.info.addr,
    issueDate: card.issuedate.format('YYYY-MM-DD'),
    validDate: card.validuntil.format('YYYY-MM-DD'),
    cardId: card.cardid,
    barcode: encodeToCode128(card.cardid)
  })
}

const sk_prolongCard = socket => data => {
  if (!socketUser(socket).permission.services)
    return socket.emit('prolongCard_rejected', "No permission")

  if (!socket.previousLookup)
    return socket.emit('prolongCard_rejected', "Không thể thực hiện thao tác này")

  let id = socket.previousLookup;
  socket.previousLookup = null

  db.utilities.prolongCard(id).then(
    data => socket.emit('prolongCard_accepted', {
      cardId: id,
      validUntil: data.validuntil.format('YYYY-MM-DD')
    }), 
    error => {
      console.log(error)
      socket.emit('prolongCard_rejected', error.toString())
    }
  )

}

const sk_getParams = socket => data => {
  if (!socketUser(socket).permission.libControl)
    return socket.emit('getParams_rejected', 'No permission')

  socket.emit('getParams_accepted', db.database.parameters)
}

const sk_updateParams = socket => data => {
  if (!socketUser(socket).permission.libControl)
    return socket.emit('updateParams_rejected', 'No permission')

  db.utilities.updateParameters(data).then(result => {
    socket.emit('updateParams_accepted', result)
  }, err => {
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

  let isbn = verifier.verifyISBN(data.isbn)
  if (isbn == null)
    return socket.emit('importBook_rejected', "ISBN không hợp lệ")

  // console.log(data)
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

  if (db.database.BookTitle.where(d => d.isbn == isbn).isNotEmpty())
    return socket.emit('addTitle_rejected', 'Sách đã được thêm trước đó.')

  data.authors.reduce((currMonad, author) => currMonad.then(d => addToAuthor(author)), startMonad)
    .then(d => addToGenre(data.gName))
    .then(d => requestInput.createNewBook({
      bName: data.bName,
      genreId: db.database.Genre.where(d => d.gname == data.gName).data[0].genreid,
      isbn: isbn
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
        isbn: isbn
      })
    }, error => {
      console.log(error)
      socket.emit('addTitle_rejected', error.toString())
    })
}

const sk_getBookData = socket => data => {
  // if (!socketUser(socket).permission.libControl)
  //   return socket.emit('getBookData_rejected', 'No permission')

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

const sk_getReaderRentalInfo = socket => data => {
  if (!socketUser(socket).permission.services)
    return socket.emit('getReaderRentalInfo_rejected', "No permission")

  let card = db.database.ReaderCard.where(d => d.cardid == data)
  if (card.isEmpty())
    return socket.emit('getReaderRentalInfo_rejected', "Không tìm thấy thẻ độc giả")
  if (card.where(d => d.validuntil.diff(moment()) < 0).isNotEmpty())
    return socket.emit('getReaderRentalInfo_rejected', "Thẻ đã hết hạn")

  let cardData = card.data[0]

  socket.emit('getReaderRentalInfo_accepted', {
    name: cardData.info.rname,
    debt: cardData.debt
  })
}

const sk_searchBookById = socket => data => {
  if (!socketUser(socket).permission.services)
    return socket.emit('searchBookById_rejected', "No permission")

  let maybeBook = requestOutput.searchBookById(data.id)
  let output = {
    found: false,
    row: data.row
  }
  if (!maybeBook.isNothing) {
    output.found = true
    output.data = maybeBook.data
  }

  socket.emit('searchBookById_accepted', output)
}

const sk_borrowBooks = socket => data => {
  if (!socketUser(socket).permission.services)
    socket.emit('borrowBooks_rejected', "No permission")

  let card = db.database.ReaderCard.where(d => d.cardid == data.cardId)
  if (card.isEmpty())
    return socket.emit('borrowBooks_rejected', "Không tìm thấy thẻ độc giả")
  if (card.where(d => d.validuntil.diff(moment()) < 0).isNotEmpty())
    return socket.emit('borrowBooks_rejected', "Thẻ đã hết hạn")

  let accM = data.books.map(requestOutput.searchBook)
    .reduce((accM, monad) => accM.pass(monad), MaybeM.pure())

  if (accM.isNothing)
    return socket.emit('borrowBooks_rejected', "Một số mã quyển sách không tồn tại")

  let ids = data.books.map(st => +st.substring(st.length - 4))
  
  let exceeded = verifier.verifyNumberOfBorrowing(data.cardId, ids)
  if (exceeded > 0)
    return socket.emit('borrowBooks_rejected', "Vượt quá số lượng mượn cho phép (quá " + exceeded + " quyển)")

  if (!verifier.verifyDuplicateBorrowing(data.cardId, ids))
    return socket.emit('borrowBooks_rejected', "Không được mượn nhiều hơn 1 sách giống nhau")

  if (!verifier.verifyOverdueBook(data.cardId))
    return socket.emit('borrowBooks_rejected', "Độc giả có sách đang mượn quá hạn")

  if (!verifier.verifyAvailability(ids))
    return socket.emit('borrowBooks_rejected', "Một số sách đã có người đang mượn")

  requestInput.newBorrow(data.cardId, socketUser(socket).staffId)
    .then(newBorrow => db.insert('Borrowing', newBorrow))
    .then(borrowData => requestInput.newBorrowBooks(borrowData.borrowid, ids))
    .then(borrowedBooks => db.insert('BorrowingContents', borrowedBooks))
    .then(booksData => {
      db.database.Book.where(d => booksData.some(book => book.bookid == d.bookid))
        .forEach(d => d.available = 0)
      return requestOutput.newBorrow(booksData)
    })
    .then(output => socket.emit('borrowBooks_accepted', output), err => {
      console.log(err);
      socket.emit('borrowBooks_rejected', err.toString())
    })
}

const sk_getBorrowedBooks = socket => data => {
  if (!socketUser(socket).permission.services)
    socket.emit('getBorrowedBooks_rejected', "No permission")

  requestOutput.getBorrowData().then(data => socket.emit('getBorrowedBooks_accepted', data))
}

const sk_getReaderBorrowedBooks = socket => data => {
  if (!socketUser(socket).permission.services)
    socket.emit('getReaderBorrowedBooks_rejected', "No permission")

  let card = db.database.ReaderCard.where(d => d.cardid == data)
  if (card.isEmpty())
    return socket.emit('getReaderBorrowedBooks_rejected', "Không tìm thấy thẻ độc giả")
  
  requestOutput.getReaderBorrowedBooks(data)
    .then(data => socket.emit('getReaderBorrowedBooks_accepted', data))
}

const sk_returnBooks = socket => data => {
  if (!socketUser(socket).permission.services)
    socket.emit('returnBooks_rejected', "No permission")

  let card = db.database.ReaderCard.where(d => d.cardid == data.cardId)
  if (card.isEmpty())
    return socket.emit('returnBooks_rejected', "Không tìm thấy thẻ độc giả")

  let accM = data.returnBooks.losts.concat(data.returnBooks.returns)
    .map(requestOutput.searchBook).reduce((accM, monad) => accM.pass(monad), MaybeM.pure())

  if (accM.isNothing)
    return socket.emit('returnBooks_rejected', "Một số mã quyển sách không hợp lệ")

  let losts = data.returnBooks.losts.map(v => +v.substring(v.length-4))
  let returns = data.returnBooks.returns.map(v => +v.substring(v.length-4))

  let verifyBorrowingBook = verifier.verifyBorrowingBook(data.cardId)
  let sequenceVerify = data => comb.sequenceMaybe(data.map(verifyBorrowingBook))

  let lostBooks = sequenceVerify(losts)
  let returnBooks = sequenceVerify(returns)

  if (lostBooks.isNothing || returnBooks.isNothing)
    return socket.emit('returnBooks_rejected', "Một số sách đã được trả trước đó")

  requestInput.calculateTotalFine(data.cardId, {losts, returns})
    .then(totalFine => requestInput.newReturn(data.cardId, socketUser(socket).staffId, totalFine))
    .then(newReturn => db.insert('Returning', newReturn))
    .then(returnData => {
      card.first.debt += returnData.overdueFine
      return EitherM.pure(returnData)
    })
    .then(returnData => requestInput.returnBooks(returnData.returnid, {losts, returns}, {
      losts: lostBooks.data,
      returns: returnBooks.data
    }))
    .then(returnedBooks => db.insert('ReturningContents', returnedBooks))
    .then(returnData => {
      let returned = returnData.filter(d => !d.islost).map(v => v.bookid)
      db.database.Book.where(d => returned.includes(d.bookid)).forEach(d => d.available = 1)

      return requestOutput.newReturn(returnData)
    })
    .then(out => socket.emit('returnBooks_accepted', out), err => {
      console.log(err);
      socket.emit('returnBooks_rejected', err.toString())
    })
}

const sk_getReturnedBooks = socket => data => {
  if (!socketUser(socket).permission.services)
    socket.emit('getReturnedBooks_rejected', "No permission")

  requestOutput.getReturnData()
    .then(data => socket.emit('getReturnedBooks_accepted', data))
}

const sk_getFineDetails = socket => data => {
  if (!socketUser(socket).permission.services)
    return socket.emit('getFineDetails_rejected', "No permission")

  let card = db.database.ReaderCard.where(d => d.cardid == data)
  if (card.isEmpty())
    return socket.emit('getFineDetails_rejected', "Không tìm thấy độc giả")

  socket.emit('getFineDetails_accepted', {
    rName: card.first.info.rname,
    totalDebt: card.first.debt
  })
}

const sk_issueInvoice = socket => data => {
  if (!socketUser(socket).permission.services)
    return socket.emit('issueInvoice_rejected', "No permission")

  requestInput.issueInvoice(data, socketUser(socket).staffId)
    .then(newInvoice => db.insert('FineInvoice', newInvoice))
    .then(invoiceData => {
      db.database.ReaderCard.where(d => d.cardid == invoiceData.cardid).first.debt -= invoiceData.paid;
      socket.emit('issueInvoice_accepted', requestOutput.fromInvoice(invoiceData))
    }, err => {
      console.log(err)
      socket.emit('issueInvoice_rejected', err.toString())
    })
}

const sk_getInvoices = socket => data => {
  if (!socketUser(socket).permission.services)
    return socket.emit('getInvoices_rejected', "No permission")

  requestOutput.getInvoices()
    .then(data => socket.emit('getInvoices_accepted', data))
}

const sk_getBookBorrowContext = socket => isbn => {
  // if (!socketUser(socket).permission.libControl)
  //   return socket.emit('getBookBorrowContext_rejected', 'No permission')

  requestOutput.getBookBorrowContext(isbn)
    .then(data => requestOutput.getBookId_Status(isbn)
      .then(statusD => EitherM.pure({context: data, status: statusD}))
    )
    .then(data => socket.emit('getBookBorrowContext_accepted', data), err => 
      socket.emit('getBookBorrowContext_rejected', err.toString()))
}

const sk_reportRental = socket => data => {
  if (!socketUser(socket).permission.report)
    return socket.emit('reportRental_rejected', 'No permission')

  requestOutput.reportRental(data.month, data.year)
    .then(output => socket.emit('reportRental_accepted', output))
}

const sk_reportOverdue = socket => data => {
  if (!socketUser(socket).permission.report)
    return socket.emit('reportOverdue_rejected', 'No permission')

  requestOutput.reportOverdue(moment(data))
    .then(output => socket.emit('reportOverdue_accepted', output))
}

const sk_staffManageData = socket => data => {
  if (!socketUser(socket).permission.staffControl)
    return socket.emit('staffManageData_rejected', 'No permission')

  requestOutput.getStaffData(socketUser(socket).permission.fullControl)
    .then(data => socket.emit('staffManageData_accepted', data))
}

const sk_addNewStaff = socket => data => {
  if (!socketUser(socket).permission.staffControl)
    return socket.emit('addNewStaff_rejected', 'No permission')

  requestInput.addNewStaff(data)
    .then(db.utilities.addNewStaff)
    .then(newStaff => requestOutput.staffData(newStaff))
    .then(staffData => socket.emit('addNewStaff_accepted', staffData),
      err => {
        console.log(err)
        socket.emit('addNewStaff_rejected', err.toString())
      }
    )
}

const sk_updateStaff = socket => data => {
  if (!socketUser(socket).permission.staffControl)
    return socket.emit('updateStaff_rejected', 'No permission')

  if (data.presetId == null && data.permission == null)
    return socket.emit('updateStaff_rejected', "Holy hell!")

  if (data.presetId != null && db.database.PresetPermission.where(d => d.presetid == data.presetId).isEmpty())
    return socket.emit('updateStaff_rejected', 'Nhóm quyền không tồn tại')

  let staff = db.database.Staff.where(d => d.staffid == data.staffId)
  if (staff.isEmpty())
    return socket.emit('updateStaff_rejected', "Không tìm thấy nhân viên")

  let currPermission = staff.first.permission ?? staff.first.preset.permission

  let changedPermission = data.permission ?? db.database.PresetPermission.where(d => d.presetid == data.presetId).first.permission

  if ((currPermission + changedPermission) % 2 == 1)
    return socket.emit('updateStaff_rejected', "Không có quyền thực hiện thao tác này")

  if (!socketUser(socket).permission.fullControl &&
    ((currPermission ^ changedPermission) >> 4) % 2 == 1)
    return socket.emit('updateStaff_rejected', "Không có quyền thực hiện thao tác này")

  db.utilities.updateStaffPermission(data)
    .then(updatedStaff => {
      data.permission = updatedStaff.permission ?? updatedStaff.preset.permission
      let otherSocket = Users.findSocketById(data.staffId)
      if (otherSocket)
        otherSocket.emit('serverMsg', "Quyền của bạn đã được cập nhật, hãy tải lại trang")
      socket.emit('updateStaff_accepted', data)
    }, err => {
      console.log(err)
      socket.emit('updateStaff_rejected', err.toString())
    })
}

const sk_updatePreset = socket => data => {
  if (!socketUser(socket).permission.staffControl)
    return socket.emit('updatePreset_rejected', 'No permission')

  let updateData = data.map((v, i) => ({
    id: i+1,
    permission: v*2
  })).filter(v => db.database.PresetPermission.where(d => d.presetid == v.id && d.permission != v.permission).isNotEmpty())

  db.utilities.updatePreset(updateData)
    .then(updatedData => {
      let p = updatedData.map(v => v.id)
      db.database.Staff.where(d => p.includes(d.permissionpreset))
        .map(v => Users.findSocketById(v.staffid))
        .filter(otherSocket => otherSocket != undefined && otherSocket != socket)
        .forEach(socket => 
          socket.emit('serverMsg', "Quyền của bạn đã được cập nhật, hãy tải lại trang"))

      socket.emit('updatePreset_accepted', requestOutput.getPermissionPreset())
    }, err => {
      console.log(err)
      socket.emit('updateStaff_rejected', err.toString())
    })
}

function adminServices(socket) {
  Users.addUserSocket(socket)
  socket.on('renderData', csr_support.sk_getAdminRenderData(socket))

  socket.on('getNewCardId', sk_getNewCard(socket))
  socket.on('issueCard', sk_issueCard(socket))
  socket.on('getReaderData', sk_getReaderData(socket))
  socket.on('getCardData', sk_getCardData(socket))
  socket.on('prolongCard', sk_prolongCard(socket))

  socket.on('getReaderRentalInfo', sk_getReaderRentalInfo(socket))
  socket.on('searchBookById', sk_searchBookById(socket))

  socket.on('getParams', sk_getParams(socket))
  socket.on('updateParams', sk_updateParams(socket))

  socket.on('getBookData', sk_getBookData(socket))
  socket.on('addTitle', sk_addTitle(socket))
  socket.on('addPublish', sk_addPublish(socket))
  socket.on('importBook', sk_importBook(socket))

  socket.on('borrowBooks', sk_borrowBooks(socket))
  socket.on('getBorrowedBooks', sk_getBorrowedBooks(socket))
  socket.on('getBookBorrowContext', sk_getBookBorrowContext(socket))

  socket.on('getReaderBorrowedBooks', sk_getReaderBorrowedBooks(socket))
  socket.on('returnBooks', sk_returnBooks(socket))
  socket.on('getReturnedBooks', sk_getReturnedBooks(socket))

  socket.on('getFineDetails', sk_getFineDetails(socket))
  socket.on('issueInvoice', sk_issueInvoice(socket))
  socket.on('getInvoices', sk_getInvoices(socket))

  socket.on('reportRental', sk_reportRental(socket))
  socket.on('reportOverdue', sk_reportOverdue(socket))

  socket.on('staffManageData', sk_staffManageData(socket))
  socket.on('addNewStaff', sk_addNewStaff(socket))
  socket.on('updateStaff', sk_updateStaff(socket))
  socket.on('updatePreset', sk_updatePreset(socket))

}

module.exports = adminServices