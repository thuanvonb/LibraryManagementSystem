function getCurrentYear(){
    return moment().year()
}

function isValidYear(){
    let maxY = Number($("input[name='year_to']")[0].value)
    let minY = Number($("input[name='year_from']")[0].value)
    return minY <= maxY
}

function isValidPrice(){
    let minP = $("input[name='price_from']")[0].value
    let maxP = $("input[name='price_to']")[0].value
    return minP <= maxP
}

// --------------------- dom action --------------------
var ytInput = $("input[name='year_to']")[0],
    yfInput = $("input[name='year_from']")[0],
    bName = $("input[name='bName']")[0],
    aName = $("select[name='aName']")[0],
    gName = $("select[name='gName']")[0],
    pName = $("select[name='pName']")[0],
    state = $("select[name='state']")[0]

ytInput.value = ytInput.max = yfInput.max = JSON.stringify(getCurrentYear())
yfInput.value = ytInput.min = yfInput.min = 1950
bName.value = bName.innerHTML

yfInput.addEventListener("focusout", function(e) {
    if (Number(yfInput.value) < Number(yfInput.min))
        yfInput.value = yfInput.min

    if (!isValidYear())
    {
        console.log("invalid year, auto fix")
        yfInput.value = ytInput.value
    }
})

ytInput.addEventListener("focusout", function(e) {
    if (Number(ytInput.value) > Number(ytInput.max))
        ytInput.value = ytInput.max
    
        if (!isValidYear())
        {
            console.log("invalid year, auto fix")
            ytInput.value = yfInput.value
        }
})

var pfInput = $("input[name='price_from']")[0]
var ptInput = $("input[name='price_to']")[0]

pfInput.addEventListener("focusout", function(e) {
    if (Number(pfInput.value) < Number(pfInput.min))
        pfInput.value = pfInput.min

    if (!isValidPrice())
    {
        console.log("invalid price, auto fix")
        pfInput.value = ptInput.value
    }
})

ptInput.addEventListener("focusout", function(e) {
    if (Number(ptInput.value) > Number(ptInput.max))
        ptInput.value = ptInput.max
    
    if (!isValidPrice())
    {
        console.log("invalid price, auto fix")
        ptInput.value = pfInput.value
    }
})

$("button[name='unbrowseBook']")[0].addEventListener("click", function(e){
    console.log("clear filter")
    bName.value = ""
    aName.value = ""
    gName.value = ""
    pName.value = ""
    state.value = ""

    ytInput.value = ytInput.max
    yfInput.value = yfInput.min

    ptInput.value = ptInput.max
    pfInput.value = pfInput.min
})

$("button[name='browseBook']")[0].addEventListener("click", function(e) {
    tableFilter(d3.select("#book-table"))(d =>
            (bName.value == "" || d.bName == bName.value) &&
            (aName.value == "" || d.aName == aName.value) &&
            (gName.value == "" || d.gName == gName.value) &&
            (pName.value == "" || d.pName == pName.value) &&
            (state.value == "" || d.state == state.value) &&
            (Number(yfInput.value) <= Number(d.pYear) && Number(d.pYear) <= Number(ytInput.value)) &&
            (Number(pfInput.value) <= Number(d.price) && Number(d.price) <= Number(ptInput.value))
    )
})
// ------------------- socket comm. ------------------


;[].forEach(socket => socketCleanUp.push(socket))

socket.emit('no_action')