<?php

// ----------------------------------------------------

if(isset($_GET['liste'])) {
    send_json(get_liste_content());
}

if(isset($_GET['add'])) {
    $item = $_GET['add'];
    send_json(add_list_item($item));
}

if(isset($_GET['remove'])) {
    $index = $_GET['remove'];
    send_json(remove_liste_item($index));
}

// ----------------------------------------------------

function send_json($data) {
    header('Content-type: application/json');
    echo json_encode($data);
}

// ----------------------------------------------------

function get_liste_content() {
    if(!file_exists('liste.json')) {
        set_liste_content(array());
        return array();
    }
    $data = file_get_contents('liste.json');
    $json_data = json_decode($data);
    foreach($json_data as $key => $val) {
        if($key == 'liste')
            return $val;
    }
}

function set_liste_content($liste) {
    $json_data = array('liste' => $liste);
    $data = json_encode($json_data);
    file_put_contents('liste.json',$data);
    return $liste;
}

// ----------------------------------------------------

function add_list_item($item) {
    $liste = get_liste_content();
    $liste[] = $item;
    set_liste_content($liste);
    return $liste;
}

function remove_liste_item($index) {
    $liste = get_liste_content();
    unset($liste[$index]);
    $new_liste = array();
    foreach($liste as $key => $item) {
        $new_liste[] = $item;
    }
    set_liste_content($new_liste);
    return $new_liste;
}

?>