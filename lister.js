// ECMA 5 compatible

// ------------------------------------- VARIABLES

var update_time_ms = 1000;

// ------------------------------------- USES

var liste = []

var storage_name = 'lister_liste_name'

function liste_name_is_null(name) {
    return (name == null || name == 'null')
}

function liste_name() {
    var name = localStorage.getItem(storage_name)
    while(liste_name_is_null(name)) {
        name = prompt("Nom de la liste", "");
        set_liste_name(name)
    }
    return name
}

function prompt_rename_list() {
    var current_name = liste_name()
    var new_name = prompt("Nouveau nom de liste",liste_name())
    if(liste_name_is_null(new_name) || new_name == current_name)
        return
    rename_liste(new_name,function(done_name){
        if(done_name != new_name) {
            alert('Le nom "'+new_name+'" est déjà existant')
        } else {
            update_liste()
        }
    })
}

function set_liste_name(name) {
    localStorage.setItem(storage_name, name)
}

function reset_liste_name() {
    localStorage.setItem(storage_name, null)
}

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
    $('.renBtn').html(liste_name())
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

// ------------------------------------- DATA PERENITY

function save_liste(callback) {
    boolMaster_write_key(liste_name(), liste, callback)
}

function rename_liste(new_name, callback) {
    load_liste(function(liste_data) {
        boolMaster_key_exists(new_name,function(resp){
            if(resp) {
                callback(null)
            } else {
                remove_liste(function(){
                    set_liste_name(new_name)
                    save_liste(function(){
                        callback(new_name)
                    })
                })
            }
        })
    })
}

function load_liste(callback) {

    boolMaster_key_exists(liste_name(),function(resp){

        if(!resp) {
            var ok = confirm("La liste "+liste_name()+" n'existe pas, souhaitez vous la créer")
            if(ok) {
                save_liste(function(){
                    callback([])
                })
            } else {
                reset_liste_name()
                load_liste(callback)
            }
        } else {
            boolMaster_read_key(liste_name(),callback)
        }
    })
}

function remove_liste(callback) {
    var name = liste_name()
    reset_liste_name()
    boolMaster_key_remove(name, callback)
}

// ------------------------------------- UPDATERS

var looping = false
var loopingInterval = null

function start_looper() {
    looping = true
    if(loopingInterval == null) {
        loopingInterval = setInterval(function(){
            if(!looping) {
                clearInterval(loopingInterval)
            }
        },update_time_ms)
    }
}

function stop_looper() {
    looping = false
}

function loop_updater(callback) {
    load_liste(function(data_liste){
        if(data_liste.length != liste.length) {
            liste = data_liste
            draw_list()
        }
        callback()
    })
}

function update_liste() {
    $('.content').html($('<div>').addClass('loading'))
    load_liste(function(data_liste){
        liste = data_liste
        draw_list()
    })
}

// ------------------------------------- INIT

function init() {

    init_boolMaster('localhost/boolMaster2/api.php','https')
    update_liste()

    $('.addBtn').click(add_item)
    $('.renBtn').click(prompt_rename_list)
    $('.newBtn').click(function(){
        reset_liste_name()
        location.reload()
    })
    $('.remBtn').click(function(){
        if(confirm('Souhaitez vous supprimer la liste "'+liste_name()+'"')) {
            stop_looper()
            remove_liste(function(){
                update_liste()
                start_looper()
            })
        }
    })

    start_looper()
}

setTimeout(init)