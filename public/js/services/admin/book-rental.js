// --------------------- dom action --------------------

$("select[name='month']").val(moment().month()+1)
$("input[name='year']").val(moment().year()).attr('max', moment().year())

$("input[name='year']").on('keypress', e => {
  if (e.key == '.')
    return e.preventDefault()
}).on('focusout', e => {
  let mx = +$("input[name='year']").attr('max')
  let mn = +$("input[name='year']").attr('min')
  let v = +e.target.value;
  if (v > mx)
    $(e.target).val(mx)
  if (v < mn)
    $(e.target).val(mn)
})

$("button[name='report']").click(e => {
  let month = +$("select[name='month']").val()
  let year = +$("input[name='year']").val()
  socket.emit('reportRental', {month, year})
})

d3.select("button[name='reportCsv']").on('click', (e, d) => {
  if (!d)
    return firePopUp('Hãy lập 1 báo cáo trước', 'failure')

  downloadCSV(d, 'reportRental')
})

// ------------------- socket comm. ------------------

socket.on('reportRental_accepted', data => {
  data.report.forEach((d, i) => d.index = i+1)
  let table = d3.select('#rental-table')

  table.select('tbody').selectAll('tr').remove()
  insertIntoTable(table)(data.report)

  let header = table.select('thead').selectAll('th').nodes().map(v => v.innerHTML)

  data.csv = header + '\n' + data.csv

  d3.select("button[name='reportCsv']").datum(data.csv)

  d3.select('span[name="totalRental"]').html(data.total)
})

;['reportRental_accepted'].forEach(socket => socketCleanUp.push(socket))
