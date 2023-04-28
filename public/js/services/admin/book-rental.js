// --------------------- dom action --------------------
var yInput = $("input[name='year']")[0]
var curYear =  moment().year()
yInput.max = curYear

yInput.addEventListener("click", function(e) {
    if (Number(yInput.value) < Number(yInput.min))
    {
        yInput.value = yInput.min
        return
    }
    
    if (Number(yInput.value) > curYear)
        yInput.value = curYear
})

var sumSpan = $("#num")[0]
sumSpan.innerHTML = "1000"