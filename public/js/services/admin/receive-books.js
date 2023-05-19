function showReturnDetails(e, d) {
  $("#return-content-field").addClass('show')
  let table = d3.select("#return-content-field").select('table')
  table.select('tbody').selectAll('tr').remove()
  insertIntoTable(table)(d.raw_data.contents)

  $("span[name='readerName']").html(d.raw_data.rName)
  $("span[name='returnDate']").html(d.raw_data.returnDate)
  $("span[name='currentFine']").html(d.raw_data.totalFine)
  $("span[name='totalDebt']").html(d.raw_data.debtAtTime)
}

// --------------------- dom action --------------------
$("#inner-return-books button").click(e => {
  e.preventDefault();
  if (!document.forms[1].reportValidity())
    return;

  let cardId = $("input[name='readerId']").val()

  socket.emit('getReaderBorrowedBooks', cardId)
})

$("#return-content-field button").click(e => {
  $("#return-content-field").removeClass('show')
})

$("#return-field button:last-child").click(e => {
  $("#return-field").removeClass('show')
  e.preventDefault()
})

$("#return-field button:first-child").click(e => {
  e.preventDefault()
  let trs = d3.select('#return-section').select('tbody').selectAll('tr').nodes()
  let filterByValue = value => trs.filter(node => (
    d3.select(node).selectAll('.return-status').nodes().filter(node => node.checked)[0] ??
    {value: ""}
  ).value == value)

  let losts = filterByValue('lost')
  let returns = filterByValue('return')


  let returnBooks = {
    losts: losts.map(node => d3.select(node).datum().raw_data.bookId),
    returns: returns.map(node => d3.select(node).datum().raw_data.bookId)
  }
  // console.log(returnBooks)

  let cardId = $("input[name='readerId']").val()

  socket.emit('returnBooks', {cardId, returnBooks})
})
// ------------------- socket comm. ------------------

socket.on('getReaderBorrowedBooks_rejected', rejectPopUp)
socket.on('getReaderBorrowedBooks_accepted', data => {
  d3.select('#return-section').select('tbody').selectAll('tr').remove()
  $("#return-field").addClass('show')
  $("input[name='rName']").val(data.rName)
  $("input[name='returnDate']").val(moment().format("YYYY-MM-DD"))
  $("span[name='totalDebt']").html(data.totalDebt)
  $("span[name='currentFine']").html(0).removeClass('hasLost')
  data.borrowContents.forEach((cnt, i) => {
    cnt.index = i+1;
    cnt.returnCkb = '<input type="checkbox" class="return-status" value="return">'
    cnt.lostCkb = '<input type="checkbox" class="return-status" value="lost">'
  })
  let trs = insertIntoTable(d3.select('#return-section'))(data.borrowContents)
    .selectAll('input[type="checkbox"]').on('change', e => {
      let targets = d3.select(e.target.parentNode.parentNode)
        .selectAll('input[type="checkbox"]').nodes()
      let t = d3.select(e.target)
      let cost = d3.select(e.target.parentNode.parentNode).datum().raw_data.fine
      let display = d3.select('span[name="currentFine"]')
      let current = +display.html()
      if (!t.property('checked'))
        current -= cost;
      else {
        if (!targets.every(t => t.checked))
          current += cost;
        if (targets[0] == t.node())
          d3.select(targets[1]).property('checked', false)
        if (targets[1] == t.node())
          d3.select(targets[0]).property('checked', false)
      }
      display.html(current)

      display.classed('hasLost', d3.selectAll('.return-status').nodes().filter(t => t.checked)
        .some(v => v.value == 'lost'))

      d3.select('#return-field').select('.stdBtn:first-child')
        .attr('disabled', !d3.selectAll('.return-status').nodes().some(t => t.checked) ? "true" : null)
    })
})

socket.on('returnBooks_rejected', rejectPopUp)
socket.on('returnBooks_accepted', data => {
  data.contents.forEach((book, i) => book.index = i+1)
  insertIntoTable(d3.select('#rental-activity'))(data)
    .on('click', showReturnDetails)
  $("#return-field").removeClass('show')
  firePopUp('Trả sách thành công', 'success')
})

socket.on('getReturnedBooks_accepted', data => {
  // console.log(data)
  data.forEach(datum => datum.contents.forEach((book, i) => book.index = i+1))
  insertIntoTable(d3.select('#rental-activity'))(data)
    .on('click', showReturnDetails)
})

;['getReaderBorrowedBooks_accepted',
  'getReaderBorrowedBooks_rejected',
  'returnBooks_rejected',
  'returnBooks_accepted',
  'getReturnedBooks_accepted'].forEach(socket => socketCleanUp.push(socket))

socket.emit('getReturnedBooks')