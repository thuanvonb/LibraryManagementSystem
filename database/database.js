class Database {
  constructor(name, tables) {
    this.name = name;
    this.tables = tables;
    this.tables.forEach(table => {
      this[table.name] = table
    })

    this.database = null
    this.parameters = null;
  }

  linkDatabase(databaseConnection) {
    this.database = databaseConnection
  }

  importDatabase(completion, errHdl) {
    if (this.database == null)
      return errHdl("Database was not linked");

    let t = this.tables.length + 1;
    this.tables.forEach(table => {
      let query = 'select ' + table.columns.join(',') + ' from ' + table.name
      this.database.query(query, (err, res) => {
        if (err)
          return errHdl(err);
        table.fromSQL(res)
        t -= 1;
        if (t == 0) {
          this.refactor()
          if (completion)
            completion(this)
        }
      })
    })

    this.database.query('select * from Parameters', (err, res) => {
      if (err)
        return errHdl(err)
      this.parameters = res[0]
      t -= 1;
      if (t == 0) {
        this.refactor()
        if (completion)
          completion(this)
      }
    })
  }

  insert(table, data) {
    return new Promise((resolve, reject) => {
      let query = this[table].insert(data)
      this.database.query(query, (err, res) => {
        if (err) {
          this[table].respond()
          return reject(err)
        }
        let out = this[table].respond('I' + (data instanceof Array ? "M" : ""))
        resolve(out)
      })
    })
  }

  refactor() {
    this.tables.forEach(table => table.refactor())
  }
}

module.exports = Database