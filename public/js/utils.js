// const moment = require('moment')

const and = f => g => d => f(d) && g(d)

const normalize = x => x.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

const levenshteinDistance = (s, t) => {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] = i === 0 ? j : Math.min(
        arr[i - 1][j] + 1,
        arr[i][j - 1] + 1,
        arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
      );
    }
  }
  return arr[t.length][s.length];
};

const longestCommonSubsequence = x => y => {
  let m = x.length
  n = y.length;
  let l = new Array(m+1).fill(0).map(v => new Array(n).fill(0))
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i == 0 || j == 0) {
        l[i][j] = 0;
      } else if (x[i-1] == y[j-1]) {
        l[i][j] = l[i - 1][j - 1] + 1;
      } else {
        l[i][j] = Math.max(l[i - 1][j], l[i][j - 1]);
      }
    }
  }
  let lcs = l[m][n];

  return lcs;
}

const filterData = selector => onItemClick => list => text => {
  if (text.length < 1)
    return [];
  let t = list.map(item => ({
    text: item.text,
    distance: longestCommonSubsequence(item.normalized)(text)
  }))
  t.sort((a, b) => b.distance - a.distance)
  let data = t.filter((v, i) => i <= 5 && v.distance > 0)
  console.log(data)
  selector.selectAll('div')
    .data(data)
    .join('div')
    .html(d => d.text)
    .on('mousedown', (e, d) => {
      onItemClick(d.text)
    })
}

const initAutoComplete = dom => list => {
  let domNode = d3.select(dom)
  let input = $(domNode.select('input').node())
  let autoList = domNode.append('div')

  let list2 = list.map(st => ({
    text: st,
    normalized: normalize(st)
  }))

  let autoCompleteBase = filterData(autoList)(text => {
    input.val(text)
    autoList.selectChildren().remove()
  })

  input.on('keydown', e => {
    if (e.key == 'Escape') {
      autoList.selectChildren().remove()
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  })

  input.on('input', e => {
    autoList.selectChildren().remove()
    autoCompleteBase(list2)(normalize(e.target.value))
  })

 input.on('focusout', e => {
    autoList.selectChildren().remove()
  })

  input.on('focusin', e => {
    autoCompleteBase(list2)(normalize(e.target.value))
  })

  let addItem = item => {
    if (list2.some(v => v.text == item))
      return addItem
    // list.push(item)
    list2.push({
      text: item,
      normalized: normalize(item)
    })
    return addItem
  }
  return addItem
}

function verifyISBN(isbn) {
  let regex = /^(?:ISBN(?:-13)?:? )?(?=[0-9]{13}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)97[89][- ]?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9]$/;

  if (!regex.test(isbn))
    return null;

  let outputISBN = isbn.replace(/[- ]|^ISBN(?:-1[03])?:?/g, "");
  let chars = outputISBN.split("")
  let last = chars.pop();
  let sum = 0;

  // Compute the ISBN-13 check digit
  for (let i = 0; i < chars.length; i++)
    sum += (i % 2 * 2 + 1) * parseInt(chars[i], 10);

  let check = 10 - (sum % 10);
  if (check == 10)
    check = "0";

  if (check == last)
    return outputISBN

  return null;
}

function downloadCSV(data, name) {
  var fileContent = data;
  var fileName = name + '.csv';

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), fileContent], { type: "text/plain;charset=utf8" });
  const a = document.createElement('a');
  a.setAttribute('download', fileName);
  a.setAttribute('href', window.URL.createObjectURL(blob));
  a.click();
  a.remove();
}