var authorData = []
var genreData = []
var authorId, genreId

function makeAuthorEditable() {
    let rows = d3.select('.author').select('table').select('tbody').selectAll('tr')
    let tds = rows.selectAll('td')
      
    // Remove author
    tds.filter((d, i) => i == 2)
        .classed('clickable', true)
        .html('-')
        .on('click', e => {
            let data = d3.select(e.target.parentNode).datum().raw_data
            socket.emit('removeAuthor', {'authorId': data.authorId})
    })
    
    // Update author
    tds.filter((d, i) => i == 3)
        .classed('clickable', true)
        .html('U')
        .on('click', e => {
            document.getElementById("author-update-form").showModal();
            authorId = d3.select(e.target.parentNode).datum().raw_data.authorId
    }) 
}

function makeGenreEditable() {
    let rows = d3.select('.genre').select('table').select('tbody').selectAll('tr')
    let tds = rows.selectAll('td')
      
    // Remove genre
    tds.filter((d, i) => i == 2)
        .classed('clickable', true)
        .html('-')
        .on('click', e => {
            let data = d3.select(e.target.parentNode).datum().raw_data
            socket.emit('removeGenre', {'genreId': data.genreId})
    }) 
    
    // Update genre
    tds.filter((d, i) => i == 3)
        .classed('clickable', true)
        .html('U')
        .on('click', e => {
            document.getElementById("genre-update-form").showModal();
            genreId = d3.select(e.target.parentNode).datum().raw_data.genreId
    }) 
}

// --------------------- dom action --------------------
$(".author .cancel").click(e => {
    document.getElementById("author-update-form").close();
});

$(".author .submit").click(e => {
    var newAName = $(".author input[name='newAName']").val()
    socket.emit('updateAuthor', {'authorId': authorId, 'newAName': newAName})
})

$(".genre .cancel").click(e => {
    document.getElementById("genre-update-form").close();
});

$(".genre .submit").click(e => {
    var newGName = $(".genre input[name='newGName']").val()
    socket.emit('updateGenre', {'genreId': genreId, 'newGName': newGName})
})

// ------------------- socket comm. ------------------
socket.on('getAuthorGenreData_rejected',rejectPopUp)
socket.on('getAuthorGenreData_accepted', data => {
    authorData = data.author;
    insertIntoTable(d3.select(".author").select('table'))(authorData)
    makeAuthorEditable()

    genreData = data.genre;
    insertIntoTable(d3.select(".genre").select('table'))(genreData)
    makeGenreEditable()
})

socket.on('updateAuthor_rejected', rejectPopUp)
socket.on('updateAuthor_accepted', data => {
    firePopUp("Cập nhật tác giả thành công", 'success')
    d3.select(".author")
        .select('tbody')
        .selectAll('tr').filter((d, i) => {
            if (d.raw_data.authorId == data.authorId)
            {
                d.raw_data.aName = data.newAName
                d[1] = data.newAName
                return true
            }

            return false
        })
        .selectAll('td').filter((d, i) => i == 1)
        .html(data.newAName)
})

socket.on('updateGenre_rejected', rejectPopUp)
socket.on('updateGenre_accepted', data => {
    firePopUp("Cập nhật thể loại thành công", 'success')
    console.log()
    d3.select(".genre")
        .select('tbody')
        .selectAll('tr').filter((d, i) => {
            if (d.raw_data.genreId == data.genreId)
            {
                d.raw_data.gName = data.newGName
                d[1] = data.newGName
                return true
            }

            return false
        })
        .selectAll('td').filter((d, i) => i == 1)
        .html(data.newGName)
})

socket.on('removeAuthor_rejected', rejectPopUp)
socket.on('removeAuthor_accepted', data => {
    firePopUp("Xoá tác giả thành công", 'success')
    d3.select(".author")
        .select('tbody')
        .selectAll('tr')
        .filter((d, i) => d.raw_data.authorId == data.authorId)
        .remove()
})

socket.on('removeGenre_rejected', rejectPopUp)
socket.on('removeGenre_accepted', data => {
    firePopUp("Xoá thể loại thành công", 'success')
    d3.select(".genre")
        .select('tbody')
        .selectAll('tr')
        .filter((d, i) => d.raw_data.genreId == data.genreId)
        .remove()
})

;['getAuthorGenreData_accepted',
'getAuthorGenreData_rejected',
'updateAuthor_accepted',
'updateAuthor_rejected',
'updateGenre_accepted',
'updateGenre_rejected',
'removeAuthor_accepted',
'removeAuthor_rejected',
'removeGenre_accepted',
'removeGenre_rejected'].forEach(socket => socketCleanUp.push(socket))

socket.emit('getAuthorGenreData')
