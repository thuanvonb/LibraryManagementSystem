function requestNewId() {
  if (d3.select("#barcode").html() != "")
    return;
  socket.emit('getNewCardId')
}

function updateForm(e) {
  requestNewId()
  $(`#info-fields div span[name='readerType']`).html($("#issueForm select").val())
  let p = $(`#info-fields div span[name='${e.target.name}']`)
  if (p.length == 0)
    return;
  p.html($(e.target).val())
  $("span[name='issueDate']").html(moment().format("YYYY-MM-DD"))
}

// --------------------- dom action --------------------
$("#issueForm input").on('input', updateForm)
$("#issueForm select").on('change', updateForm)

$("#prolongCardBtn").hide()

$("#issueCardBtn").click(function(e) {
  if (!document.forms['issueForm'].reportValidity())
    return;
  let rawdata = $("#issueForm").serializeArray()
  let data = {}
  rawdata.forEach(d => {
    data[d.name] = d.value
  })
  let reader = {}
  if (data.oldId) 
    reader.oldId = data.oldId
  else {
    reader.rName = data.rName
    reader.addr = data.addr
    reader.email = data.email
    reader.identityNum = data.identityNum
    reader.birthday = data.birthday
  }
  let card = {}
  card.cardId = $("span[name='cardId']").html()
  card.readerType = data.readerType
  socket.emit('issueCard', {reader, card})
})

$("button[name='issueAction']").click(e => {
  let button = $(e.target)
  button.toggleClass('active')
  $("#reader-table").toggleClass('expand')
  if (button.hasClass('active'))
    $("#reader-info").slideDown()
  else {
    document.forms.issueForm.reset()
    $(".cardAttr").html("")
    $("#reader-info").slideUp()
  }
})

// ------------------- socket comm. ------------------
socket.on('cardId', data => {
  d3.select("#barcode").html(data.idBar)
  d3.select("span[name='cardId']").html(data.id)
})

socket.on('issueCard_rejected', reason => {
  if (typeof reason == 'string')
    firePopUp(reason, 'failure')
  else
    firePopUp("Cannot issue card", "error")
})

socket.on('issueCard_accepted', userInfo => {
  $("span[name='validDate']").html(userInfo.validUntil)
  document.forms.issueForm.reset()
  $(".cardAttr").html("")
  insertIntoTable(d3.select('#reader-table').select('table').select('tbody'), [{value: ""}])(userInfo)
  // $("#issueCardBtn").html("Issued!")
  firePopUp("Card issued successfully", 'success')
})

socket.on('getReaderData_accepted', readerInfo => {
  let defaultInsert = insertIntoTable(d3.select('#reader-table').select('table').select('tbody'), [{value: ""}])
  readerInfo.forEach(defaultInsert)
});

(['cardId', 'issueCard_rejected', 'issueCard_accepted', 'getReaderData_accepted']).forEach(socket => socketCleanUp.push(socket))

socket.emit('getReaderData')
console.log('load')