<?php

// defines what to do with
// repeated, oposed and similar relations
function relations_rel_compare($it, $bro, $tao){

  $ret = '';

  if($it['rel'] == $bro['rel']){

    if(isset($bro['s']) && isset($it['s']) && $bro['s'] != $it['s'])
      $ret = 'anacronic';

  }else if( isset($it['rel'][2]) && isset($bro['rel'][2]) ){

    if($bro['rel'][0] == $it['rel'][0] && $bro['rel'][2] == $it['rel'][2]){

      if(!isset($bro['s']) || !isset($it['s']) || $bro['s'] == $it['s'])
        $ret = 'same';

    }else if($it['rel'][2] == $bro['rel'][0] || $bro['rel'][2] == $it['rel'][0]){

      if($bro['rel'][0] == $tao)
        $ret = 'uninverse';

      else if($bro['rel'][2] == $tao)
        $ret = 'inverse';

    }
  }

  return $ret;
}