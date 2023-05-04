// --------------------- dom action --------------------

$("#import-book").click(e => {
  if (!document.forms['book-infos'].reportValidity())
    return;
  let rawdata = $("#book-infos").serializeArray()
  let data = {}
  rawdata.forEach(d => {
    data[d.name] = d.value
  })
  data.publishment = +data.publishment
  data.publishYear = +data.publishYear
  data.price = +data.price
  data.amount = +data.amount
  socket.emit('importBook', data)
})

// ------------------- socket comm. ------------------

socket.on('importBook_rejected', err => firePopUp(err, 'failure'))
socket.on('importBook_accepted', data => {
  firePopUp("Sách đã được nhập thành công", 'success')
  insertIntoTable(d3.select("#import-history"))(data)
  document.forms['book-infos'].reset()
})

;['importBook_rejected', 'importBook_accepted'].forEach(socket => socketCleanUp.push(socket))

socket.emit('no_action')
orderingColumns(d3.select("#import-history"))