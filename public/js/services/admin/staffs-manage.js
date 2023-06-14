function updatePreset(parent, target, data) {
  d3.select(parent).datum().changed = +target.checked

  let hasChanged = data.map(v => v.filter((u, i) => i > 0).some(v => v.origin != v.changed))
    .some(t => t)

  d3.select('#presetPermission').selectAll('button')
    .property('disabled', !hasChanged)
}

function processPreset(presets) {
  let bitName = ['canServices', 'canLibControl', 'canReport', 'canStaffControl']
  let data = presets.map(preset => {
    let t = [preset.pmName]

    bitName.forEach((v, i) => {
      let m = (preset.permission >> i) % 2;
      t.push({origin: m, changed: m})
    })

    return t
  })

  d3.select('#presetPermission').selectAll('button')
    .property('disabled', true)

  let tds = d3.select('#preset-permission-table')
    .select('tbody')
    .selectAll('tr')
    .data(data)
    .join('tr')
    .selectAll('td')
    .data(d => d)
    .join('td')

  // console.log(data)

  tds.html((d, i) => i == 0 ? d : "<input type='checkbox'" + (d.origin > 0 ? " checked" : "") + ">")

  tds.selectAll('input')
    .on('change', e => updatePreset(e.target.parentNode, e.target, data))
  tds.filter(d => d.origin != undefined)
    .on('click', e => {
      let t = e.target.children
      if (t.length == 0)
        return;
      e.target.children[0].checked = !e.target.children[0].checked
      updatePreset(e.target, e.target.children[0], data)
    })

  d3.select('select[name="permissionPreset"]')
    .selectAll('option')
    .data([""].concat(data.map(v => v[0])))
    .join('option')
    .html(d => d)
    .attr('value', (d, i) => i)

  d3.select('select[name="permissionPreset"]')
    .on('change', e => {
      let t = +e.target.value - 1
      if (t < 0)
        return;
      d3.select('#forms')
        .select('.item:last-child')
        .selectAll('input')
        .data([0].concat(data[t].slice(1)))
        .property('checked', (d, i) => d.origin > 0)
    })

  d3.select('#forms')
    .select('.item:last-child')
    .selectAll('input')
    .on('input', (e, d) => {
      d3.select('select[name="permissionPreset"]')
        .property('value', 0)

      if (d3.select('#staff-table').select('tbody').select('.selected').empty())
        return;

      // $(e.target.parentNode.children[0]).toggleClass('edited');
    })
}

function staffFormReset() {
  document.forms[0].reset();
  d3.select('#forms')
    .selectAll('input')
    .attr('readonly', null)

  $("#forms button[name='addStaff']").removeClass('hide')
  $("#forms button[name='updateStaff']").addClass('hide')
  $("#forms button[name='removeStaff']").addClass('hide')

  d3.select('#staff-table').select('tbody').selectAll('tr').classed('selected', false)

  d3.select('#forms')
    .select('.subitem:first-child')
    .select('input')
    .attr('disabled', "")

  d3.select('#forms')
    .select('.subitem:last-child')
    .selectAll('label')
    .classed('edited', false)
}

function updateClickEvent(trs) {
  trs.on('click', function(e, d) {
    staffFormReset();

    d3.select(this).classed('selected', true);
    $("#forms").removeClass('hide')

    $("#forms input[name='sName']")
      .val(d.raw_data.sName)
      .attr('readonly', "")

    $("#forms input[name='phone']")
      .val(d.raw_data.phone)
      .attr('readonly', "")

    $("#forms select")
      .val(d.raw_data.presetId ?? 0)

    d3.select("#forms")
      .selectAll(".subitem")
      .select('input')
      .datum(d.raw_data.permission)
      .property('checked', (d, i) => (d >> i) % 2)

    $("#forms button[name='addStaff']").addClass('hide')
    $("#forms button[name='updateStaff']").removeClass('hide')
    if (d.raw_data.permission % 2 == 0)
      $("#forms button[name='removeStaff']").removeClass('hide')
  })
}

function formExtract() {
  let staffName = $("input[name='sName']").val().split(/ +/)
  let phone = $("input[name='phone']").val()

  let pms = +$("select[name='permissionPreset']").val()
  let permission = 0
  d3.select('#forms')
    .select('.item:last-child')
    .selectAll('input')
    .nodes()
    .forEach((node, i) => {
      if (node.checked)
        permission |= (1 << i);
    })

  if (pms > 0)
    permission = null;
  else
    pms = null;

  return {staffName, phone, presetId: pms, permission}
}

// --------------------- dom action --------------------
$("#presetPermission button:first-child").click(e => {
  // console.log(e)
  d3.select('#preset-permission-table')
    .select('tbody')
    .selectAll('tr')
    .selectAll('td')
    .filter(v => v.origin != undefined && v.origin != v.changed)
    .select('input')
    .datum(d => d.origin)
    .property('checked', d => d > 0)

  d3.select('#preset-permission-table')
    .select('tbody')
    .selectAll('tr')
    .selectAll('td')
    .data().forEach(d => d.changed = d.origin)

  d3.select('#presetPermission').selectAll('button')
    .property('disabled', true)
  // $("#presetPermission button:first-child").
})

$("#presetPermission button:last-child").click(e => {
  let d = d3.select('#preset-permission-table')
    .select('tbody')
    .selectAll('tr')
    .selectAll('td')
    .data()
    .filter(t => t.changed != undefined)
    .map(t => t.changed)

  let data = new Array(d.length/4).fill(0).map((v, i) => 
    new Array(4).fill(0).map((_, j) => d[i*4 + j] << j).reduce((a, b) => a + b, 0))
  
  socket.emit('updatePreset', data)
})

$("#staff_action button").click(e => {
  $("#forms").removeClass('hide')
  staffFormReset()
})

$("button[name='cancelBtn']").click(e => {
  $("#forms").addClass('hide')
  staffFormReset()
  d3.select('#staff-table').select('tbody').selectAll('tr').classed('selected', false)
})

$("button[name='addStaff']").click(e => {
  if (!document.forms[0].reportValidity())
    return false;

  let data = formExtract()
  socket.emit('addNewStaff', data)
})

$("button[name='updateStaff']").click(e => {
  let data = formExtract()
  delete data.phone
  delete data.staffName
  data.staffId = d3.select('#staff-table').select('tbody').select('.selected').datum().raw_data.staffId
  socket.emit('updateStaff', data)
})
// ------------------- socket comm. ------------------

socket.on('staffManageData_accepted', data => {
  processPreset(data.preset)

  let trs = insertIntoTable(d3.select('#staff-table'))(data.staffs)
  updateClickEvent(trs)

  if (!data.currStaffFullControl) 
    d3.select("button[name='removeStaff']").remove()
  else {
    d3.select('#forms')
      .select('.subitem:last-child')
      .select('input')
      .attr('disabled', null)
  }
})

socket.on('addNewStaff_rejected', rejectPopUp)
socket.on('addNewStaff_accepted', data => {
  let trs = insertIntoTable(d3.select('#staff-table'))(data)
  staffFormReset()
  updateClickEvent(trs)
  firePopUp('Thêm nhân viên mới thành công', 'success')
})

socket.on('updateStaff_rejected', rejectPopUp)
socket.on('updateStaff_accepted', data => {
  let trs = d3.select('#staff-table')
    .select('tbody')
    .selectAll('tr')
    .filter(d => d.raw_data.staffId == data.staffId)

  let permissionNames = d3.select('#preset-permission-table')
    .select('tbody')
    .selectAll('tr').data().map(v => v[0])

  let permissionName = data.presetId == null ? "" : permissionNames[data.presetId-1]
  trs.datum()[3] = permissionName
  trs.datum().raw_data.presetId = data.presetId;
  trs.datum().raw_data.permission = data.permission

  trs.select('td:last-child').html(permissionName)

  firePopUp('Cập nhật quyền thành công', 'success')

  $("#forms").addClass('hide')
  staffFormReset()
})

socket.on('updatePreset_rejected', rejectPopUp)
socket.on('updatePreset_accepted', data => {
  processPreset(data)
  firePopUp('Cập nhật quyền thành công', 'success')
})

socket.on('removeStaff_rejected', rejectPopUp)
socket.on('removeStaff_accepted', data => {
  d3.select('#staff-table')
    .select('tbody')
    .selectAll('tr')
    .filter(d => d.raw_data.staffId == data)
    .remove()

  firePopUp('Xóa nhân viên thành công', 'success')
  staffFormReset()
})

;['staffManageData_accepted',
  'addNewStaff_accepted',
  'addNewStaff_rejected',
  'updateStaff_accepted',
  'updateStaff_rejected',
  'updatePreset_rejected',
  'updatePreset_accepted',
  'removeStaff_rejected',
  'removeStaff_accepted'].forEach(socket => socketCleanUp.push(socket))

socket.emit('staffManageData')

clickAndThink($("#forms button[name='removeStaff']").get()[0], 'Thôi việc', 'Xác nhận', 5, 
  e => {
    let staffId = d3.select('#staff-table').select('tbody').select('.selected').datum().raw_data.staffId
    socket.emit('removeStaff', staffId)
  }
)