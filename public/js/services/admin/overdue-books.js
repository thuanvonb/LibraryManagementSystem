// --------------------- dom action --------------------
$("button[name='report']").click(e => {
  socket.emit('reportOverdue', $("input[name='reportDate']").val())
})

$("input[name='reportDate']").val(moment().format('YYYY-MM-DD'))

d3.select("button[name='reportCsv']").on('click', (e, d) => {
  if (!d)
    return firePopUp('Hãy lập 1 báo cáo trước', 'failure')

  downloadCSV(d, 'reportOverdue')
})
// ------------------- socket comm. ------------------

socket.on('reportOverdue_accepted', data => {
  data.report.forEach((d, i) => d.index = i+1)
  let table = d3.select('#overdue-table')

  table.select('tbody').selectAll('tr').remove()
  insertIntoTable(table)(data.report)

  let header = table.select('thead').selectAll('th').nodes().map(v => v.innerHTML)

  data.csv = header + '\n' + data.csv

  d3.select("button[name='reportCsv']").datum(data.csv)
})

;['reportOverdue_accepted'].forEach(socket => socketCleanUp.push(socket))

