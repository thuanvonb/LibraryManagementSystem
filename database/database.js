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

    let promise = Promise.resolve();
    this.tables.reduce((accP, table) => accP.then(e => {
      return new Promise((resolve, reject) => {
        let query = 'select ' + table.columns.join(',') + ' from ' + table.name
        this.database.query(query, (err, res) => {
          if (err)
            return reject(err);
          resolve(table.fromSQL(res))
        })
      }).then(e => {
        if (!table.primaryAuto)
          return Promise.resolve()
        return new Promise((resolve, reject) => {
          let query = "select `auto_increment` from information_schema.tables where table_schema = 'se104' and table_name = '" + table.name + "'"
          this.database.query(query, (err, res) => {
            if (err)
              return reject(err);
            table.auto_increment = res[0].AUTO_INCREMENT;
            // console.log(table.name, table.auto_increment)
            resolve()
          })
        })
      })
    }), promise).then(e => new Promise((resolve, reject) => {
      this.database.query('select * from Parameters', (err, res) => {
        if (err)
          return reject(err)
        this.parameters = res[0]
        resolve()
      })
    })).then(done => {
      this.refactor()
      if (completion)
        completion(this);
    }, error => {
      console.log(error)
      errHdl(error)
    })
    
  }

  insert(table, data) {
    return new Promise((resolve, reject) => {
      let query = this[table].insert(data, reject)
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