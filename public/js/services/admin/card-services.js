function requestNewId() {
  if (d3.select("#barcode").html() != "")
    return;
  socket.emit('getNewCardId')
}

function issueFormRestoreDefault() {
  document.forms.issueForm.reset()
  d3.select("#issueForm")
    .selectAll('input')
    .attr('disabled', null)

  d3.select("#issueForm")
    .selectAll('select')
    .attr('disabled', null)

  d3.select('#issueForm')
    .selectAll('input:last-child')
    .attr('disabled', true)
    .attr('readonly', null)

  $(".cardAttr").html("")
  $("#barcode").html("")

  document.forms.issueForm.reset()

  $("#card-service > div:last-child").removeClass('other-mode')
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

function addAction(val) {
  let validUntil = moment(val.validUntil)
  let cardId = val.cardId;
  if (validUntil.diff(moment()) > 0) {
    val.action = '<span class="green">Gia hạn thẻ</span>'
    val.actF = prolongCard(cardId);
  } else {
    val.action = '<span class="red">Làm thẻ mới</span>'
    val.actF = newCardFromOld(cardId);
  }
}

var prolongCard = id => () => {
  $("#card-service > div:last-child").addClass('other-mode')

  socket.emit('getCardData', id)
  // console.log(data.cardId)
}

var newCardFromOld = id => () => {
  $("#card-service > div:last-child").removeClass('other-mode')
  d3.select("#issueForm")
    .selectAll('select')
    .attr('disabled', null)

  d3.select("#issueForm")
    .select('input:last-child')
    .attr('disabled', null)
    .attr('readonly', true)


  socket.emit('getNewCardId')
  socket.emit('getCardData', id)
}

function getValidFilter() {
  let v = $("select[name='card-valid']").val()
  let diffValid = sign => d => sign*moment(d.validUntil).diff(moment()) > 0
  let cond = x => true;
  if (v == 'valid')
    cond = diffValid(1)
  if (v == 'invalid')
    cond = diffValid(-1)
  return cond
}

function getSearchFilter() {
  let v = $("input[name='filter-context']").val()
  if (v == "")
    return x => true;

  let type = $("select[name='filter-value']").val()
  return d => longestCommonSubsequence(normalize(d[type]))(normalize(v)) == v.length
}

function cardFilter(e) {
  let cond1 = getValidFilter()
  let cond2 = getSearchFilter()

  tableFilter(d3.select('#reader-table').select('table'))(and(cond1)(cond2))
}

// function cardTableAction(e, d) {
  // let button = $("button[name='issueAction']")
  // if (!button.hasClass('active'))
  //   $("#reader-info").slideDown(300)
  // button.addClass('active')
  // d.raw_data.actF()
// }

// --------------------- dom action --------------------
$("#issueForm input").on('input', updateForm)
$("#issueForm select").on('change', updateForm)

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
  // console.log(reader, card)
  socket.emit('issueCard', {reader, card})
})

$("button[name='issueAction']").click(e => {
  let button = $(e.target)
  button.toggleClass('active')
  if (button.hasClass('active'))
    $("#reader-info").slideDown(300)
  else
    $("#reader-info").slideUp(300, e => issueFormRestoreDefault())
})

$("#reader-table table").click(e => {
  let node = e.target
  if (node.nodeName != 'TD' && node.nodeName != 'SPAN')
    return;
  if (node.nodeName == 'SPAN') {
    if (node.parentNode.nodeName != 'TD')
      return;
    else
      node = node.parentNode;
  }
  if (node.parentNode.children[6] != node)
    return;

  issueFormRestoreDefault()

  let button = $("button[name='issueAction']")
  if (!button.hasClass('active'))
    $("#reader-info").slideDown(300)
  button.addClass('active')

  d3.select("#issueForm")
    .selectAll('input')
    .attr('disabled', true)

  d3.select("#issueForm")
    .selectAll('select')
    .attr('disabled', true)

  d3.select(node.parentNode)
    .data()[0].raw_data.actF()
})

$("#prolongCardBtn").click(e => {
  socket.emit('prolongCard')
})

$("select[name='card-valid']").on('change', cardFilter)
$("select[name='filter-value']").on('change', cardFilter)
$("input[name='filter-context']").on('input', cardFilter)

// ------------------- socket comm. ------------------
socket.on('cardId', data => {
  d3.select("#barcode").html(data.idBar)
  d3.select("span[name='cardId']").html(data.id)
})

socket.on('issueCard_rejected', rejectPopUp)

socket.on('issueCard_accepted', userInfo => {
  $("span[name='validDate']").html(userInfo.validUntil)
  // document.forms.issueForm.reset()
  addAction(userInfo)
  issueFormRestoreDefault()
  insertIntoTable(d3.select('#reader-table').select('table'))(userInfo)
  // $("#issueCardBtn").html("Issued!")
  firePopUp("Card issued successfully", 'success')
})

socket.on('getReaderData_accepted', readerInfo => {
  let defaultInsert = insertIntoTable(d3.select('#reader-table').select('table'))
  readerInfo.forEach(addAction)
  defaultInsert(readerInfo)
  // readerInfo.forEach(defaultInsert)
});

socket.on('getCardData_rejected', rejectPopUp)
socket.on('getCardData_accepted', data => {
  if ($("#card-service > div:last-child").hasClass('other-mode')) {
    for (let key in data)
      $("span[name='" + key + "']").html(data[key])
  } else {
    for (let key in data) {
      if (key.endsWith('Date'))
        continue
      if (key == 'barcode' || key == 'cardId')
        continue
      $("span[name='" + key + "']").html(data[key])
    }
    $("select[name='readerType']").val(data.readerType)
    $("span[name='issueDate']").html(moment().format('yyyy-MM-DD'))
    $("input[name='oldId']").val(data.cardId)
  }
})

socket.on('prolongCard_rejected', rejectPopUp)
socket.on('prolongCard_accepted', data => {
  $("#span[name='validDate']").html(data.validUntil)

  d3.select('#reader-table')
    .select('table')
    .select('tbody')
    .selectAll('tr')
    .filter(d => d[0] == data.cardId)
    .selectAll('td')
    .filter((d, i) => i == 4)
    .html(data.validUntil)

  $("button[name='issueAction']").click()

  firePopUp('Đã gia hạn thẻ thành công', 'success')
})

;['cardId',
  'issueCard_rejected',
  'issueCard_accepted',
  'getReaderData_accepted',
  'getCardData_rejected',
  'getCardData_accepted',
  'prolongCard_rejected',
  'prolongCard_accepted'].forEach(socket => socketCleanUp.push(socket))

socket.emit('getReaderData')
orderingColumns(d3.select('#reader-table').select('table'))