const socket = io('/admin')
let renderData = {}
let socketCleanUp = []

const insertIntoTable = (table, otherFields) => (data) => {
  let serialized = []
  for (let key in data)
    serialized.push({key, value: data[key]})
  serialized = serialized.concat(otherFields)
  // console.log(serialized)
  return table.append('tr')
    .selectAll('td')
    .data(serialized)
    .join('td')
    .html(d => d.value)
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
  d.scripts.forEach(src => {
    let script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script)
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

// --------------------- socket comm. ---------------------
socket.on('renderData_rejected', d => firePopUp(d, 'error'))
socket.on("renderData_accepted", d => {
  renderData[d.name] = d
  loadContent(d.name)
})