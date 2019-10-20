// ECMA 5 compatible

// ------------------------------------- VARIABLES

var update_time_ms = 1000;

// ------------------------------------- USES

var liste = []

var liste_name = 'ma_liste'

// ------------------------------------- REQ

function call(attrs,ret) {
    $.get('api1.php?'+attrs)
    .done(function(data){
        ret(data)
    })
}

// ------------------------------------- ACTIONS

function remove(id) {
    for(var i in liste) {
        var liste_item = liste[i]
        var item_id = liste_item.id
        if(item_id == id) {
            liste.splice(i,1)
            save_liste()
            break
        }
    }
}

function add_item() {
    var text = prompt("Nouvel élément", "");
    if(text == null)
        return
    var liste_item = {text:text,id:Date.now()+Math.random()}
    liste.push(liste_item)
    save_liste(draw_list)
}

// ------------------------------------- GX

function draw_list() {
    $('.content').html('')
    var rev_list = liste.slice().reverse();
    for(var key in rev_list) {
        var data = rev_list[key]
        $('.content').append(create_item_GX(data))
    }
}

function create_item_GX(liste_item) {

    var text = liste_item.text
    var id = liste_item.id

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
        remove(id)
        item.addClass('disappear')
        setTimeout(function(){
            item.remove()
        },300)
    })

    return item
}

// ------------------------------------- ENGINE

function save_liste(callback) {
    boolMaster_write_key(liste_name, liste, callback)
}

function load_liste(callback) {
    boolMaster_key_exists(liste_name,function(resp){
        if(!resp) {
            save_liste(function(){
                callback([])
            })
        } else {
            boolMaster_read_key(liste_name,callback)
        }
    })
}

var inhib = false

function loop_updater() {
    if(inhib) {
        inhib = false
        return
    }
    inhib = true
    load_liste(function(data_liste){
        if(data_liste.length != liste.length) {
            liste = data_liste
            draw_list()
            inhib = false
        }
    })
}

function update_liste() {
    $('.content').html($('<div>').addClass('loading'))
    load_liste(function(data_liste){
        liste = data_liste
        draw_list()
    })
}

function init() {
    $('.addBtn').click(add_item)
    init_boolMaster('hugocastaneda.fr/boolMaster2/api.php')
    update_liste()
    
    setInterval(loop_updater,update_time_ms)
}

// ------------------------------------- MAIN

init()