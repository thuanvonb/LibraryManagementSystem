const {socketUser} = require('../control/utils.js')
const fs = require('fs')

const validRenderValue = {
  admin: {
    'card-services': {
      permission: p => p.services,
      path: 'admin/card-services',
      scripts: ['js/services/admin/card-services.js']
    }
  }
}

const sk_getAdminRenderData = socket => value => {
  if (!validRenderValue.admin[value])
    socket.emit('renderData_rejected', 'unknown value')
  let services = validRenderValue.admin[value]
  if (!services.permission(socketUser(socket).permission))
    socket.emit('renderData_rejected', 'no permission')
  // console.log("/views/partials/" + services.path)
  fs.readFile("views/partials/" + services.path, 'utf8', (err, data) => {
    if (err) {
      socket.emit('renderData_reject', err)
      return;
    }
    socket.emit('renderData_accepted', {
      name: value,
      data: data,
      scripts: services.scripts
    })
  })
}

exports.sk_getAdminRenderData = sk_getAdminRenderData