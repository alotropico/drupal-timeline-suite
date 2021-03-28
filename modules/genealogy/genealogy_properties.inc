<?php

// gets String
// as pieces separated by + ,
// returns an array
function taos_parse($str){
  if (strpos($str, '+') !== false)
    $taos = explode('+',$str);
  elseif (strpos($str, ',') !== false)
    $taos = explode(',',$str);
  elseif ($str)
    $taos = array($str);
  else
    $taos = array();

  return $taos;
}
// maximum and minimum date
// for a specific set of Taos and Filters
function time_bounds($taos, $filters){

  $start = NULL;
  $end = NULL;

  if(!$taos && isset($filters['start'])){

    $start = $filters['start'];

    if(isset($filters['end']))
      $end = $filters['end'];

  } else {

    foreach ($taos as $tao) {

      if($tao){
        $loadTao = entity_load('node', array($tao));
        $taoNode = $loadTao[$tao];
      }

      if(isset($filters['start'])){
          $start = $filters['start'];

          if(isset($filters['end']))
            $end = $filters['end'];

      }else if(isset($taoNode)){

        if(isset($taoNode->field_start[LANGUAGE_NONE][0]['year'])){

          if(!$start || $start > $taoNode->field_start[LANGUAGE_NONE][0]['year']){
            $start = $taoNode->field_start[LANGUAGE_NONE][0]['year'];
          }
        }

        if(isset($taoNode->field_end[LANGUAGE_NONE][0]['year'])){

          if(!$end || $end < $taoNode->field_end[LANGUAGE_NONE][0]['year']){
            $end = $taoNode->field_end[LANGUAGE_NONE][0]['year'];
          }
        }

        if(!isset($filters['start']) && !isset($filters['end']) && $start && $end){
          $dif = round($end - $start);
          if($dif < 50) $dif = 50;
          $start -= $dif;
          $end += $dif;
        } elseif($start && !$end)
          $start -= 75;
      }
    }
  }

  $ret = array();
  $ret['start'] = $start;
  $ret['end'] = $end;

  return $ret;
}

// gets wikidata property id
// returns group for this property
// or FALSE
function getPropertyGroup($propId){

	$propertiesToSave = array(

		'instance or subclass of' => array(
			'P31' => 'instance of'
		),

		'subclass of' => array(
			'P279' => 'subclass of'
		),

		'included in' => array(
			'P361' => 'part of',
			'P2445' => 'metasubclass of',
			'P171' => 'parent taxon',
			'P179' => 'series',
			'P1582' => 'natural product of taxon',
			'P2548' => 'strand orientation',
			'P1269' => 'facet of'
		),

		'taxon rank' => array(
			'P105' => 'taxon rank'
		),

		'sex and gender' => array(
			'P21' => 'sex or gender'
		),
		/*'people' => array(
			'P91' => 'sexual orientation'
		),*/

		'occupation and role' => array(
			'P106' => 'occupation'
		),

		'place' => array(
			'P30' => 'continent',
			'P17' => 'country',
			'P27' => 'country of citizenship',
			'P495' => 'country of origin',
			'P1376' => 'capital of',
			'P1001' => 'applies to jurisdiction',
			'P1080' => 'from fictional universe',
			'P1434' => 'takes place in fictional universe',
			'P1165' => 'home world',
			'P1408' => 'licensed to broadcast to',
			'P2541' => 'operating area',
			'P183' => 'endemic to',
			'P2341' => 'indigenous to',
			'P291' => 'place of publication'
		),

		'culture and ethnic group' => array(
			'P2596' => 'culture',
			'P172' => 'ethnic group'
		),

		'language' => array(
			'P2439' => 'language',
			'P407' => 'language of work or name',
			'P37' => 'official language',
			'P103' => 'native language',
			'P364' => 'original language of work'
		),

		'field of work' => array(
			'P1576' => 'lifestyle',
			'P101' => 'field of work'
		),

		'religion' => array(
			'P3075' => 'official religion',
			'P140' => 'religion',
			'P1049' => 'worshipped by'
		),

		'politics' => array(
			'P102' => 'member of political party',
			'P1142' => 'political ideology',
			'P1387' => 'political alignment',
			'P122' => 'basic form of government'
		),
		'movement' => array(
			'P135' => 'movement'
		),

		'genre' => array(
			'P136' => 'genre',
			'P149' => 'architectural style',
			'P452' => 'industry',
		),

		'industry' => array(
			'P452' => 'industry'
		),

		'license' => array(
			'P275' => 'license'
		),

		'programming language' => array(
			'P277' => 'programming language'
		),

		'sport' => array(
			'P54' => 'member of sports team',
			'P641' => 'sport'
		),

		'type' => array(
			'P522' => 'type of orbit',
			'P1056' => 'product or material produced',
			'P1002' => 'engine configuration',
			'P1956' => 'takeoff and landing capability',
			'P1201' => 'space tug',
			'P1210' => 'supercharger',
			'P1211' => 'fuel system',
			'P1221' => 'compressor type',
			'P1654' => 'wing configuration',
			'P141' => 'IUCN conservation status',
			'P2371' => 'FAO risk status',
			'P1604' => 'biosafety level',
			'P2127' => 'International Nuclear Event Scale',
			'P1435' => 'heritage designation',
			'P1454' => 'legal form',
			'P1558' => 'tempo marking',
			'P1568' => 'domain',
			'P1571' => 'codomain',
			'P1878' => 'Vox-ATypI classification',
			'P2551' => 'used metre',

			'P275' => 'license',
			'P277' => 'programming language',
			'P282' => 'writing system',
			'P2827' => 'flower color',
			'P289' => 'vessel class',
			'P2989' => 'has grammatical case',
			'P3259' => 'intangible cultural heritage status',

			'P413' => 'position played on team / speciality',
			'P59' => 'constellation',
			'P789' => 'edibility'
			
		),

		'subject' => array(
			'P921' => 'main subject'
		),

		'material' => array(
			'P186' => 'material used',
		),

		'platform' => array(
			'P400' => 'platform IN videogames'
		),

		'game mode' => array(
			'P404' => 'game mode'
		),

		'original network' => array(
			'P449' => 'original network'
		),

		'position' => array(
			'P3716' => 'social classification',
			'P39' => 'position held',
			'P97' => 'noble title',
			'P410' => 'military rank',
			'P2962' => 'title of chess player',
			'P1303' => 'instrument',
			'P412' => 'voice type',
			'P1731' => 'Fach',
			'P2563' => 'superhuman feature or ability'
		),

		'tags' => array(
			'P4510' => 'describes a project that uses',
			'P1433' => 'published in',
			'P1445' => 'fictional universe described in',
			'P1574' => 'exemplar of',
			'P196' => 'minor planet group',
			'P1716' => 'brand',
			'P176' => 'manufacturer',
			'P2094' => 'competition class',
			'P1046' => 'discovery method',
			'P2360' => 'intended public'
		),

		'collection' => array(
			'P195' => 'collection'
		),

		'organizations' => array(
			'P749' => 'parent organization',
			'P1027' => 'conferred by',
			'P1079' => 'launch contractor',
			'P1268' => 'represents'
		)
	);

	foreach ($propertiesToSave as $key => $value) {

		if(isset($value[$propId]))
			return $key;
	}

	return false;
}

/* FIELDS */

function getItemTime($time){
  $year = $time['year'];
  
  if(isset($time['precision']) && $time['precision'] == 7){
    //if($year < 0)
      // $year += 50;
    // else
    //   $year += 50;
  }
  return array(
    'time' => dateToNumber($year, $time['month'], $time['day']),
    'precision' => (isset($time['precision']) && $time['precision'] ? $time['precision'] : false),
    'timetype' => (isset($time['timetype']) && $time['timetype'] ? $time['timetype'] : false),
  );
}

// Transforms $year, $month, $day
// in a single float number
function dateToNumber($year, $month, $day){

  $ret = $year;

  if(ABS($year) < 10000 && is_numeric($month) && is_numeric($year)){

    $ret += round(100 * ($month)/12) / 100;
  
    if(is_numeric($day) && $day > 0){

      // $days = cal_days_in_month(CAL_GREGORIAN, $month, $year);
      $days = date('t', mktime(0, 0, 0, $month, 1, $year));

      if(is_numeric($days))
        $ret += round(10000*($day/$days)/12) / 10000;
    }
  }

  return $ret;
}

/* END OF FIELDS */

/* SNIPPETS */

// $haystack string
// ends with $needle character
function endsWith($haystack, $needle){

    $length = strlen($needle);

    if ($length == 0) {
        return true;
    }

    return (substr($haystack, -$length) === $needle);
}

// Specific stuff
// gets the pair key->value
// in position $id of array $ar
// and returns values as a flat array
function getPlaceFromArray($ar, $id){
  foreach ($ar as $key => $val) {
    if($val[0] == $id)
      return array($key, $val);
  }

  return -1;
}

// Searchs the for the value of $prop
// in each item of the array $stack
// and returns a simple array
function getArrayField($stack, $prop){

  $ret = array();

  if(is_array($stack)){
    foreach($stack as $sval) {

      if(isset($sval[$prop]))
        $ret[] = $sval[$prop];
    }
  }

  return $ret;
}