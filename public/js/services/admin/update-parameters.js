var params = undefined;
var default_params = undefined;

function updateParams() {
  let t = d3.select('#parameters')
    .selectAll('.parameter')
    .selectAll('input').nodes()

  t.forEach(elem => {
    elem.value = params[elem.name]
    d3.select(elem).classed('modified', params[elem.name] != default_params[elem.name])
  })

  t[0].max = params.maxAge
  t[1].min = params.minAge
}

// --------------------- dom action --------------------

d3.selectAll('.parameter')
  .append('button')
  .data(d3.select('#parameters')
          .selectAll('.parameter')
          .selectAll('input')
          .nodes()
          .map(t => t.name))
  .html('&#8634;')
  .on('click', (e, d) => {
    params[d] = default_params[d]
    updateParams()
    e.preventDefault();
  })

d3.selectAll('.parameter')
  .on('change', e => {
    let min = e.target.min == '' ? -Infinity : +e.target.min
    let max = e.target.max == '' ? Infinity : +e.target.max

    let v = +e.target.value
    if (!(min <= v && v <= max))
      e.target.value = params[e.target.name]
    else {
      params[e.target.name] = v
      updateParams()
    }
  })

$("#update-param-btn input").click(e => {
  socket.emit('updateParams', params)
})

// ------------------- socket comm. ------------------

socket.on('getParams_accepted', data => {
  default_params = data;
  params = Object.assign({}, data);

  updateParams()
})

socket.on('updateParams_rejected', err => {
  firePopUp(err, 'failure')
})

socket.on('updateParams_accepted', data => {
  default_params = data;
  firePopUp("Parameters updated successfully", 'success')

  updateParams()
})

;['getParams_accepted'].forEach(socket => socketCleanUp.push(socket))

socket.emit('getParams')