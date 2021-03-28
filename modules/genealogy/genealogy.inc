<?php

// Get items from DB
// prepare bunches for front end
// and return the whole thing
// as an array of arrays
function genealogyGet($id, $filters) {

  $taos = taos_parse($id);

  $ret = array();

  // TIME BOUNDS

  $timeBounds = time_bounds($taos, $filters);

  $start = false;//$timeBounds['start'];
  $end = false;//$timeBounds['end'];

  if(!count($taos)){

    $fitems = array();

  } else {

    $loadTao = entity_load('node', $taos);
    $taoNode = $loadTao[$taos[0]];

    if($taoNode->type == 'collection' && isset($taoNode->field_samples[LANGUAGE_NONE]))
      $fitems = genealogyByCollection($taoNode);//getArrayField($taoNode->field_samples[LANGUAGE_NONE], 'target_id'));

    else
      $fitems = genealogyByTao($taos, $start, $end);

  }

  $items = array();

  foreach ($fitems as $it) {
    if($it['bundle'] != 'relation')
      $items[] = $it;
  }

  //

  $items = itemsGetSnack($items, $start, $end);

  if(!count($taos))
    $taos = array('');

  // SEND

  foreach ($items as $it) {

    if(isset($it['s']))
      $it['s'] = (float)$it['s'];

    if(isset($it['e']))
      $it['e'] = (float)$it['e'];

    if(isset($it['tao']) && $it['id'] == $it['tao'])
      $it['snack'] = 'tao';
    elseif(!isset($it['snack']))
      $it['snack'] = 'tax';

    $snack = $it['snack'];

    unset($it['bundle']);

    if( !isset($ret{$snack}) )
      $ret{$snack} = array();

    if( !isset($ret{$snack}{$it['id']}) )
      $ret{$snack}{$it['id']} = $it;

  }

  return json_encode($ret);

}

function genealogyByTao($taos, $start, $end){

  // GET DIRTY ITEMS

  $items = array();

  foreach ($taos as $tao) {

    // Query for timelines bounded to particular monads (taos)

    $totalItems = 500;

    $items = array();
    $items = array_merge($items, genFromTao($tao, 'nochilds', $start, $end, $totalItems));

    if(count($items) < $items){
      $items = array_merge($items, genFromTao($tao, 'childs', $start, $end, $totalItems-count($items)));
    }

    // if(count($items) < 160)
    //   $items = array_merge($items, genFromTao($tao, '', $start, $end, 600));

    //dpm($items);

    $items = itemsInnerProcess($tao, $items);
  }

  return $items;
}
function genFromTao($tao, $mode, $start, $end, $rangeMax){

  $entities = getMonadsAndRelations($tao, $mode, $rangeMax, $start, $end);

  return getGen($tao, $entities);
}

function genealogyByCollection($entity){

  // GET DIRTY ITEMS

  $ids = getArrayField($entity->field_samples[LANGUAGE_NONE], 'target_id');

  $items = array();

  $monads = entity_load('node', array_unique($ids));

  if(isset($entity->field_collection_type[LANGUAGE_NONE]) && $entity->field_collection_type[LANGUAGE_NONE]['0']['value'] == 'deeptimeline'){

    foreach ($monads as $item) {
      if(isset($item->field_samples[LANGUAGE_NONE])){
        $subids = getArrayField($item->field_samples[LANGUAGE_NONE], 'target_id');

        $monads = array_merge( entity_load('node', array_unique($subids)) , $monads);
      }
    }
  }

  $monads[] = $entity;

  // update items

  //foreach ($monads as $item) {

      //$it = itemToGenItem($item, '');

      /*if(isset($it['iof'])){
        foreach ($it['iof'] as $iof) {
          $iofs[] = $iof;
        }
      }*/

      //$items[] = $it;
  //}

  /*$iofNodes = entity_load('node', array_unique($iofs));

  foreach ($iofNodes as $item) {

      $it = itemToGenItem($item, '');

      $items[] = $it;
  }*/

  $genItems = getGen('', $monads);

  //$items = itemsMoleculize(array(), $items);

  return $genItems;
}

/*function getCategorization($items){
  $cats = array();
  $timelyCats = array();

  foreach ($items as $selfKey => $it) {
    if(isset($it['prop'])){

      foreach ($it['prop'] as $val) {
        $cats[] = $val;

        if(($it['snack'] == 'timely' || $it['snack'] == 'geotime')){

          $timelyCats[$val] = TRUE;

        }
      }
    }
  }

  // count occurrences
  // and sort categories

  $catSelection = array_count_values($cats);
  $catArray = array();

  foreach ($catSelection as $propertyId => $qtyTargets) {

    if(!isset($timelyCats[$propertyId]))
      $qtyTargets = 0;

    $catArray[] = array(
        $propertyId,
        $qtyTargets,
      );
  }

  usort($catArray, function($a, $b){
      return $a[1] < $b[1];
  });

  return array(
    'ids' => $catSelection,
    'categories' => $catArray,
    'timely' => $timelyCats
  );
}*/

function getRidsFromItems($tao, $mode, $rangeMax){

  if($mode == 'nochilds'){

    if($tao)
      $items_nids[] = $tao;

    $relationsRaw = relationsQuery($tao, 0, $rangeMax);

  } elseif($mode == 'childs') {
    $relationsRaw = relationsQuery($tao, 2, $rangeMax);

  } elseif($mode == 'secondary'){
    $relationsRaw = relationsQuery($tao, 0, $rangeMax);

  } else{
    $relationsRaw = relationsQuery($tao, 1, $rangeMax);
  }

  $rids = array();

  foreach ($relationsRaw as $rid => $val) {
    $rids[] = $val->rid;
  }

  return $rids;
}

function getRelationsEndpoints($tao, $mode, $relations){

  $endpointsIds = array();

  foreach ($relations as $rid => $val) {

    $endpoints = relation_get_endpoints($val);

    if(isset($endpoints['node'])){

      foreach ($endpoints['node'] as $endpointId => $endpoint) {

        if($endpointId != $tao){

          if($mode)
            $endpointsIds[] = $endpointId;
        }
      }
    }
  }

  return array_unique($endpointsIds);
}

function console($val){
  print_r('<pre>');
  print_r($val);
  print_r('</pre>');

  //exit;
}

function getMonadsAndRelations($tao, $mode, $rangeMax, $start, $end){

  $rids = getRidsFromItems($tao, $mode, $rangeMax * 1.2);

  $relations = relation_load_multiple($rids);

  $endpointsIds = getRelationsEndpoints($tao, $mode, $relations);

  $endpointsIds[] = $tao;

  $monads = entity_load('node', $endpointsIds);

  if(isset($start)){
    $monadsTimely = array();

    foreach ($monads as $id => $monad) {
      //if(isset($monad->field_start[LANGUAGE_NONE][0]['year']) && $monad->field_start[LANGUAGE_NONE][0]['year'] > $start){
        // if(!isset($end) || !isset($monad->field_end[LANGUAGE_NONE][0]['year']) || (isset($monad->field_end[LANGUAGE_NONE][0]['year']) && $monad->field_end[LANGUAGE_NONE][0]['year'] < $end)){
        //   $monadsTimely[] = $monad;
        // }
        $monadsTimely[] = $monad;
      //}
    }
  } else {
    $monadsTimely = $monads;
  }

  return array_merge($relations, $monadsTimely);
}

function getGen($tao, $items){

  $setsIds = getSetsFromMonads($items);

  $sets = entity_load('node', $setsIds);

  $itemsGen = itemsToGenItems($tao, $items, FALSE);

  $setsGen = itemsToGenItems(false, $sets, 'sets');

  $itemsGen = itemsSetsGroup($itemsGen, wikidataPidFromSets($setsGen));

  $itemsGen = itemsMoleculize($tao, $itemsGen);

  $itemsGen = mergeItemsAndSets($itemsGen, $setsGen);

  return $itemsGen;
}

function mergeItemsAndSets($items, $sets){

  $ret = $items;

  foreach ($sets as $sid => $set) {

    $include = true;

    foreach ($items as $id => $it) {
      
      if($it['id'] == $set['id']){

        $include = false;
        break;
      }
    }

    if($include)
      $ret[] = $set;
  }

  return $ret;
}

function relationsQuery($tao = 0, $rindex = 0, $rangeMax = 100){

  $query = new EntityFieldQuery();

  $query->entityCondition('entity_type', 'relation');

  //$query->fieldCondition('endpoints', 'entity_id', , '!=');
  //$query->fieldCondition('endpoints', 'entity_id', array(590647), 'NOT IN');

  if($tao)
    $query->fieldCondition('endpoints', 'entity_id', $tao, '=', 0);

  if(is_numeric($rindex))
    $query->fieldCondition('endpoints', 'r_index', $rindex, '=', 0);

  //$query->fieldCondition('field_start', 'year', 1950, '>');
    
  // if($rindex == 2)
  //   $query->fieldCondition('field_name', 'value', '', '=');

  $query->fieldOrderBy('field_hierarchy', 'value', 'DESC')
        ->range(0, $rangeMax)
        ->addMetaData('account', user_load(1));
    
  $results = $query->execute();

  if(isset($results['relation']))
    return $results['relation'];
  else
    return array();
}

function itemsToGenItems($tao, $entities, $forcedSnak = false){

  $ret = array();

  foreach ($entities as $entity) {

      $it = itemToGenItem($tao, $entity);

      if($forcedSnak)
        $it['snack'] = $forcedSnak;

      $ret[] = $it;
  }

  return $ret;
}

function itemToGenItem($tao, $item){

  $it = array();

  // Get common field values
  if(isset($item->field_body[LANGUAGE_NONE]))
    $it['bod'] = $item->field_body[LANGUAGE_NONE]['0']['value'];

  if(isset($item->field_geolocation[LANGUAGE_NONE]['0']['lat']))
    $it['geo']['lat'] = $item->field_geolocation[LANGUAGE_NONE]['0']['lat'];

  if(isset($item->field_geolocation[LANGUAGE_NONE]['0']['lng']))
    $it['geo']['lng'] = $item->field_geolocation[LANGUAGE_NONE]['0']['lng'];

  if(isset($item->field_hierarchy[LANGUAGE_NONE]))
    $it['hie'] = $item->field_hierarchy[LANGUAGE_NONE]['0']['value'];

  if(isset($item->field_start[LANGUAGE_NONE])){
    $s = getItemTime($item->field_start[LANGUAGE_NONE][0]);

    $it['s'] = $s['time'];
    if($s['precision']) $it['s_p']['precision'] = $s['precision'];
    if($s['timetype']) $it['s_p']['timetype'] = $s['timetype'];
  }

  if(isset($item->field_end[LANGUAGE_NONE])){
    $e = getItemTime($item->field_end[LANGUAGE_NONE][0]);

    $it['e'] = $e['time'];
    if($e['precision']) $it['e_p']['precision'] = $e['precision'];
    if($e['timetype']) $it['e_p']['timetype'] = $e['timetype'];
  }

  // pic
  if(isset($item->field_picture) && isset($item->field_picture[LANGUAGE_NONE]['0']['uri']) && $imgPath = $item->field_picture[LANGUAGE_NONE]['0']['uri']){

      // Make sure the image is more than an extension such as .jpg .gif
      if(strlen(basename($imgPath)) > 4){

        if(endsWith($imgPath, '.svg') || endsWith($imgPath, '.gif'))
          $it['pic'] = file_create_url($imgPath);
        else 
          $it['pic'] = image_style_url('monad-timeline', $imgPath);

        if(isset($item->field_picture[LANGUAGE_NONE]['0']['description']))
          $it['picurl'] = $item->field_picture[LANGUAGE_NONE]['0']['description'];

        if(strpos($it['picurl'], 'http') !== 0)
          $it['picurl'] = file_create_url($imgPath);
      }
  }

  if(isset($item->endpoints))
    $it['rel'] = getArrayField($item->endpoints[LANGUAGE_NONE], 'entity_id');

  $it['tao'] = $tao;

  // values by bundle

  if(isset($item->nid)) { // is NODE

    $it['id'] = $item->nid;
    $it['bundle'] = 'monad';

    if(isset($item->field_name[LANGUAGE_NONE]) && $item->field_name[LANGUAGE_NONE]['0']['value'])
      $it['val'] = $item->field_name[LANGUAGE_NONE]['0']['value'];
    elseif(isset($item->title))
      $it['val'] = $item->title;
    else
      $it['val'] = 'Nid ' . $it['id'];

    if(isset($item->field_sets[LANGUAGE_NONE])){

      $it['sets'] = array();

      foreach($item->field_sets[LANGUAGE_NONE] as $set){

        $prop = $set['first'];

        $val = $set['second'];

        if(!isset($it['sets'][$prop]))
          $it['sets'][$prop] = array(
            'vals' => array()
          );

        $it['sets'][$prop]['vals'][] = $val;
      }
    }

    $it['path'] = drupal_get_path_alias('node/' . $it['id']);

    $it['ids'] = array();

    if(isset($item->field_identifiers) && $item->field_identifiers){
      foreach($item->field_identifiers[LANGUAGE_NONE] as $idt){

        if(!isset( $it['ids'][$idt['first']] ))
          $it['ids'][$idt['first']] = array();

        $it['ids'][$idt['first']][] = $idt['second'];
      }
    }

    if(isset($item->field_wikipedia_id[LANGUAGE_NONE]))
        $it['ids']['wikipedia'] = array($item->field_wikipedia_id[LANGUAGE_NONE]['0']['value']);

    if(isset($item->field_wikidata_id[LANGUAGE_NONE]))
      $it['ids']['wikidata'] = array($item->field_wikidata_id[LANGUAGE_NONE]['0']['value']);

  } elseif(isset($item->rid)) { // is RELATION

    $it['id'] = 'R' . $item->rid;
    $it['bundle'] = 'relation';

    if(isset($item->field_name[LANGUAGE_NONE]) && $item->field_name[LANGUAGE_NONE]['0']['value'])
      $it['val'] = $item->field_name[LANGUAGE_NONE]['0']['value'];

    else if(isset($item->field_quantity[LANGUAGE_NONE]) && $item->field_quantity[LANGUAGE_NONE]['0']['value']){
      $it['val'] = $item->field_quantity[LANGUAGE_NONE]['0']['value'];

    } else
      $it['val'] = '';

    $it['path'] = drupal_get_path_alias('relation/' . $item->rid);

  } else {

    $it['bundle'] = 'und';

  }

  return $it;
}

function itemsGetSnack($items, $start, $end){

  $ret = array();

  foreach($items as $it){

    if(isset($it['snack']) && $it['snack'] == 'sets'){

      $snack = $it['snack'];

    }else if(isset($it['s']) || isset($it['e'])){

      if($it['bundle'] == 'relation' && $it['val'] && is_numeric($rawvalue))
        $snack = 'qty';
      else{
        if(isset($it['geo']))
          $snack = 'geotime';
        else
          $snack = 'timely';
      }

    } else { // It has no date
      if(isset($it['geo']))
        $snack = 'geo';
      else if($it['id'] == $it['tao'])
        $snack = 'tao';
      else
        $snack = 'tax';
    }

    $it['snack'] = $snack;

    $ret[] = $it;

  }

  return $ret;
}

function itemsInnerProcess($tao, $items){

  $collect = array();
  $ret = array();

  // marge repeated nodes
  // foreach($items as $ka=>$it){
  //   foreach($items as $kb=>$bro){
  //     if($ka < $kb && $it['id'] == $bro['id']){

  //       if(isset($items[$ka]['relations']) && isset($items[$kb]['relations'])){

  //         $items[$ka]['relations'] = array_merge($items[$ka]['relations'], $items[$kb]['relations']);

  //         unset($items[$kb]);

  //       }
  //     }
  //   }
  // }

  // In items with multiple relations
  // compare those relations
  // choose what to keep
  // and remove the rest
  foreach($items as $it){

    $skip = FALSE;

    if(isset($it['relations']) && count($it['relations']) > 1){

      //dpm($it['relations']);

      // loop trough the relations of the monad
      foreach($it['relations'] as $ka=>$a){

        //dpm($a);

        foreach($it['relations'] as $kb=>$b){

          if($ka < $kb){

            $comparision = relations_rel_compare($a, $b, $tao);

            switch($comparision){

              case 'anacronic':
                // dpm('anacronic');
                // dpm($it);
                //dpm($it);
                $copy = $it;
                $copy['id'] = '9999999';
                //$it['id'] = '9999999';
                unset($copy['relations'][$kb]);
                unset($it['relations'][$ka]);
                $collect[] = $copy;
                $collect[] = $it;
                $skip = TRUE;
                break;

              case 'same':
                // dpm('same');
                // dpm($it);
                //unset($it['relations'][$kb]);
                //$items[$selfKey]['prop'][] = $items[$broKey]['prop'][0];
                //$it['relations'][] = $b;
                //$items[$broKey]['snack'] = 'dat';
                break;

              case 'inverse':
                // dpm('inverse');
                // dpm($it);
                //unset($it['relations'][$kb]);
                break;

              case 'uninverse':
                // dpm('uninverse');
                // dpm($it);
                //$skip = TRUE;
                break;

            }
          }
        }
      }
    }

    if(!$skip)
      $collect[] = $it;
  }

  foreach($collect as $it){

    if(isset($it['relations']) && count($it['relations']) > 1){

      

      //$it['prop'] = array();

      /*foreach($it['relations'] as $bro){

        if(isset($bro['rel'][1])){

          if($bro['rel'][0] == $it['id'])
            $it['prop'][] = 'A' . $bro['rel'][1];
          else
            $it['prop'][] = $bro['rel'][1];

        }
      }*/
    }

    if(isset($it['relations']) && (!isset( $it['snack']) || $it['snack'] != 'cats'))
      $ret[] = itemChooseProperties($it);
    else
      $ret[] = $it;
  }

  /*foreach($ret as $it){

    if($it['id'] == '659472')
      dpm($it);
  }*/

  return $ret;
}

function itemChooseProperties($it){

  foreach($it['relations'] as $rIdx=>$bro_it){

    if(isset($bro_it['s'])){

        // upload relation with target data
        // only if empty

        $overProps = array('geo', 'hie');

        foreach ($overProps as $pr) {
          if(isset($bro_it[$pr]))
            $it[$pr] = $bro_it[$pr];
        }

        if($rIdx > 0 && isset($bro_it['id']))
            $it['id'] = $bro_it['id'];

        $it['s'] = $bro_it['s'];

        if(isset($bro_it['s_p']))
          $it['s_p'] = $bro_it['s_p'];

        if(isset($bro_it['e'])){
          $it['e'] = $bro_it['e'];

          if(isset($bro_it['e_p']))
            $it['e_p'] = $bro_it['e_p'];
        } else {
          unset($it['e']);
          unset($it['e_p']);
        }
    } else {

      if(isset($bro_it['hie']) && $bro_it['hie'])
        $it['hie'] = $bro_it['hie'];

    }

    if(!isset($it['s']) && isset($it['e']))
      $it['s'] = $it['e'];
  }

  return $it;
}

// saves the corresponding relations
// as an array in the monads
function itemsMoleculize($tao, $items){

  $ret = array();

  foreach($items as $it){

    $snack = false;
    $rawvalue = $it['val'];

    if($it['id'] != $tao){

      foreach($items as $bro) {

        if(isset($bro['rel'])){

          foreach($bro['rel'] as $ekey => $endpoint){

            if($endpoint == $it['id']){

              // save relation
              // in the monad item

              if($ekey == 1){

                if(!isset($it['relations'])){
                  $it['snack'] = 'cats';
                  $it['relations'] = array($bro);
                }

              } else {

                $it['snack'] = 'monads';

                if(!isset($it['relations']))
                  $it['relations'] = array();

                $it['relations'][] = $bro;

              }
            }
          }
        }
      }
    }

    if($it['id'] == $tao)
      $ret[] = $it;

    elseif(isset($it['relations']))
      $ret[] = $it;
    else
      $ret[] = $it;
  }

  return $ret;
}

function wikidataPidFromSets($sets){

  $ret = array();

  foreach ($sets as $key => $value) {
    if(isset($value['ids']['wikidata']['0'])){

      $pid = $value['ids']['wikidata']['0'];

      if($propertyGroup = getPropertyGroup($pid))
        $ret[$value['id']] = $propertyGroup;
    }
  }

  return $ret;
}

function itemsSetsGroup($items, $sets){

  foreach($items as $itemkey => $item) {
    if(isset($item['sets'])){
      foreach ($item['sets'] as $key => $value) {
        
        if(isset($sets[$key]))
          $items[$itemkey]['sets'][$key]['group'] = $sets[$key];
      }
    }
  }

  return $items;
}

function getSetsFromMonads($monads){

  $nids = array();

  foreach ($monads as $monad) {

    if(isset($monad->field_sets[LANGUAGE_NONE])){

      foreach ($monad->field_sets[LANGUAGE_NONE] as $set) {

        if($set['first'])
          $nids[] = $set['first'];

        if($set['second'])
          $nids[] = $set['second'];
      }
    }
  }

  return array_unique($nids);
}