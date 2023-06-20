function verifyInstance(e) {
  let text = e.target.innerHTML
  if (text == "")
    return;

  let tr = d3.select(e.target.parentNode)
  let tdErr = tr.selectAll('td').filter((d, i) => i == 3)
  tr.classed('error', true)

  $("#borrow-field button:first-child").attr('disabled', true)

  tr.selectAll('td').filter((d, i) => i > 1).html("")
  let match = text.match(/\d{3}\-?\d{2}\-?\d{4}/g)

  if (!match) {
    tdErr.html("Mã quyển sách không hợp lệ")
    tr.classed('error', true)
    return;
  }

  console.log(text, match)
  e.target.innerHTML = match[0]
  socket.emit('searchBookById', {
    id: match[0],
    row: +tr.select('td').html()
  })
}

function renumbering() {
  let table = d3.select("#borrow-section")
    .select('tbody')

  table.selectAll('tr')
    .select('td')
    .html((d, i) => i+1)

  let errors = d3.select("#borrow-section").select('tbody').selectAll('tr.error').size()
  let count = d3.select("#borrow-section").select('tbody').selectAll('tr').size()

  if (errors > 0 || count == 1)
    $("#borrow-field button:first-child").attr('disabled', true)
  else
    $("#borrow-field button:first-child").attr('disabled', null)
}

function insertNewBorRow() {
  let table = d3.select("#borrow-section")
    .select('tbody')

  let nRow = table.selectAll('tr').size()
  let data = [nRow + 1, -1, 0, 0, 0, 0]
  let editable = table.append('tr').selectAll('td').data(data).join('td')
    .html(d => d > 0 ? d : "")
    .attr('contenteditable', d => d < 0 ? true : null)
    .filter((d, i) => i == 1)

  editable.on('keypress', e => {
    if (e.which == 13) {
      verifyInstance(e)
      e.preventDefault();
    }
  })

  editable.on('input', e => {
    let text = e.target.innerHTML
    let t = +d3.select(e.target.parentNode).select('td').html()
    let nRow = table.selectAll('tr').size()
    $("#borrow-field button:first-child").attr('disabled', true)
    
    if (nRow == t && text != "")
      insertNewBorRow()
    if (nRow > t && text == "") {
      d3.select(e.target.parentNode).remove()
      renumbering()
    }
  })

  editable.on('focusout', verifyInstance)
}

function processBorrowData(borrow) {
  // console.log(borrow)
  let notReturned = borrow.contents.filter(v => v.returnId == null).length
  let statusClass = ""
  if (notReturned == 0) {
    borrow.status = 'Đã trả'
    statusClass = 'status-complete'
  } else {
    if (moment(borrow.dueDate).add(1, 'days').diff(moment()) < 0) {
      borrow.status = 'Quá hạn'
      statusClass = 'status-overdue'
    } else {
      borrow.status = 'Chưa trả'
      statusClass = 'status-partial'
    }
    borrow.status += ' (' + notReturned + ')'
  }
  borrow.status = '<span class="' + statusClass + '">' + borrow.status + "</span>"

  borrow.contents.forEach((book, i) => {
    book.index = i+1;
  })
}

function showBorrowDetails(e, d) {
  let selection = getSelection();
  if (selection.type == 'Range' && e.target == selection.anchorNode.parentNode)
    return;

  $("#borrow-content-field span[name='readerName']").html(d.raw_data.rName)
  $("#borrow-content-field span[name='borrowDate']").html(d.raw_data.borrowDate)
  $("#borrow-content-field").addClass('show')
  let table = d3.select("#borrow-content-field")
  table.select('tbody').selectAll('tr').remove();
  insertIntoTable(table)(d.raw_data.contents)
}

// --------------------- dom action --------------------
$("input[name='readerId']").on('input', e => {
  d3.select("#borrow-section")
    .select('tbody')
    .selectAll('tr')
    .remove()

  insertNewBorRow()

  tableFilter(d3.select("#rental-activity"))(r => r.cardId.startsWith(e.target.value))
})

$("#inner-borrow-books button").click(e => {
  if (!document.forms[1].reportValidity())
    return;

  let id = $("input[name='readerId']").val()
  socket.emit('getReaderRentalInfo', id)

  e.preventDefault()
})

$("#borrow-field button:first-child").click(e => {
  let cardId = $("input[name='readerId']").val()

  let booksId = d3.select("#borrow-section")
    .select('tbody')
    .selectAll('tr')
    .selectAll('td')
    .filter((d, i) => i == 1)
    .nodes()
    .map(v => v.innerHTML)
    .filter(v => v != "")

  socket.emit('borrowBooks', {
    cardId: cardId,
    books: booksId
  })

  e.preventDefault()
})

$("#borrow-field button:last-child").click(e => {
  document.forms[0].reset();
  $("#borrow-field").removeClass('show')
  e.preventDefault()
})

$("#borrow-content-field button").click(e => {
  $("#borrow-content-field").removeClass('show')
})

// ------------------- socket comm. ------------------


socket.on('getReaderRentalInfo_rejected', rejectPopUp)
socket.on('getReaderRentalInfo_accepted', data => {
  $("#borrow-field").addClass('show')
  $("input[name='rName']").val(data.name)
  $("input[name='borrowDate']").val(moment().format('YYYY-MM-DD'))
})

socket.on('searchBookById_accepted', out => {
  let tr = d3.select("#borrow-section")
    .select('tbody')
    .selectAll('tr')
    .filter((d, i) => i == out.row-1)
    .classed('error', !out.found)

  let tds = tr.selectAll('td').filter((d, i) => i > 1)
  let data = [
    out.found ? out.data.titleId : "",
    out.found ? out.data.bName : "Không tìm thấy sách",
    out.found ? out.data.gName : "",
    out.found ? out.data.authors : ""
  ]

  if (d3.select("#borrow-section").select('tbody').select('tr.error').empty())
    $("#borrow-field button:first-child").attr('disabled', null)
  else
    $("#borrow-field button:first-child").attr('disabled', true)

  // console.log(data)

  tds.data(data)
    .html(d => d)
})

socket.on('borrowBooks_accepted', data => {
  processBorrowData(data);
  insertIntoTable(d3.select("#rental-activity"))(data)
    .on('click', showBorrowDetails)

  firePopUp("Cho mượn sách thành công", 'success')
  document.forms[0].reset();
  document.forms[1].reset();
  $("#borrow-field").removeClass('show')
  tableFilter(d3.select('#rental-activity'))(d => 1)
})

socket.on('borrowBooks_rejected', rejectPopUp)

socket.on('getBorrowedBooks_accepted', data => {
  data.forEach(processBorrowData)
  insertIntoTable(d3.select("#rental-activity"))(data)
    .on('click', showBorrowDetails)
})

;['getReaderRentalInfo_rejected',
  'getReaderRentalInfo_accepted',
  'searchBookById_accepted',
  'borrowBooks_accepted',
  'borrowBooks_rejected',
  'getBorrowedBooks_accepted'].forEach(socket => socketCleanUp.push(socket))

orderingColumns(d3.select("#rental-activity"))
socket.emit('getBorrowedBooks')
