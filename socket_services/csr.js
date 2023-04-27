const {socketUser} = require('../control/utils.js')
const fs = require('fs')

const validRenderValue = {
  admin: {
    'card-services': {
      permission: p => p.services,
      path: 'admin/card-services',
      scripts: ['js/services/admin/card-services.js'],
      stylesheet: 'css/services/admin/card-services.css'
    },
    'update-parameters': {
      permission: p => p.libControl,
      path: 'admin/update-parameters',
      scripts: ['js/services/admin/update-parameters.js'],
      stylesheet: 'css/services/admin/update-parameters.css'
    },
    'book-browsing': {
      permission: p => p.libControl,
      path: 'admin/book-browsing',
      scripts: ['js/services/admin/book-browsing.js'],
      stylesheet: 'css/services/admin/book-browsing.css'
    },
    'book-import': {
      permission: p => p.libControl,
      path: 'admin/book-import',
      scripts: ['js/services/admin/book-import.js'],
      stylesheet: 'css/services/admin/book-import.css'
    },
    'book-rental': {
      permission: p => p.report,
      path: 'admin/book-rental',
      scripts: ['js/services/admin/book-rental.js'],
      stylesheet: 'css/services/admin/book-rental.css'
    },
    'overdue-books': {
      permission: p => p.report,
      path: 'admin/overdue-books',
      scripts: ['js/services/admin/overdue-books.js'],
      stylesheet: 'css/services/admin/overdue-books.css'
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