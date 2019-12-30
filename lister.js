'use strict'

// ------------------------------------------- TO CHANGE

function round_button(icon,type='fab',more_class='') {
    let btn = $('<button>').addClass(more_class)
    .addClass('mdl-button mdl-js-button')
    .addClass('mdl-button--'+type+' mdl-js-ripple-effect')
    .css('margin',10)
    let icon_div =$('<i>').addClass('material-icons').html(icon)
    btn.append(icon_div)
    return btn
}

function text_button(text,type='raised',more_class='') {
    let btn = $('<button>').addClass(more_class)
    .addClass('mdl-button mdl-js-button')
    .addClass('mdl-button--'+type+' mdl-js-ripple-effect')
    .css('margin',10).html(text)
    return btn
}

function get_spinner() {
    return $('<div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active is-upgraded" data-upgraded=",MaterialSpinner"><div class="mdl-spinner__layer mdl-spinner__layer-1"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-2"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-3"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-4"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div></div>')
}

// ------------------------------------------ VAR

let gsi = new GoogleSignIn('1070660703362-5m1lo7rov7tn5ubo8oti29i7aqvu89ju.apps.googleusercontent.com')
let bm = new BoolMaster('BoolMaster/api.php')
let hcbm = new BoolMaster('saved_BoolMaster/api.php')
let mirror = new Mirror(bm)

// ------------------------------------------ DATA

function create_new_list(name, items={}) {
    let id = 'listid@'+parseInt(Math.random()*10000)+name
    let list = {id,name,items:items}
    return list
}

async function get_current_list_id() {

    let user_connector = await get_user_connector()

    let current_list_id = user_connector.get([],'current_list_id',null)
    if(current_list_id == null || !await mirror.can_connect(current_list_id)) {
        console.log('cannot connect to current id',current_list_id)
        current_list_id = await ask_user_list_id()
        user_connector.set([],'current_list_id',current_list_id)
    }
    return current_list_id
}

// ------------------------------------------ MIRROR

async function get_user_connector() {
    let profile = await gsi.get_profile_data()
    let user_connector_id = 'user'+profile.id
    await mirror.create_base(user_connector_id,{lists_name_linker:{}})
    return await mirror.connect(user_connector_id)
}

async function get_list_connector(list_id) {
    let list_connector = await mirror.connect(list_id)
    return list_connector
}

// ------------------------------------------ DISP

async function ask_user_list_id() {
    let user_connector = await get_user_connector()
    let name = prompt('list name or token')
    if(name == null) {
        return await ask_user_list_id()
    }
    let id = null
    if(name.includes('listid@')) {
        if(await mirror.can_connect(name)) {
            let list_connector = await get_list_connector(name)
            let true_name = list_connector.get([],'name')
            if(!confirm('Link list "'+true_name+'"')) {
                return await ask_user_list_id()
            }
            id = name
            user_connector.set(['lists_name_linker'],name,true_name)
        }
    } else {
        id = user_connector.get(['lists_name_linker'],name,null)
    }
    if(!await mirror.can_connect(id)) {
        if(confirm('create list "'+name+'" ?')) {
            let list = create_new_list(name)
            let id = list.id
            user_connector.set(['lists_name_linker'],name,id)
            await mirror.create_base(id,list)
            return id
        }
        return await ask_user_list_id()
    }
    return id
}

function init_item(item, list_connector) {

    let name = item.name

    // --- JQ

    var itemJQ = $('<div>').addClass('item')
    var textJQ = $('<div>').addClass('text')
    var btnJQ = $('<div>').addClass('trash')

    itemJQ.append(textJQ).append(btnJQ)
    .css('height',0)
    .css('margin-top',-40)

    $('.content').prepend(itemJQ)

    // --- CLICK

    itemJQ.click(function(){
        if(itemJQ.hasClass('edit'))
            itemJQ.removeClass('edit')
        else
            itemJQ.addClass('edit')
    })

    btnJQ.click(async function(){
        list_connector.del(['items'],item.id)
    })

    // --- EVT

    list_connector.on_prop('del',['items'],item.id, function() {
        itemJQ.addClass('disappear')
        setTimeout(function(){
            itemJQ.remove()
        },300)
    })

    list_connector.on_prop('set',['items',item.id],'name', function(text) {
        textJQ.html(text)
        itemJQ.addClass('appear')
        .css('height','')
        .css('margin-top','')
        setTimeout(function() {
            itemJQ.removeClass('appear')
        },1000)
    })

}

async function display_list() {

    return new Promise(async function(end) {
    
        let current_list_id = await get_current_list_id()
        let user_connector = await get_user_connector()

        $('.name').html(get_spinner())
        $('.content').html('')
        let list_connector = await get_list_connector(current_list_id)

        console.log('open',current_list_id)

        // --- JQ

        let back = $('.back').unbind()
        let remove = $('.remove').unbind()
        let add = $('.add').unbind()
        let name = $('.name').unbind()
        let link = $('.link').unbind()
        
        // --- CLICK

        back.click(function() {
            user_connector.del([],'current_list_id')
        })

        remove.click(function() {
            list_connector.delete()
        })

        add.click(function() {
            let item_name = prompt('element name')
            if(item_name == null) {
                return
            }
            let id = parseInt(Math.random()*10000)+item_name
            let item = {id,name:item_name}
            list_connector.set(['items'],id,item)
        })

        name.click(function() {
            let old_name = list_connector.get([],'name')
            let new_name = prompt('new list name',old_name)
            if(new_name == null) {
                return
            }
            list_connector.set([],'name',new_name)
            user_connector.del(['lists_name_linker'],old_name)
            user_connector.set(['lists_name_linker'],new_name,current_list_id)
        })

        link.click(function() {
            prompt('liste token',current_list_id)
        })
        
        // --- EVT

        list_connector.on_path('add',['items'],function(id, new_item) {
            init_item(new_item, list_connector)
        })

        list_connector.on_prop('set',[],'name',function(new_name) {
            name.html(new_name)
        })

        user_connector.on_prop('del',[],'current_list_id',function() {
            end()
        })

        list_connector.on_event('del_base',function() {
            user_connector.del([],'current_list_id')
        })
    })

}

// ------------------------------------------ CORE

async function satisfy_user() {
    while(true) {
        await display_list()
        console.log('shit restart')
    }
}

async function main() {
    await satisfy_user()
}
$(document).ready(function() {
    main()
});