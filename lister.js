// ECMA 5 compatible

// ------------------------------------- VARIABLES

var update_time_ms = 1000;

// ------------------------------------- USES

var liste = []

// ------------------------------------- REQ

function call(attrs,ret) {
    $.get('api1.php?'+attrs)
    .done(function(data){
        ret(data)
    })
}

// ------------------------------------- ACTIONS

function remove(text) {
    var index = liste.indexOf(text)
    if(index < 0)
        return
    liste.splice(index,1)
    call('remove='+index,function(){})
}

function add_item() {
    var item = prompt("Nouvel élément", "");
    if(item == null)
        return
    call('add='+item,function(){
        update_liste()
        inhib = true
    })
}

// ------------------------------------- GX

function draw_list() {
    var rev_list = liste.slice().reverse();
    for(var key in rev_list) {
        var data = rev_list[key]
        $('.content').append(create_item_GX(data))
    }
}

function create_item_GX(text) {
    var item = $('<div>').addClass('item')
    var textJQ = $('<div>').addClass('text').html(text)
    var btnJQ = $('<div>').addClass('trash')

    item.append(textJQ).append(btnJQ)

    item.click(function(){
        if(item.hasClass('edit'))
            item.removeClass('edit')
        else
            item.addClass('edit')
    })

    btnJQ.click(function(){
        remove(text)
        item.addClass('disappear')
        inhib = true
        setTimeout(function(){
            item.remove()
        },300)
    })

    return item
}

// ------------------------------------- ENGINE

var inhib = false

function update_liste() {
    if(inhib) {
        inhib = false
        return
    }
    console.log('upd')
    $('.content').html($('<div>').addClass('loading'))
    call('liste=true',function(data_liste){
        liste = data_liste
        draw_list()
    })
}

function init() {
    $('.addBtn').click(add_item)
    update_liste()
    setInterval(function(){
        call('liste=true',function(data_liste){
            if(data_liste.length != liste.length) {
                update_liste()
            }
        })
    },update_time_ms)
}

// ------------------------------------- MAIN

init()