const between = a => b => v => (a <= v && v <= b ? 0 : (v < a ? -1 : 1));

function toSetC(text) {
  return text.match(/\d{2}/g).map((ascii, index) => {
    var codeC = Number(ascii);
    var charCode = codeC > 94 ? codeC + 100 : codeC + 32;
    return String.fromCharCode(charCode)
  }).join('');
}

function checkSum128(data, startCode) {
  var sum = startCode;
  for (var i = 0; i < data.length; i++) {
    var code = data.charCodeAt(i);
    var value = code > 199 ? code - 100 : code - 32;
    sum += (i + 1) * (value);
  }

  var checksum = (sum % 103) + 32;
  if (checksum > 126) checksum = checksum + 68 ;
  return String.fromCharCode(checksum);
}

function encodeToCode128(text, codeABC = "B") {
  var startCode = String.fromCharCode(codeABC.toUpperCase().charCodeAt() + 138);
  var stop = String.fromCharCode(206);

  text = codeABC == 'C' && toSetC(text) || text;

  var check = checkSum128(text, startCode.charCodeAt(0) - 100);

  text = text.replace(" ", String.fromCharCode(194));

  return startCode + text + check + stop;
}

function makeCsv(data, options) {
  let opt = Object.assign({index: true, header: true}, options)
  let header = Object.keys(data[0])
  if (opt.index)
    header.unshift('index')
  let output = []
  if (opt.header)
    output.push(header)
  data.forEach((v, i) => {
    let rows = []
    if (opt.index)
      rows.push(i+1)
    Object.keys(v).forEach(k => rows.push(v[k]))
    output.push(rows)
  })

  return output.map(row => row.join(',')).join('\n')
}

function round(x, significance) {
  if (significance < 0)
    return Math.round(x * (-significance))/(-significance);
  return Math.round(x / significance)*significance;
}

exports.between = between
exports.encodeToCode128 = encodeToCode128
exports.makeCsv = makeCsv
exports.round = round

exports.normalize = x => x.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()