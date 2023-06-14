const {socketUser} = require('../security/users.js')
const fs = require('fs')

const validRenderValue = {
  admin: {
    'card-services': {
      permission: p => p.services,
      path: 'admin/card-services',
      scripts: ['js/services/admin/card-services.js'],
      stylesheet: 'css/services/admin/card-services.css'
    },
    'borrow-books': {
      permission: p => p.services,
      path: 'admin/borrow-books',
      scripts: ['js/services/admin/borrow-books.js'],
      stylesheet: 'css/services/admin/borrow-books.css'
    },
    'receive-books': {
      permission: p => p.services,
      path: 'admin/receive-books',
      scripts: ['js/services/admin/receive-books.js'],
      stylesheet: 'css/services/admin/receive-books.css'
    },
    'fine-invoice': {
      permission: p => p.services,
      path: 'admin/fine-invoice',
      scripts: ['js/services/admin/fine-invoice.js'],
      stylesheet: 'css/services/admin/fine-invoice.css'
    },
    'update-parameters': {
      permission: p => p.libControl,
      path: 'admin/update-parameters',
      scripts: ['js/services/admin/update-parameters.js'],
      stylesheet: 'css/services/admin/update-parameters.css'
    },
    'book-browsing': {
      permission: p => 1,
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
    },
    'staffs-manage': {
      permission: p => p.staffControl,
      path: 'admin/staffs-manage',
      scripts: ['js/services/admin/staffs-manage.js'],
      stylesheet: 'css/services/admin/staffs-manage.css'
    },
    'author-genre-manage': {
      permission: p => p.libControl,
      path: 'admin/author-genre-manage',
      scripts: ['js/services/admin/author-genre-manage.js'],
      stylesheet: 'css/services/admin/author-genre-manage.css'
    }
  }
}

const sk_getAdminRenderData = socket => value => {
  if (!validRenderValue.admin[value])
    return socket.emit('renderData_rejected', 'unknown value')
  let services = validRenderValue.admin[value]
  if (!services.permission(socketUser(socket).permission))
    return socket.emit('renderData_rejected', 'no permission')
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