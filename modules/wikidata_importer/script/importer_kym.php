<?php

// http://www.gen.transductivo.com/sites/gen/modules/wikidata_importer/script/importer_kym.php?src=december-21st-2012

$test;

$GLOBALS['lang'] = 'en';

if(isset($_GET['src'])){
	$test = 1;
	$src = mb_convert_encoding($_GET['src'], 'HTML-ENTITIES', 'UTF-8');
} else {
	$test = 0;
	$src = mb_convert_encoding($_POST['src'], 'HTML-ENTITIES', 'UTF-8');
}

function getItemData($keyword){

	$src = 'http://knowyourmeme.com/memes/' . $keyword;

	//print_r($src);

	$html = curlCall($src);

	//preg_match('/year%3A(\d+)"/', $html, $date, PREG_OFFSET_CAPTURE);

	preg_match_all('/<img[^s]+src="(http[^ ]+hqdefault[^ ]+)"/s', $html, $img, PREG_OFFSET_CAPTURE);

	//print_r(urlencode($html));

	print_r('<pre>');
	//print_r($img);

	foreach ($img[1] as $key => $value) {
		# code...
		print_r('<img src="' . $value[0] . '">' . '<br>' . $value[0] . '<br>');
		// print_r($img[1][1]);
		// print_r($img[1][2]);
		// print_r($img[1][3]);
		// print_r($img[1][4]);
	}
	print_r('</pre>');

	//return $img[1];
}

// SNIPPETS

function curlCall($src){
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $src);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,  2);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_TIMEOUT, 10000);
	curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.63 Safari/535.7');

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