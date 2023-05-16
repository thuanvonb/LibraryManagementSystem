const moment = require("moment")

class Agg {
  static startMin = Math.min()
  static startMax = Math.max()
  static startAvg = 0
  static startCount = 0
  static startSum = 0

  static min(col) {
    return (acc, d) => Math.min(acc, d[col] ?? Math.min())
  }

  static max(col) {
    return (acc, d) => Math.max(acc, d[col] ?? Math.max())
  }

  static sum(col) {
    return (acc, d) => acc + (d[col] ?? 0)
  }

  static count(col='*') {
    return (acc, d) => acc + (col == '*' ? 1 : d[col] != null)
  }
}

function equalObj(objA, objB) {
  if (Object.keys(objA).length != Object.keys(objB).length)
    return false;
  for (let k in objA) {
    if (!(k in objB) || objA[k] != objB[k])
      return false
  }
  return true;
}

class Table {
  constructor(name="noName", columns=[], data=[]) {
    this.name = name;
    this.columns = columns.map(a => a.toLowerCase())
    this.primary = []
    this.data = data
    this.foreigns = {}
    this.grouped = undefined;
    this.groups = {};
    this.primaryAuto = false;
    this.pending = [];
  }

  isEmpty() {
    if (this.grouped) {
      for (let group in this.groups) {
        if (!this.isEmpty())
          return false;
      }
      return true;
    }
    return this.data.length == 0;
  }

  isNotEmpty() {
    return !this.isEmpty()
  }

  hasColumn(name) {
    return this.columns.includes(name.toLowerCase())
  }

  addPrimaryKey(primarykey) {
    if (primarykey.some(key => !this.hasColumn(key)))
      throw "Unknown column name"
    this.primary = primarykey.map(pk => pk.toLowerCase())
  }

  addForeignKey(attrF, tableT, attrT, name) {
    if (!this.hasColumn(attrF))
      throw "Unknown column name in table " + this.name
    this.foreigns[attrF.toLowerCase()] = {tableT, attrT: attrT.toLowerCase(), name: name.toLowerCase()}
  }

  autoPrimary() {
    this.primaryAuto = true;
  }

  fromSQL(data) {
    data.forEach(d => {
      let m = {}
      for (let at in d) {
        if (!this.columns.includes(at.toLowerCase()))
          continue;
        if (d[at] instanceof Date)
          m[at.toLowerCase()] = moment(d[at])
        else if (typeof d[at] == 'string' && d[at].match(/\d+\.\d{2}/))
          m[at.toLowerCase()] = +d[at]
        else
          m[at.toLowerCase()] = d[at]
      }
      this.data.push(m)
    })
  }

  ungroupedEnsure() {
    if (this.grouped)
      throw "The table has been grouped. Call Table.ungroup() first.";
  }

  groupedEnsure() {
    if (!this.grouped)
      throw "The table has to be grouped. Call Table.groupBy(...) first.";
  }

  // mutable
  project(columnName) {
    this.ungroupedEnsure()
    return Table.fromData(this.data.map(d => d[columnName.toLowerCase()]).filter(t => t != null))
  }

  // mutable
  where(cb) {
    this.ungroupedEnsure()
    let nData = this.data.filter(d => cb(d, {
      exists: (queryRes => queryRes.isNotEmpty()),
      notexists: (queryRes => queryRes.isEmpty()),
      in: ((col, queryRes) => Table.#contain(d, col, queryRes)),
      notin: ((col, queryRes) => !Table.#contain(d, col, queryRes))
    }))
    return Table.fromData(nData)
  }

  // immutable
  select(...columns_) {
    this.ungroupedEnsure()
    let columns = columns_.map(c => c.toLowerCase())
    if (columns.some(c => !this.hasColumn(c)))
      throw "Unknown column name"
    let data2 = []
    this.data.forEach(d => {
      let m = {}
      columns.forEach(col => m[col] = d[col])
      data2.push(m)
    })
    return Table.fromData(data2)
  }

  // immutable
  expand(columnName) {
    this.ungroupedEnsure()
    columnName = columnName.toLowerCase()
    let data = []
    this.data.forEach(d => {
      let m = {}
      for (let col in d) {
        if (col != columnName)
          m[col] = d[col]
        else {
          for (let col2 in d[col])
            m[col + '.' + col2] = d[col][col2]
        }
      }
      data.push(m)
    })
    return Table.fromData(data)
  }

  // immutable
  join(columnL, columnR, table, jointName, leftJoin=false) {
    this.ungroupedEnsure()
    columnL = columnL.toLowerCase()
    columnR = columnR.toLowerCase()
    let data = []
    this.data.forEach(d => {
      let t = table.where(oth => oth[columnR] == d[columnL])
      if (t.data.length == 0 && leftJoin) {
        let m = Object.assign({}, d)
        m[jointName] = null
        data.push(m)
        return
      }

      t.data.forEach(d2 => {
        let m = Object.assign({}, d)
        m[jointName] = d2;
        data.push(m)
      })
    })
    return Table.fromData(data)
  }

  // mutable
  offset(n) {
    this.ungroupedEnsure()
    return Table.fromData(this.data.filter((d, i) => i >= n))
  }

  // mutable
  fetch(n) {
    this.ungroupedEnsure()
    return Table.fromData(this.data.filter((d, i) => i < n))
  }

  // immutable
  rename(dict) {
    this.ungroupedEnsure()
    let data = []
    this.data.forEach(d => {
      let m = {}
      for (let col in d) {
        if (dict.hasOwnProperty(col))
          m[dict[col]] = d[col]
        else
          m[col] = d[col]
      }
      data.push(m)
    })
    return Table.fromData(data)
  }
  
  // mutable
  groupBy(...cols) {
    this.ungroupedEnsure()
    let t = Table.fromData(this.data)
    t.grouped = cols;
    t.groups = {}
    t.data.forEach(d => {
      let m = {}
      cols.forEach(col => {
        m[col] = d[col];
      })
      let mjson = JSON.stringify(m)
      if (!(mjson in t.groups))
        t.groups[mjson] = []
      t.groups[mjson].push(d)
    })

    for (let group in t.groups)
      t.groups[group] = Table.fromData(t.groups[group])
    t.data = []
    return t;
  }

  // mutable
  ungroup() {
    this.groupedEnsure()
    let data = []
    for (let group in this.groups)
      data = data.concat(this.groups[group].data)
    return Table.fromData(data)
  }

  #groupMapping(mapping) {
    this.groupedEnsure()
    let t = new Table()
    t.columns = Array.from(this.columns)
    t.grouped = Array.from(this.grouped);
    t.groups = {}
    for (let group in this.groups)
      t.groups[group] = mapping(this.groups[group])
    return t;
  }

  // mutable
  orderBy(inOrderF, reversed=false) {
    if (!this.grouped) {
      let data = this.data.map(t => t)
      let d = reversed ? -1 : 1
      data.sort((a, b) => d * (inOrderF(a, b) ? -1 : 1))
      return Table.fromData(data)
    }
    return this.#groupMapping(table => table.orderBy(inOrderF, reversed));
  }

  // immutable
  aggregation(...aggregations) {
    // aggregations = [aggreFunction, startVal, name], ...
    if (!this.grouped) {
      let dataOut = {}
      aggregations.forEach(agg => {
        dataOut[agg[2]] = this.data.reduce(agg[0], agg[1])
      })
      return Table.fromData([dataOut])
    }
    let data = []
    for (let group in this.groups) {
      let m = {}
      let g = this.groups[group]
      if (this.groups[group].isEmpty())
        continue;
      this.grouped.forEach(col => m[col] = g.data[0][col])
      if (aggregations.length > 0)
        m = Object.assign(m, g.aggregation(...aggregations).data[0])
      data.push(m)
    }
    return Table.fromData(data)
  }

  // mutable
  distinct() {
    let dataOut = []
    for (let i = 0; i < this.data.length; ++i) {
      for (let j = 0; j < this.data.length; ++j) {
        if (!equalObj(this.data[i], this.data[j]))
          continue
        if (i == j)
          dataOut.push(this.data[i])
        break;
      }
    }
    return Table.fromData(dataOut)
  }

  forEach(fn) {
    this.ungroupedEnsure()
    this.data.forEach(fn)
  }

  map(fn) {
    this.ungroupedEnsure()
    return this.data.map(fn)
  }

  // immutable
  fmap(...mapping) {
    this.ungroupedEnsure()
    let data = []
    this.data.forEach(d => {
      let m = {}
      mapping.forEach(mapF => {
        m[mapF[1]] = mapF[0](d)
      })
      data.push(m)
    })
    return Table.fromData(data)
  }

  // immutable
  cmap(colName, mapF) {
    this.ungroupedEnsure()
    let data = []
    this.data.forEach((d, i) => {
      let m = Object.assign({}, d)
      m[colName] = mapF(d, i, this.data.length)
      data.push(m)
    })
    return Table.fromData(data)
  }

  // immutable
  calc(calcF, name) {
    this.ungroupedEnsure()
    let data = []
    this.data.forEach((d, i) => {
      let m = Object.assign({}, d)
      m[name] = calcF(d, i, this.data.length)
      data.push(m)
    })
    return Table.fromData(data)
  }

  // immutable
  ranking(col, dense=true) {
    if (!this.grouped) {
      let data = []
      let prev = null;
      let t = 0;
      this.data.forEach((d, i) => {
        let m = Object.assign({}, d)
        if (prev != d[col]) {
          prev = d[col]
          t = dense ? (t + 1) : (i + 1)
        }
        m['rank'] = t;
        data.push(m)
      })
      return Table.fromData(data)
    }
    return this.#groupMapping(table => table.ranking(col, dense))
  }

  // mutable
  having(condition) {
    if (!this.grouped) {
      let satisfied = condition(Table.fromData(this.data.map(t => Object.assign({}, t))))
      if (satisfied)
        return this
      return new Table()
    }
    return this.#groupMapping(table => table.having(condition))
  }

  validSetOperation(other) {
    if (this.columns.some((col, i) => col != other.columns[i]))
      throw "Cannot perform set operation action"
  }

  union(other) {
    this.validSetOperation(other)
    return Table.fromData(this.data.concat(other.data)).distinct()
  }

  except(other) {
    this.validSetOperation(other)
    return Table.fromData(this.data.filter(d1 => !other.data.some(d2 => equalObj(d1, d2)))).distinct()
  }

  intersect(other) {
    this.validSetOperation(other)
    return Table.fromData(this.data.filter(d1 => other.data.some(d2 => equalObj(d1, d2)))).distinct()
  }

  exists(otherQuery) {
    return Table.fromData(this.data.filter(d => otherQuery(d).isNotEmpty()))
  }

  notexists(otherQuery) {
    return Table.fromData(this.data.filter(d => otherQuery(d).isEmpty()))
  }

  static #contain(data, cols, table) {
    if (cols.some(col => !table.columns.includes(col)))
      throw "The desired column is not on the subquery"

    return table.data.some(d => cols.every(col => data[col] == d[col]))
  }

  in(cols, otherQuery) {
    return Table.fromData(this.data.filter(d => Table.#contain(d, cols, otherQuery(d))))
  }

  notin(cols, otherQuery) {
    return Table.fromData(this.data.filter(d => !Table.#contain(d, cols, otherQuery(d))))
  }

  respond(actionType) {
    if (!this.pending)
      return;
    let output = undefined
    if (actionType == 'I' || actionType == 'IM') {
      this.data = this.data.concat(this.pending)
      if (actionType == 'I')
        output = this.pending[0];
      else
        output = this.pending
    }

    this.pending = []
    return output;
  }

  insert(data, errHdl) {
    if (data instanceof Array) {
      let queries = data.map(datum => this.insert(datum, errHdl))
      let q = queries[0].substr(0, queries[0].lastIndexOf('(')) + queries.map(q => q.substr(q.lastIndexOf('('))).join()
      // console.log(data, queries)
      return q;
    }
    let data2 = {}
    for (let field in data)
      data2[field.toLowerCase()] = data[field];
    this.columns.forEach(col => {
      if (!(col in data2))
        data2[col] = null;
    })
    
    if (this.primary.length > 0) {
      if (this.primaryAuto)
        this.primary.forEach(pk => data2[pk] = null)
      else {
        if (this.primary.some(pk => data2[pk] == null))
          return errHdl(`Table ${this.name}: Primary key's attributes cannot be null`)
        if (this.where(d => this.primary.every(pk => (d[pk] == data2[pk]))).isNotEmpty())
          return errHdl(`Table ${this.name}: Primary key has to be unique`)
      }
    }

    let columns = []
    let dataQ = []
    for (let col in data2) {
      columns.push(col)
      let d = data2[col]
      if (moment.isMoment(d))
        dataQ.push(`'${d.format('YYYY-MM-DD hh:mm:ss')}'`)
      else if (typeof d == 'string')
        dataQ.push(`'${d}'`)
      else
        dataQ.push(d ?? 'null')
    } 

    let query = `insert into ${this.name} (${columns.join(',')}) values (${dataQ.join(',')})`

    // console.log(data2, this.foreigns)

    if (this.primaryAuto) {
      let pk = this.primary[0]
      data2[pk] = Math.max(this.aggregation([Agg.max(pk), 0, 'maxC']).data[0].maxC,
        this.pending.reduce((acc, t) => Math.max(t[pk], acc), Math.max())) + 1
    }
    for (let fk in this.foreigns) {
      let f = this.foreigns[fk]
      let tableT = f.tableT
      let attrT = f.attrT
      if (data2[fk] == null) {
        data2[f.name] = null
        continue
      }
      data2[f.name] = tableT.where(d => d[attrT] == data2[fk]).data[0]
      if (data2[f.name] == undefined)
        return errHdl("A foreign key contraint fails")
    }
    this.pending.push(data2)

    return query
  }

  delete() {
    // not intend to implement
  }

  refactor() {
    for (let fk in this.foreigns) {
      let f = this.foreigns[fk]
      let tableT = f.tableT
      let attrT = f.attrT
      this.data.forEach(d => {
        if (d[fk] == null) {
          d[f.name] = null
          return;
        }
        d[f.name] = tableT.where(data => data[attrT] == d[fk]).data[0]
      })
    }
  }
}

Table.fromData = function(data) {
  let columnsName = data.length == 0 ? [] : Object.keys(data[0])
  return new Table("noName", columnsName, data)
}


exports.Table = Table
exports.Agg = Agg