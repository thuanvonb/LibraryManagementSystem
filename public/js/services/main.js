const socket = io('/admin')
let renderData = {}
let socketCleanUp = []

const tableHeader = table => table.select('thead').selectAll('th').nodes().map(v => v.getAttribute('name'))

const serialize = fields => data => data.map(d => fields.map(f => d[f] ?? ""))

const attributeMap = fields => data => {
  let out = {}
  fields.forEach((f, i) => out[f] = data[i]);
  return out;
}

const insertIntoTable = table => newData => {
  let data = table.selectAll('tr').data().filter(t => t)

  if (!(newData instanceof Array))
    newData = [newData]

  let serialized = serialize(tableHeader(table))(newData)

  table.select("tbody")
    .selectAll('tr')
    .data(data.concat(serialized))
    .join('tr')
    .html(d => d.map(v => "<td>" + v + "</td>").join(''))

  table.select("thead th").each(function() {
    if (d3.select(this).attr("class") == "asc")
      tableOrdering(table, d3.select(this).attr("name"), 0)
    else if (d3.select(this).attr('class') == "desc")
      tableOrdering(table, d3.select(this).attr("name"), 1)
  })
}

const tableFilter = table => condition => {
  if (!condition)
    condition = () => true;

  let attr = attributeMap(tableHeader(table))

  let data = table.select("tbody")
    .selectAll('tr')
    .data()

  data.sort((d1, d2) => condition(attr(d2)) - condition(attr(d1)))

  table.select('tbody')
    .selectAll('tr')
    .data(data)
    .join('tr')
    .html(d => d.map(v => "<td>" + v + "</td>").join(''))
    .classed('filtered', d => !condition(attr(d)))
}

const ordering = (table, cri, order) => (d1, d2) => {
  console.log("odering", cri, order)
  if (d1[cri] == d2[cri])
      return 0

  if (order == 0) // asc
  {
    if (d1[cri] > d2[cri])
      return 1
    else 
      return -1
  }
  else // desc
  {
    if (d1[cri] > d2[cri])
      return -1
    else 
      return 1
  }
}

const tableOrdering = (table, cri, order) => {
  let fields = tableHeader(table)
  let attr = attributeMap(fields)

  let data = (table.select('tbody').selectAll('tr').data()).map(attr)
  data.sort(ordering(table, cri, order))
  table.select('tbody')
    .selectAll('tr')
    .data(serialize(fields)(data))
    .join('tr')
    .html(d => d.map(v => "<td>" + v + "</td>").join(''))
}

function firePopUp(msg, type) {
  if (type)
    $("#popup").addClass(type)
  $("#popup span").html(msg)
  $("#popup").addClass('triggered')
  $("#popup div").one('transitionend', e => {
    $("#popup").removeClass('triggered')
    $("#popup").removeClass('success')
    $("#popup").removeClass('failure')
  })
}

const loadScript = container => src => {
  let script = document.createElement('script');
  script.src = src;
  container.appendChild(script)
}

function loadStylesheet(id, href) {
  if (document.getElementById("css_" + id))
    return false;
  let head  = document.getElementsByTagName('head')[0];
  let link  = document.createElement('link');
  link.id   = id;
  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.href = href;
  link.media = 'all';
  head.appendChild(link);
  return true;
}

function loadContent(name) {
  socketCleanUp.forEach(socketName => socket.off(socketName))
  socketCleanUp = []
  let container = document.getElementById("mainContent");
  container.innerHTML = ""
  if (!name)
    return;
  if (!renderData[name]) {
    socket.emit('renderData', name)
    return;
  }

  let d = renderData[name]
  container.innerHTML = d.data;
  d.scripts.forEach(loadScript(container))

  if (d.stylesheet)
    loadStylesheet(name, d.stylesheet)
}

// ------------------- dom actions ----------------
$(".item").click(function(e) {
  let target = $(this)
  if (target.hasClass('active'))
    return;
  $(".item").removeClass('active')
  $(".category").removeClass('active')
  target.addClass('active')
  if (target.prop('tagName') == 'LI')
    target.parent().parent().addClass('active')

  loadContent(target.attr('name'))
})

$(".cat_header").click(function(e) {
  let target = $(this).parent()
  if (target.hasClass('expand'))
    target.children('ul').slideUp(300)
  else
    target.children('ul').slideDown(300)
  if (!target.hasClass('item'))
    target.toggleClass('expand')
})

$("#popup").click(e => {
  $("#popup").removeClass('triggered')
  $("#popup").removeClass('success')
  $("#popup").removeClass('failure')
})

// Sort khi click vao table header
function sortTable(table, hName) {
  table.selectAll("thead th").each(function() {
    if (d3.select(this).attr("name") == hName)
    {
      if (d3.select(this).attr("class") == "none" || d3.select(this).attr("class") == "desc")
      {
        d3.select(this).attr("class", "asc")
        tableOrdering(table, hName, 0)
      }
      else 
      {
        d3.select(this).attr("class", "desc")
        tableOrdering(table, hName, 1)
      }
    }
    else 
      d3.select(this).attr("class", "none")
  })
}

// --------------------- socket comm. ---------------------
socket.on('renderData_rejected', d => firePopUp(d, 'error'))
socket.on("renderData_accepted", d => {
  renderData[d.name] = d
  loadContent(d.name)
})