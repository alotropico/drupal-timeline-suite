<?php

// Another cool API: http://api.haykranen.nl/wikidata/entity?q=WIKIDATA_ID

// To add later, matbe: https://api.lyrics.ovh/v1/Coldplay/Adventure of a Lifetime

$test;

$GLOBALS['lang'] = 'en';
$GLOBALS['json'] = array();

if(isset($_GET['src'])){
	$test = 1;
	$src = mb_convert_encoding($_GET['src'], 'HTML-ENTITIES', 'UTF-8');
} else {
	$test = 0;
	$src = mb_convert_encoding($_POST['src'], 'HTML-ENTITIES', 'UTF-8');
}

// Gets a keyword (wikipedia title or alias)
// or a wikidata id (Q{integer} or P{integer})
// and begins the process to convert it to Gen format

function getItemData($keyword){

	if(!$keyword){
		return '{error}empty value to search for';
	}else{

		$checkId = preg_match("/(p|q)\d+/i", $keyword);

		if(!$checkId){

		 	$src = 'https://' . $GLOBALS['lang'] . '.wikipedia.org/w/api.php?action=query&prop=pageprops&format=json&titles=' . $keyword . '&redirects';

			//$src = 'https://' . $GLOBALS['lang'] . '.wikipedia.org/w/api.php?action=query&prop=pageprops&format=json&pageids=' . $keyword . '&redirects';

			$wiki = getIdsFromUrl($src);

			if($wiki)
				return getWikiData($wiki);
			else
				return '{error}not found on Wikidata: <a href="' . 'http://google.com/search?q=' . $keyword . '" target="_blank">' . mb_convert_encoding($keyword, 'HTML-ENTITIES', 'UTF-8') . '</a>';

		} else {
			return getWikiData(strtoupper($keyword));
		}

	}
}

function getIdsFromUrl($src){

	$data = curlCall($src);

	$content = json_decode($data, true);

	if(isset($content['query']['pages']) && isset(reset($content['query']['pages'])['pageprops'])){

		$id = reset($content['query']['pages'])['pageprops']['wikibase_item'];

		$page = reset($content['query']['pages'])['pageid'];

		return $id;

	}else{
		return false;
	}
}

// Gets an array of $val values
// for $props objects with nested array of objects
// from a wikidata set of $data
// and returns an array of Gen formated data

function matchProperties($data, $props, $val = 'value'){

	if(!is_array($props))
		return 'false';

	$copyValues = array(
		'name' => 'amount',
		'name_suffix' => 'unit',
		'id' => 'id',
		'time' => 'time',
		'url' => 'url',
		'lat' => 'latitude',
		'long' => 'longitude',
		'alt' => 'altitude',
		'value' => 'value',
		'precision' => 'precision',
		);

	$ar = array();

	$data = (object)$data;

	foreach ((array)$props as $propertyKey => $property) {

		if($g = $property['g'])
			$prop = 'P' . $property['id'];

		if($g && isset($prop)){

			unset($snak);

			if(isset($data->{$prop}{0}->{'mainsnak'}->datavalue->{$val}))
				$snak = 'mainsnak';

			elseif(isset($data->{$prop}))
				$snak = 'skip';

			if(isset($snak)){

				foreach($data->{$prop} as $propAr){

					if(!isset($ar[$g]))
						$ar[$g] = array();

					if($snak == 'mainsnak')
						$mainsnak = $propAr->{$snak}->datavalue->{$val};
					elseif($snak == 'skip')
						$mainsnak = $propAr->datavalue->{$val};

					$retArray = array();

					$retArray['property'] = $prop;

					foreach($copyValues as $copyKey => $copyValue){
						if(isset($mainsnak->{$copyValue}))
							$retArray[$copyValue] = filterValue($copyValue, $mainsnak->{$copyValue});
					}

					if(count($retArray) < 2)
						$retArray['raw'] = $mainsnak;

					elseif(isset($propAr->qualifiers))
						$retArray = array_merge ( $retArray, wikiToGen(array(), $propAr->qualifiers) );
						//$retArray['qualifiers'] = wikiToGen(array(), $propAr->qualifiers);

					//$retArray['raw'] = $mainsnak;

					$ar[$g][] = $retArray;

				}
			}
		}
	}

	return $ar;
}

function filterValue($valType, $val){
	switch($valType){

		case 'amount':
			return (float)$val;
			break;

		case 'unit':
			return lastFromUrl($val);
			break;

		default:
			return $val;

	}
}

function mergeMultiple($arrs){

	$ret = array();

	foreach($arrs as $ar){
		$ret = array_merge($ret,$ar);
	}

	return $ret;
}

// Converts & simplifies wikidata data 
// to our gen format

function wikiToGen($ret, $claims){

	$json = $GLOBALS['json'];

	// GET TIME

	// array(start, end)
	$times = matchProperties($claims, $json['TIME']);

	if(isset($times['1'])){

		foreach($times['1'] as $t){
			if(isset($t['time'])){
				$ret["start_time"] = $t['time'];
				$ret["start_precision"] = $t['precision'];
				$ret["start_property"] = $t['property'];

				break;
			}
		}
	}

	if(isset($times['2'])){

		foreach($times['2'] as $t){
			if(isset($t['time'])){
				$ret["end_time"] = $t['time'];
				$ret["end_precision"] = $t['precision'];
				$ret["end_property"] = $t['property'];

				break;
			}
		}
	}

	/*if(isset($times['2'][0]['time'])){
		$ret["end_time"] = $times['2'][0]['time'];
		$ret["end_precision"] = $times['2'][0]['precision'];
		$ret["end_property"] = $times['2'][0]['property'];
	}*/

	/*if(isset($times)){
		print_r('<pre>');
		print_r($times);
		print_r('</pre>');
	}*/

	// GET COORDINATES

	$coordinates = matchProperties($claims, $json['COORDINATES']);

	if(isset($coordinates['1'][0]['latitude']))
		$ret['latitude'] = $coordinates['1'][0]['latitude'];

	if(isset($coordinates['1'][0]['longitude']))
		$ret['longitude'] = $coordinates['1'][0]['longitude'];

	if(isset($coordinates['1'][0]['altitude']))
		$ret['altitude'] = $coordinates['1'][0]['altitude'];

	// GET EXTERNAL IDENTIFIERS (ISBN, ISO CODES, etc.)

	// $instanceOf = array("instance of" => array("id"=>"31","g"=>"1"));

	$identifiers = matchProperties($claims, mergeMultiple(array( $json['IDENTIFIERS'], $json['STRING'], $json['URL']/*, $instanceOf*/ )));

	if(isset($identifiers['1']) && is_array($identifiers['1'])){
		$ret['identifiers'] = array();

		foreach ($identifiers['1'] as $itKey => $itm){
			$ret['identifiers'][] = $itm;
		}
	}

	if(isset($ret['rating'])){
		if(!isset($ret['identifiers']))
			$ret['identifiers'] = array();

		$ret['identifiers'][] = array('property' => 'P444', 'raw' => $ret['rating']); 
	}

	// GET ITEMS (Q ITEMS FROM WIKIDATA) & CUANTITY VALUES

	$items = matchProperties($claims, mergeMultiple(array($json['ITEM']/*,$json['PROPERTY'],$json['MATH']*/)));

	if(isset($items['1']) && is_array($items['1'])){
		$ret['items'] = array();

		foreach ($items['1'] as $itKey => $itm){

			//if($itKey == 'P39')
			$ret['items'][] = $itm;
		}
	}

	//

	return $ret;
}

function getWikiData($id){

	// LOAD ITEM FROM WIKIDATA BY ID
	// List of languages to get the label from, sorted by priority (and number of speackers)
	// languages of latin alphabet first, live languages have priority
	// kindOf https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	$labelLangs = array('en', 'es', 'fr', 'pt', 'de', 'it', 'zh', 'hi', 'ar', 'bn', 'ms', 'id', 'ru', 'ha', 'pa', 'ja', 'fa', 'sw', 'ta', 'tr', 'jv', 'ko', 'mr', 'vi', 'he', 'yi', 'la', 'el', 'ca', 'cs', 'lv', 'hu');

	$wikidata_url_base = 'https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels%7Cdescriptions%7Cclaims&languages=' . implode("%7C", $labelLangs) . '&format=json&ids=';

	$wikidata_url = $wikidata_url_base . $id;

	$wikidata_raw = json_decode( curlCall($wikidata_url) );

	$wikidata = $wikidata_raw->entities->$id;

	if(isset($wikidata->claims))
		$claims = $wikidata->claims;
	else
		return '{error}unexpected format on wikidata package';

	// GET SOME DATA FROM WIKIPEDIA

	$src = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks&sitefilter=enwiki|eswiki&ids=' . $id;

	$wikidataLinks = json_decode(curlCall($src), true);

	$str = $wikidataLinks['entities'][$id]['sitelinks']['enwiki']['title'];

	$srcWP = 'https://' . 'en' . '.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' . urlencode($str);

	$wikipedia = json_decode(curlCall($srcWP), true);

	if(isset($wikipedia['query']['pages']))
		$wikipedia_id = reset($wikipedia['query']['pages'])['pageid'];
	else
		$wikipedia_id = false;

	// LOAD PROPERTIES DATA (JSON)

	$rawJson = file_get_contents('http://www.gen.transductivo.com/sites/gen/modules/wikidata_importer/script/wikidata_properties.json');

	$json = json_decode($rawJson, true);

	// START BULDING THE ITEM

	$ret = array();

	$ret["wikidata_id"] = $id;

	if($wikipedia_id)
		$ret["wikipedia_id"] = $wikipedia_id;

	// MOVIES

	if(isset($claims->P345{0})){ // IMDB

		$filmId = $claims->P345{0}->mainsnak->datavalue->value;

		//dpm($filmId);

		if(substr( $filmId, 0, 2 ) === "tt"){

			//dpm('opi');

			$film = getImdbFilm($filmId);

			if(isset($film['rating']))
				$ret['rating'] = $film['rating'];
		}
	}

	// GET NAME

	if(isset($film['name'])){

		$ret["name"] = $film['name'];

	}else if(isset($claims->P558{0}->mainsnak->datavalue->value)) // unit symbol
		$ret["name"] = rawurlencode($claims->P558{0}->mainsnak->datavalue->value);
	else {
		foreach ($labelLangs as $lab) {

			if(isset($wikidata->labels->{$lab}->value)){
				$ret["name"] = $wikidata->labels->{$lab}->value;
				break;
			}
		}
	}

	// GET BODY

	if(isset($film['plot']))
		$ret["body"] = rtrim(lcfirst($film['plot']), '.');

	else if(isset($wikidata->descriptions->$GLOBALS['lang']))
		$ret["body"] = rawurlencode($wikidata->descriptions->$GLOBALS['lang']->value);

	// If there is no description, try to get the first line of the text, available mostly for works
	// Is not likely for this to ever happen
	elseif(isset($claims->P1922{0}->mainsnak->datavalue->value->text))
		$ret["body"] .= rawurlencode($claims->P1922{0}->mainsnak->datavalue->value->text);

	// GET WIKIPEDIA BODY

	if($wikipedia_id){

		$talk = $wikipedia['query']['pages'][$ret["wikipedia_id"]]['extract'];

		if (strpos($talk, '{') !== false)
			$talk = preg_replace("/\{[^)]+\}/","",$talk);

		$talk = nl2br($talk);
		$talk = str_replace("<br />", "</p><p>", $talk);
		$talk = "<p>" . $talk . "</p>";
		$talk = str_replace("<p></p>", "", $talk);

		if(isNonLatin($talk))
			setlocale(LC_CTYPE, "es_ES");

		//$ret["wikipedia_body"] = rawurlencode($talk);
	}

	// GET IMAGE

	if(isset($film['img']))
		$ret["image"] = $film['img'];
	else
		$images = matchProperties($claims, $json['COMMONS']);

	if(isset($images['1'])){

		foreach ($images['1'] as $img) {

			$filename = str_replace(' ', '_', $img['raw']);

			if(preg_match("/^.*\.(svg)$/i", $filename)){

				$commons_api_url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=File:' .  $filename;

				$wiki_img = json_decode( curlCall($commons_api_url) );

				if(isset($wiki_img->query->pages) && isset(reset($wiki_img->query->pages)->imageinfo[0]->url)){

					$ret["image"] = reset($wiki_img->query->pages)->imageinfo[0]->url;

					break;
				}

			}else if(preg_match("/^.*\.(jpg|jpeg|png|tif|tiff|gif|bmp)$/i", $filename)){

				$hash = md5( $filename );

				$wiki_img_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/' . substr($hash, 0, 1) . '/' . substr($hash, 0, 2) . '/' . $filename . '/1200px-' . $filename;

				$wiki_img = curlCall($wiki_img_url);

				try {
					$img_size = @getimagesize($wiki_img_url);
				} catch (Exception $e) {
					//
				}

				if(isset($img_size[0])){

					if($img_size[0] > 3000){
						$ret["image_width"] = $img_size[0] . ' (' . 'too big to save. I will try to get a tinny thumbnail' . ')';

					}else{

						$ret["image"] = $wiki_img_url;

						if(isset($img_size[0]))
							$ret["image_width"] = $img_size[0];

						break;
					}
				}
			}
		}
	}

	if(!isset($ret["image"]) && isset($wikipedia_id)){ // If there is no other image, get the small one from Wikipedia
		$imgDataUrl = 'https://' . $GLOBALS['lang'] . '.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&pageids=' . $wikipedia_id;

        $image_url = json_decode(curlCall($imgDataUrl), true);

        if(isset($image_url['query']['pages'][$wikipedia_id]['thumbnail']['source']))
          $ret["image"] = $image_url['query']['pages'][$wikipedia_id]['thumbnail']['source'];
	}

	// BACKLINKS

	$snakSize = 500;

	$baclinksUrl = 'https://www.wikidata.org/w/api.php?action=query&list=backlinks&format=json&blnamespace=0&bllimit=' . $snakSize . '&&bltitle=' . $id;

	$backlinking = true;
	$blCount = 0;
	$blcontinue = '';
	$totalBackLinks = 0;

	while($backlinking){

		$snak = json_decode(curlCall($baclinksUrl . $blcontinue), true);

		if(isset($snak['query']['backlinks'])){

			$totalBackLinks += count($snak['query']['backlinks']);

			if(isset($snak['continue']['blcontinue']))
				$blcontinue = '&blcontinue=' . $snak['continue']['blcontinue'];
			else
				$backlinking = false;
		} else {
			$backlinking = false;
		}

		$blCount++;
		if($blCount >= 10000/$snakSize)
			$backlinking = false;
	}

	$ret["backlinks"] = $totalBackLinks;

	$GLOBALS['json'] = $json;

	return wikiToGen($ret, $claims); // continue to get relational properties
}

function json_decode_nice($json, $assoc = TRUE){
    $json = str_replace("\n","\\n",$json);
    $json = str_replace("\r","",$json);
    $json = preg_replace('/([{,]+)(\s*)([^"]+?)\s*:/','$1"$3":',$json);
    $json = preg_replace('/(,)\s*}$/','}',$json);
    return json_decode($json,$assoc);
}

function getImdbFilm($filmid){

	$src = 'http://theapache64.com/movie_db/search?keyword=' . $filmid;

	//print_r($src);

	//print_r(curlCall($src));

	$film = json_decode(utf8_encode(curlCall($src)), true);

	// print_r($film);
	// print_r(curlCall($src));
	//print '.' . $film;

	// foreach ($film as $key => $value) {
	// 	print_r($value);
	// }

	//exit;

	if($film && isset($film['data']['poster_url'])){

		$ret = array();

		// if(isset($film['data']['name']))
		// 	$ret['name'] = $film['data']['name'];

		if(isset($film['data']['rating']))
			$ret['rating'] = $film['data']['rating'];

		if(isset($film['data']['poster_url']))
			$ret['img'] = $film['data']['poster_url'];

		// if(isset($film['data']['plot']) && $film['data']['plot'] != 'This plot is unknown.')
		// 	$ret['plot'] = $film['data']['plot'];

		return $ret;
	}

	return false;
}

// SNIPPETS

function curlCall($src){
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $src);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,  2);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch,CURLOPT_TIMEOUT,10000);

	$ret = curl_exec($ch);
	curl_close($ch);
	return $ret;
}

function lastFromUrl($unitString){

	if(preg_match("/.*\/([^\/]+)$/", $unitString, $matches))
		return $matches[1];
	else
		return false;
}

function isNonLatin($text) {
    return preg_match('/[^\\p{Common}\\p{Latin}]/u', $text);
}

// INIT

if($test)
	print json_encode(getItemData( $src ));
else
	echo json_encode(getItemData( $src ));

?>