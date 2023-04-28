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
var ytInput = $("input[name='year_to']")[0]
var yfInput = $("input[name='year_from']")[0]
ytInput.value = ytInput.max = yfInput.max = JSON.stringify(getCurrentYear())
yfInput.value = ytInput.min = yfInput.min = 1950

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
    $("input[name='bName']")[0].value = ""
    $("select[name='aName']")[0].value = ""
    $("select[name='gName']")[0].value = ""
    $("select[name='pName']")[0].value = ""
    $("select[name='state']")[0].value = ""

    var ytInput = $("input[name='year_to']")[0]
    var yfInput = $("input[name='year_from']")[0]
    ytInput.value = ytInput.max
    yfInput.value = yfInput.min
    showValidInput(yfInput)
    showValidInput(ytInput)

    var pfInput = $("input[name='price_from']")[0]
    var ptInput = $("input[name='price_to']")[0]
    ptInput.value = ptInput.max
    pfInput.value = pfInput.min
    showValidInput(pfInput)
    showValidInput(ptInput)
})
// ------------------- socket comm. ------------------


;[].forEach(socket => socketCleanUp.push(socket))

socket.emit('no_action')