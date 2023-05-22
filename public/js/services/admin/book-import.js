var bookData = []
var currBook = undefined

function addAuthor(d3parent, authorName) {
  let chr = d3parent.selectChildren().nodes()
  let div = d3parent.append('div')
    .classed('added-author', true)
  div.append('span')
    .classed('author', true)
    .html(authorName)
  div.append('span')
    .html('Xóa')
    .on('click', e => {
      div.remove()
    })
}

function resetForms() {
  document.forms[0].reset()
  document.forms[1].reset()
  $(".added-author").remove()
  $("#new-book-title").removeClass('show')
  $("#new-books-publish").removeClass('show')
}

function trEvent(e, d){
  currBook = d.raw_data
  $("span[name='bName']").html(d.raw_data.bName)
  $("span[name='authors']").html(d.raw_data.authorNames)
  $("#import-container > .slider").addClass('active')
  e.stopImmediatePropagation()

  let table = d3.select('#books-publish-table').select('table')
  table.select('tbody').selectAll('tr').remove()

  if (!currBook.publishments)
    currBook.publishments = []

  insertIntoTable(table)(currBook.publishments)
  makePublishEditable()
}

function makePublishEditable() {
  let rows = d3.select('#books-publish-table').select('table').select('tbody').selectAll('tr')

  let tds = rows.filter(d => d.raw_data.canImport).selectAll('td')

  tds.filter((d, i) => i == 6)
    .attr('contenteditable', true)
    .classed('editable', true)
    .html('0')
    .on('input', e => {
      let text = e.target.innerHTML
      text = text.replaceAll(/\D/g, "")
      if (isNaN(text) || text == "")
        text = 0
      e.target.innerHTML = +text
      placeCaretAtEnd(e.target)
    })

  tds.filter((d, i) => i == 7)
    .classed('clickable', true)
    .html('+')
    .on('click', e => {
      let data = d3.select(e.target.parentNode).datum().raw_data
      let importData = {
        titleId: currBook.titleId,
        publishment: data.publishment,
        amount: +e.target.parentNode.children.item(6).innerHTML
      }

      if (importData.amount == 0)
        return;

      socket.emit('importBook', importData)
    }) 
}

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

$("#backBtn").click(e => {
  $("#import-container > .slider").removeClass('active')
  currBook = undefined
})

$("button[name='addTitle']").click(e => {
  $("#new-book-title").addClass('show')
})

$("button[name='addPublish']").click(e => {
  $("#new-books-publish").addClass('show')
})

$("button[name='cancel']").click(e => {
  resetForms()
  e.preventDefault()
})

$("input[name='addAuthor']").click(e => {
  let inp = $("div[name='author'] input")
  addAuthor(d3.select("#authors"), inp.val())
  inp.val("")
})

$("button[name='addBook_req']").click(e => {
  e.preventDefault()
  // $("input[name='isbn']").get()[0].setCustomValidity('')
  if (!document.forms[0].reportValidity())
    return;
  let data = $("#new-book-title form").serializeArray()
  let out = {}
  data.forEach(d => out[d.name] = d.value)

  out.isbn = verifyISBN(out.isbn)
  if (out.isbn == null) {
    // $("input[name='isbn']").get()[0].setCustomValidity('ISBN không hợp lệ')
    // document.forms[0].reportValidity()
    // $("input[name='isbn']").get()[0].setCustomValidity('')
    return firePopUp('ISBN không hợp lệ', 'failure')
  }

  out.authors = d3.selectAll('.added-author').selectAll('.author').nodes().map(v => v.innerHTML)

  if (out.authors.length == 0)
    return firePopUp('Thêm ít nhất 1 tác giả', 'failure')

  socket.emit('addTitle', out)
})

$("input[name='publishment']").on('input', e => {
  let target = $(e.target)
  target.parent().removeClass('error')
  if (target.val() == "")
    return
  let publishment = +target.val()
  if (isNaN(publishment) || publishment < target.attr('min') || currBook.publishments.some(pb => pb.publishment == publishment))
    target.parent().addClass('error')

  let prevPublishment = currBook.publishments.reduce((acc, v) => acc.publishment < v.publishment && v.publishment <= publishment ? v : acc, {publishment: -1})
  let nextPublishment = currBook.publishments.reduce((acc, v) => acc.publishment > v.publishment && v.publishment >= publishment ? v : acc, {publishment: Math.min()})
  
  let minYear = prevPublishment.publishYear ?? 2000
  let maxYear = nextPublishment.publishYear ?? moment().year()

  $("input[name='publishYear']").attr({min: minYear, max: maxYear})
})

$("button[name='addPublish_req']").click(e => {
  if (!document.forms[1].reportValidity())
    return;
  let data = $("#new-books-publish form").serializeArray()
  let out = {}
  data.map((v, i) => i == 3 ? v : ({
    name: v.name,
    value: +v.value
  })).forEach(d => out[d.name] = d.value)
  // console.log(out)
  out.titleId = currBook.titleId

  socket.emit('addPublish', out)

  e.preventDefault()
})

// ------------------- socket comm. ------------------

socket.on('addTitle_rejected', err => firePopUp(err, 'failure'))
socket.on('addTitle_accepted', data => {
  let authors = data.authorNames
  data.authorNames = data.authorNames.join(', ')
  firePopUp("Sách đã được nhập thành công", 'success')
  insertIntoTable(d3.select("#book-title-table").select('table'))(data)
    .on('click', trEvent)
  resetForms()
  genreList(data.gName)
  authors.reduce((fn, dat) => fn(dat), authorList)
})

socket.on('getBookData_accepted', data => {
  bookData = data
  let insert = insertIntoTable(d3.select("#book-title-table").select('table'))
  bookData.forEach(d => d.authorNames = d.authors.join(', '))
  insert(bookData)
    .on('click', trEvent)
  bookData.forEach(book => {
    book.authors.reduce((fn, a) => fn(a), authorList)
    genreList(book.gName)
    book.publishments.reduce((fn, d) => fn(d.publisher), publisherList)
  })
})

socket.on('addPublish_rejected', error => firePopUp(error, 'failure'))
socket.on('addPublish_accepted', data => {
  let table = d3.select('#books-publish-table').select('table')
  insertIntoTable(table)(data)
  currBook.publishments.push(data)
  publisherList(data.publisher)
  $("#new-books-publish").removeClass('show')
  document.forms[1].reset()
  makePublishEditable()
  firePopUp("Đã thêm đợt xuất bản thành công", 'success')
})

socket.on('importBook_accepted', data => {
  currBook.publishments.forEach(pub => {
    if (pub.publishment == data.publishment) {
      pub.imported += data.amount
      pub.remaining += data.amount
    }
  })

  let table = d3.select('#books-publish-table').select('table')
  table.select('tbody').selectAll('tr').remove()
  insertIntoTable(table)(currBook.publishments)
  makePublishEditable()

  firePopUp('Đã nhập thêm ' + data.amount + " quyển", 'success')
})
socket.on('importBook_rejected', error => firePopUp(error, 'failure'))

;['addTitle_rejected',
  'addTitle_accepted',
  'getBookData_accepted',
  'addPublish_rejected',
  'addPublish_accepted',
  'importBook_accepted',
  'importBook_rejected'].forEach(socket => socketCleanUp.push(socket))

orderingColumns(d3.select("#book-title-table"))

var authorList = initAutoComplete($(".autocomplete[name='author']").get()[0])([])
var genreList = initAutoComplete($(".autocomplete[name='genres']").get()[0])([])
var publisherList = initAutoComplete($(".autocomplete[name='publisher']").get()[0])([])

socket.emit('getBookData')