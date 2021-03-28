<?php

function ajax_node_queue(){

  if(isset($_GET['id']))
    $id = $_GET['id'];

  if(isset($_GET['field']))
    $field = $_GET['field'];
  else
    $field = 'status';

  if(isset($_GET['val']))
    $val = $_GET['val'];
  else
    $val = 'queued';

  if(isset($id)){

    if(substr($id, 0, 1) == 'R'){
      $eType = 'relation';
      $id = ltrim($id, 'R');
    } else
      $eType = 'node';

    if($eType == 'relation'){

      $monad = relation_load($id);

    } else {
      $query = entity_load($eType, array($id));
      $monad = $query[$id];
    }

    switch($field){

      case 'hie':
      case 'hierarchy':
        $monad->field_hierarchy[LANGUAGE_NONE]['0']['value'] = (int)$val;
        break;

      case 'status':
        $monad->field_status[LANGUAGE_NONE]['0']['value'] = $val;

      default:

    }

    if($eType == 'relation'){

      relation_save($monad);

    } else {
      node_object_prepare($monad);
      node_save($monad);
    }
  }

  echo json_encode($eType . ' ' . $id . ' "' . $field . '" saved with value: ' . $val);
}