var bookData = []

function updateFilter(e=undefined) {
  let nameMap = {
    name: "bName",
    author: "aName",
    genre: 'gName',
    isbn: 'isbn'
  }
  let cond = x => true;
  if (e != undefined) {
    let name = nameMap[e.target.getAttribute('name')]
    let val = normalize(e.target.value)
    let dist = longestCommonSubsequence(val)
    if (val != "") {
      cond = d => name != 'aName' ? 
        (dist(normalize(d[name])) == val.length) : 
        (d[name].split(', ').some(author => dist(normalize(author)) == val.length))
    }
  }

  tableFilter(d3.select("#book-table"))(cond)
}

function clearFilter() {
  d3.select('#filter-input')
    .selectAll('input')
    .property('value', "")

  updateFilter()
}

// --------------------- dom action --------------------
$("#filter-category select").on('change', e => {
  clearFilter()
  let v = e.target.value
  $("#filter-input div").removeClass('show')
  $("#" + v + "_filter").addClass('show')
})

$("#filter-input input").on('input', updateFilter)
$("#filter-input input").on('focusout', updateFilter)

$("#filter-action button").click(clearFilter)

$("#borrow-books-field button").click(e => {
  $("#borrow-books-field").removeClass('show')
})

// ------------------- socket comm. ------------------

socket.on('getBookData_accepted', data => {
  bookData = data.map(d => {
    let r = d.publishments.reduce((acc, pb) => acc + pb.remaining, 0)
    let remaining = "Còn lại: "
    if (r == 0)
      remaining = 'Hết sách'
    else
      remaining += r

    genreList(d.gName)
    d.authors.reduce((fn, author) => fn(author), authorList)

    return {isbn: d.isbn,
      titleId: d.titleId,
      bName: d.bName,
      gName: d.gName,
      aName: d.authors.join(', '),
      state: remaining
    }
  })

  insertIntoTable(d3.select("#book-table"))(bookData)
    .on('click', (e, d) => {
      socket.emit('getBookBorrowContext', d[1])
    })
})

socket.on('getBookBorrowContext_rejected', rejectPopUp)
socket.on('getBookBorrowContext_accepted', data => {
  $("#borrow-books-field").addClass('show')
  d3.select('#borrowed-books-table').select('tbody').selectAll('tr').remove()
  data.context.forEach((v, i) => v.index = i+1)
  insertIntoTable(d3.select('#borrowed-books-table'))(data.context)

  let n = +d3.select("#bookid-table").select('th').attr('colspan')

  let t = Math.ceil(data.status.length / n)
  let d = new Array(t).fill(0)
    .map((v, i) => new Array(n).fill(0).map((_, j) => data.status[i*n+j]))

  console.log(d)

  d3.select("#bookid-table").select('tbody')
    .selectAll('tr')
    .data(d)
    .join('tr')
    .selectAll('td')
    .data(d => d)
    .join('td')
    .html(d => d ? d.bookId : "&nbsp;")
    .classed('not-avaiable', d => d ? !d.available : false)
})

;['getBookData_accepted',
  'getBookBorrowContext_rejected',
  'getBookBorrowContext_accepted'].forEach(socket => socketCleanUp.push(socket))

orderingColumns(d3.select("#book-table"))

var genreList = initAutoComplete(document.getElementById('genre_filter'))([])
var authorList = initAutoComplete(document.getElementById('author_filter'))([])

socket.emit('getBookData')