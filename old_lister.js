'use strict'

// ------------------------------------- GLOBAL DATA

var bm = new BoolMaster('BoolMaster/api.php')

// ------------------------------------- LISTE NAME

async function get_current_liste_name() {
    let name = localStorage.getItem('lister_current_list_name')

    if(name == null) {
        let prompted_name = await prompt_list_name()
        if(prompted_name == '') {
            prompted_name = null
        }
        await set_current_list_name(prompted_name)
        return await get_current_liste_name()
    }

    if(! await bm.key_exists(name)) {
        let create = confirm('la liste "'+name+'" n\'existe pas, souhaitez vous la créer ?')
        if(create) {
            await set_liste({}, name)
        } else {
            await set_current_list_name(null)
        }
        return await get_current_liste_name()
    }

    return name
}

async function set_current_list_name(liste_name) {
    if(liste_name == null) {
        localStorage.removeItem('lister_current_list_name')
        return
    }
    localStorage.setItem('lister_current_list_name', liste_name)
}

// ------------------------------------- LISTE

async function prompt_list_name(name='') {
    let given_name = prompt('nom de la liste',name)
    return given_name
}

async function get_liste() {
    let name = await get_current_liste_name()
    let liste = await bm.read_key(name)
    return liste
}

async function set_liste(liste, given_name=null) {
    let name = given_name==null?await get_current_liste_name():given_name
    await bm.write_key(name, liste)
    bm.trigger_checker(name)
}

async function remove_liste() {
    let name = await get_current_liste_name()
    await bm.key_remove(name)
    bm.trigger_checker(name)
}

// ------------------------------------- ITEM

async function create_item_obj(item_name) {
    let id = Math.random()+''+Date.now()
    let item_obj = {
        id:id,
        text:item_name
    }
    return item_obj
}

async function set_item(item) {
    let liste = await get_liste()
    liste[item.id] = item
    await set_liste(liste)
}

async function remove_item(item) {
    let liste = await get_liste()
    delete liste[item.id]
    await set_liste(liste)
}

// ------------------------------------- ITEM MANAGEMENT

function init_item(name, item) {

    var itemJQ = $('<div>').addClass('item')
    var textJQ = $('<div>').addClass('text')
    var btnJQ = $('<div>').addClass('trash')

    itemJQ.append(textJQ).append(btnJQ)
    .css('height',0)
    .css('margin-top',-40)

    itemJQ.click(function(){
        if(itemJQ.hasClass('edit'))
            itemJQ.removeClass('edit')
        else
            itemJQ.addClass('edit')
    })

    btnJQ.click(async function(){
        await remove_item(item)
        bm.trigger_checker(name+':'+item.id+'!removed')
    })

    bm.register_checker(name+':'+item.id+':text!changed',function(prop, text) {
        textJQ.html(text)
        itemJQ.addClass('appear')
        .css('height','')
        .css('margin-top','')
        setTimeout(function() {
            itemJQ.removeClass('appear')
        },1000)
    })

    bm.register_checker(name+':'+item.id+'!removed',function() {
        itemJQ.addClass('disappear')
        setTimeout(function(){
            itemJQ.remove()
        },300)
    })

    $('.content').prepend(itemJQ)

}

// ------------------------------------- LISTE INIT

async function setup_liste() {

    bm.reset_checkers()
    bm.reset_all_checker()

    let name = await get_current_liste_name()
    $('.renBtn').html(name)

    $('.content').html('')

    let add_id = bm.register_checker(name+'!added',function(id, item) {
       init_item(name, item)
    })

    let rem_id = bm.register_checker(name+'!removed',async function() {
        console.log('removed !!',name,name+'!removed')
        await set_current_list_name(null)
        await setup_liste()
        bm.unregister_checker(add_id)
        bm.unregister_checker(rem_id)
     })
}

// ------------------------------------- GX ACTIONS

async function gx_add_item() {
    let item_name = prompt('nouvel élément')
    let item_obj = await create_item_obj(item_name)
    await set_item(item_obj)
}

async function gx_rename_liste() {
    let current_name = await get_current_liste_name()
    let new_name = await prompt_list_name(current_name)
    if(new_name == current_name || new_name==null) {
        return
    }
    let liste = await get_liste()
    await remove_liste()
    await set_liste(liste,new_name)
    await set_current_list_name(new_name)

    await setup_liste()
}

async function gx_new_liste() {
    await set_current_list_name(null)
    setup_liste()
}

async function gx_remove_liste() {
    let name = await get_current_liste_name()
    if(!confirm('souhaitez vous réellement supprimer la liste "'+name+'"')) {
        return
    }
    await remove_liste()
}

// ------------------------------------- INIT

async function main() {
    
    $('.addBtn').click(gx_add_item)
    $('.renBtn').click(gx_rename_liste)
    $('.newBtn').click(gx_new_liste)
    $('.remBtn').click(gx_remove_liste)

    await setup_liste()

}

main()