<?php

function getPropertyType($propId){

	$propertiesToSave = array(

		'categories' => array(
			'P31' => 'instance of',
			'P361' => 'part of',
			'P279' => 'subclass of',
			'P2445' => 'metasubclass of',
			'P171' => 'parent taxon',
			'P105' => 'taxon rank',
			'P179' => 'series',
			'P1582' => 'natural product of taxon',
			'P2548' => 'strand orientation',
			'P1269' => 'facet of'
		),

		'people' => array(
			'P21' => 'sex or gender',
			'P91' => 'sexual orientation',
			'P2596' => 'culture',
			'P172' => 'ethnic group',
			'P1576' => 'lifestyle',
			'P2962' => 'title of chess player',
			'P1303' => 'instrument',
			'P412' => 'voice type',
			'P1731' => 'Fach',
			'P106' => 'occupation',
			'P101' => 'field of work',
			'P2563' => 'superhuman feature or ability'
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
			'P2341' => 'indigenous to'
		),

		'language' => array(
			'P2439' => 'language',
			'P407' => 'language of work or name',
			'P37' => 'official language',
			'P103' => 'native language',
			'P364' => 'original language of work'
		),

		'politics' => array(
			'P102' => 'member of political party',
			'P1142' => 'political ideology',
			'P1387' => 'political alignment',
			'P135' => 'movement',
			'P122' => 'basic form of government',
			'P140' => 'religion',
			'P1049' => 'worshipped by'
		),

		'type' => array(
			'P522' => 'type of orbit',
			'P186' => 'material used',
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

			'P136' => 'genre',
			'P149' => 'architectural style',
			'P452' => 'industry',

			'P275' => 'license',
			'P277' => 'programming language',
			'P282' => 'writing system',
			'P2827' => 'flower color',
			'P289' => 'vessel class',
			'P291' => 'place of publication',
			'P2989' => 'has grammatical case',
			'P3075' => 'official religion',
			'P3259' => 'intangible cultural heritage status',
			'P3716' => 'social classification',
			'P39' => 'position held',
			'P400' => 'platform IN videogames',
			'P404' => 'game mode',
			'P410' => 'military rank',
			'P413' => 'position played on team / speciality',
			'P449' => 'original network',
			'P54' => 'member of sports team',
			'P59' => 'constellation',
			'P641' => 'sport',
			'P789' => 'edibility',
			'P921' => 'main subject',
			'P97' => 'noble title'
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

		'organization' => array(
			'P749' => 'parent organization',
			'P1027' => 'conferred by',
			'P1079' => 'launch contractor',
			'P1268' => 'represents',
			'P195' => 'collection'
		)
	);

	foreach ($propertiesToSave as $key => $value) {

		if(isset($value[$propId]))
			return $key;
	}
}