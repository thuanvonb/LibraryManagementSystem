const socket = io('/admin')
let renderData = {}
let socketCleanUp = []

const rejectPopUp = error => firePopUp(error, 'failure')

function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}

const tableHeader = table => table.select('thead').selectAll('th').nodes().map(v => v.getAttribute('name'))

const serialize = fields => data => data.map(d => {
  let serialized = fields.map(f => d[f] ?? "")
  serialized['raw_data'] = d
  return serialized
})

const attributeMap = fields => data => {
  if (data.raw_data)
    return data.raw_data

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

  return table.select("tbody")
    .selectAll('tr')
}

const tableFilter = table => condition => {
  if (!condition)
    condition = () => true;

  let attr = attributeMap(tableHeader(table))

  let data = table.select("tbody")
    .selectAll('tr')
    .data()

  let orderF = ordering(table)

  data.sort((d1, d2) => {
    let c1 = condition(attr(d1))
    let c2 = condition(attr(d2))

    if (c1 != c2)
      return c2 - c1;

    return orderF(attr(d1), attr(d2))
  })

  table.data([condition])

  table.select('tbody')
    .selectAll('tr')
    .data(data)
    .join('tr')
    .html(d => d.map(v => "<td>" + v + "</td>").join(''))
    .classed('filtered', d => {
      d.filtered = !condition(attr(d))
      return d.filtered
    })
}

const ordering = table => {
  let asc = table.select('thead').select('.asc').node()
  let desc = table.select('thead').select('.desc').node()

  if (!asc && !desc)
    return (d1, d2) => 1

  let order = asc ? 1 : -1;
  let name = asc ? asc.getAttribute('name') : desc.getAttribute('name')

  return (d1, d2) => (d1[name] < d2[name] ? -order : (d1[name] > d2[name] ? order : 0))
}

const tableOrdering = table => {
  let cond = table.data()
  if (cond != undefined)
    cond = cond[0]
  tableFilter(table)(d => 1)
  let fields = tableHeader(table)
  let attr = attributeMap(fields)
  
  let data = (table.select('tbody').selectAll('tr').data()).map(attr)
  data.sort(ordering(table))

  table.select('tbody')
    .selectAll('tr')
    .data(serialize(fields)(data))
    .join('tr')
    .html(d => d.map(v => "<td>" + v + "</td>").join(''))
  tableFilter(table)(cond)
}

function orderingColumns(table) {
  let head = table.select('thead')
  head.selectAll('th').on('click', e => {
    let p = d3.select(e.target)
    let asc = p.classed('asc')
    let desc = p.classed('desc')
    head.selectAll('th')
      .classed('asc', false)
      .classed('desc', false)

    if (asc || desc) {
      p.classed('asc', desc)
      p.classed('desc', asc)
    } else
      p.classed('asc', true)

    tableOrdering(table)
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
  if (document.getElementById("css_" + id))
    return false;
  let head  = document.getElementsByTagName('head')[0];
  let link  = document.createElement('link');
  link.id   = "css_" + id;
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

  sessionStorage.setItem('active-screen', name)

  let d = renderData[name]
  container.innerHTML = d.data;
  d.scripts.forEach(loadScript(container))

  if (d.stylesheet)
    loadStylesheet(name, d.stylesheet)
}

function clickAndThink(elem, idle, clicked, wait, cb) {
  $(elem).click(e => {
    let elem = $(e.target)
    let invalidity =  elem.get()[0].className.split(/\s+/).filter(v => v.startsWith('invalid'))[0] ?? 'invalid_' + Math.floor(Math.random()*100000)
    if (elem.hasClass(invalidity)){
      elem.html(idle)
      elem.removeClass(invalidity)
      return;
    }

    if (elem.hasClass('valid')) {
      elem.removeClass('valid')
      return cb(e);
    }

    elem.html(clicked + ` (${wait})`)
    elem.addClass(invalidity)
    frameDelay.addMulti(t => {
      if (!elem.hasClass(invalidity))
        return;
      if (t < wait-1)
        elem.html(`${clicked} (${wait-1-t})`)
      else {
        elem.html(clicked)
        elem.removeClass(invalidity)
        elem.addClass('valid')
      }
    }, wait, 1000)
  })

  $(elem).on('mouseout', e => {
    $(e.target).html(idle)
    $(e.target).removeClass((i, cls) => cls.split(" ").filter(v => v.startsWith('invalid')).join(' '))
  })
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

$("#accountOption li:last-child").click(e => {
  window.location.href = '/logout'
})

// --------------------- socket comm. ---------------------
socket.on('renderData_rejected', d => rejectPopUp(d))
socket.on("renderData_accepted", d => {
  renderData[d.name] = d
  loadContent(d.name)
})

socket.on('serverMsg', msg => {
  firePopUp(msg)
})

socket.on('redirect', dest => window.location.href = dest)

let screen = sessionStorage.getItem('active-screen')
if (screen != null) {
  let item = $(".item[name='" + screen + "']")
  if (item.length != 0)
    $(".item[name='" + screen + "']").click()
  else {
    rejectPopUp('Quyền truy cập của bạn đến trang này không còn nữa')
    sessionStorage.removeItem('active-screen')
  }
}

