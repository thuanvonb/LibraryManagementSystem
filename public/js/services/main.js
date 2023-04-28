const socket = io('/admin')
let renderData = {}
let socketCleanUp = []

const tableHeader = table => table.select('thead').selectAll('th').nodes().map(v => v.getAttribute('name'))

const insertIntoTable = table => newData => {
  let data = table.selectAll('tr').data().filter(t => t)

  if (!(newData instanceof Array))
    newData = [newData]

  let fields = tableHeader(table)
  let serialized = newData.map(d => fields.map(f => d[f] ?? ""))

  table.select("tbody")
    .selectAll('tr')
    .data(data.concat(serialized))
    .join('tr')
    .html(d => d.map(v => "<td>" + v + "</td>").join(''))
}

const tableFilter = table => condition => {
  let fields = tableHeader(table)
  let rows = table.select("tbody").selectAll('tr')

  rows.each(function(){
    let rd = {}
    let row = d3.select(this)

    row.selectAll("td").each(function(v, i){
      rd[fields[i]] = d3.select(this).attr("value")
    })
    
    if (!condition(rd))
      row.style("display", "none")
    else 
      row.style("display", "")
  })
  
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
  if (document.getElementById(id))
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

// --------------------- socket comm. ---------------------
socket.on('renderData_rejected', d => firePopUp(d, 'error'))
socket.on("renderData_accepted", d => {
  renderData[d.name] = d
  loadContent(d.name)
})