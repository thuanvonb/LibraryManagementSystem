class Database {
  constructor(name, tables) {
    this.name = name;
    this.tables = tables;
    this.tables.forEach(table => {
      this[table.name] = table
    })

    this.database = null
  }

  linkDatabase(databaseConnection) {
    this.database = databaseConnection
  }

  importDatabase(errHdl) {
    if (this.database == null)
      return errHdl("Database was not linked");

    this.tables.forEach(table => {
      let query = 'select ' + table.columns.join(',') + ' from ' + table.name
      this.database.query(query, (err, res) => {
        if (err)
          return errHdl(err);
        table.fromSQL(res)
      })
    })

    // this.refactor();
  }

  refactor() {
    this.tables.forEach(table => table.refactor())
  }
}

module.exports = Database