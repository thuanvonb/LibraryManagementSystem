// --------------------- dom action --------------------

$("#inner-invoice-books button").click(e => {
  e.preventDefault();
  if (!document.forms[1].reportValidity())
    return;

  socket.emit('getFineDetails', $("input[name='readerId']").val())
})

$("#invoice-field button:first-child").click(e => {
  e.preventDefault();
  socket.emit('issueInvoice', {
    cardId: $("input[name='readerId']").val(),
    paid: $("input[name='amount']").val()
  })
})

$("#invoice-field button:last-child").click(e => {
  e.preventDefault();
  document.forms[0].reset()
  $("#invoice-field").removeClass('show')
})

$("input[name='amount']").on('input', e => {
  let total = $("input[name='totalDebt']").val()
  let amount = $("input[name='amount']").val()
  $("input[name='remaining']").val(total - amount)
})
// ------------------- socket comm. ------------------


socket.on('getFineDetails_rejected', rejectPopUp)
socket.on('getFineDetails_accepted', data => {
  $("#invoice-field").addClass('show')

  $("input[name='rName']").val(data.rName)
  $("input[name='totalDebt']").val(data.totalDebt)
  $("input[name='invoiceDate']").val(moment().format('YYYY-MM-DD'))
  $("input[name='remaining']").val(data.totalDebt)
  $("input[name='amount']").attr('max', data.totalDebt)
})

socket.on('issueInvoice_rejected', rejectPopUp)
socket.on('issueInvoice_accepted', data => {
  document.forms[0].reset()
  $("#invoice-field").removeClass('show')
  insertIntoTable(d3.select('#invoice-list'))(data)
  firePopUp('Thu tiền thành công', 'success')
})

socket.on('getInvoices_accepted', data => {
  insertIntoTable(d3.select('#invoice-list'))(data)
})

;['getFineDetails_rejected',
  'getFineDetails_accepted',
  'issueInvoice_rejected',
  'issueInvoice_accepted',
  'getInvoices_accepted'].forEach(socket => socketCleanUp.push(socket))

socket.emit('getInvoices')