const socket = io('/admin')
let renderData = {}
let socketCleanUp = []

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

const normalize = x => x.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

const levenshteinDistance = (s, t) => {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] = i === 0 ? j : Math.min(
        arr[i - 1][j] + 1,
        arr[i][j - 1] + 1,
        arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
      );
    }
  }
  return arr[t.length][s.length];
};

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

  data.sort((d1, d2) => condition(attr(d2)) - condition(attr(d1)))

  table.select('tbody')
    .selectAll('tr')
    .data(data)
    .join('tr')
    .html(d => d.map(v => "<td>" + v + "</td>").join(''))
    .classed('filtered', d => !condition(attr(d)))
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
  let fields = tableHeader(table)
  let attr = attributeMap(fields)
  
  let data = (table.select('tbody').selectAll('tr').data()).map(attr)
  data.sort(ordering(table))

  table.select('tbody')
    .selectAll('tr')
    .data(serialize(fields)(data))
    .join('tr')
    .html(d => d.map(v => "<td>" + v + "</td>").join(''))
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
  console.log(msg, type)
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

const filterData = selector => onItemClick => list => text => {
  if (text.length < 1)
    return [];
  let t = list.map(item => ({
    text: item.text,
    distance: levenshteinDistance(item.normalized, text)
  }))
  t.sort((a, b) => a.distance - b.distance)
  let data = t.filter((v, i) => i <= 5 && v.distance < Math.max(v.text.length, text.length))
  selector.selectAll('div')
    .data(data)
    .join('div')
    .html(d => d.text)
    .on('click', (e, d) => {
      onItemClick(d.text)
    })
}

const initAutoComplete = dom => list => {
  let domNode = d3.select(dom)
  let input = $(domNode.select('input').node())
  let autoList = domNode.append('div')

  let list2 = list.map(st => ({
    text: st,
    normalized: normalize(st)
  }))

  let autoCompleteBase = filterData(autoList)(text => {
    input.val(text)
    autoList.selectChildren().remove()
  })

  input.on('input', e => {
    autoList.selectChildren().remove()
    autoCompleteBase(list2)(normalize(e.target.value))
  })

  input.on('focusout', e => {
    // autoList.selectChildren().remove()
    setTimeout(e => {
      autoList.selectChildren().remove()
    }, 100)
  })

  input.on('focusin', e => {
    autoCompleteBase(list2)(normalize(e.target.value))
  })

  let addItem = item => {
    if (list2.some(v => v.text == item))
      return addItem
    // list.push(item)
    list2.push({
      text: item,
      normalized: normalize(item)
    })
    return addItem
  }
  return addItem
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