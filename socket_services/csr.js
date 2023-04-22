const {socketUser} = require('../control/utils.js')
const fs = require('fs')

const validRenderValue = {
  admin: {
    'card-services': {
      permission: p => p.services,
      path: 'admin/card-services',
      scripts: ['js/services/admin/card-services.js'],
      stylesheet: 'css/services/card-services.css'
    },
    'update-parameters': {
      permission: p => p.libControl,
      path: 'admin/update-parameters',
      scripts: ['js/services/admin/update-parameters.js'],
      stylesheet: 'css/services/update-parameters.css'
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
      scripts: services.scripts,
      stylesheet: services.stylesheet
    })
  })
}

exports.sk_getAdminRenderData = sk_getAdminRenderData