// {a: now, z: e, id: 'now', period: e-now}

var now = nowDate();
//var currentYear = nowDate('year');

function nowDate(id){

    id = (typeof id != 'undefined'? id : false);

    var now = (new Date()),
        year = now.getFullYear(),
        month = now.getMonth(),
        days = new Date(year, month, 0).getDate();

    if(!id)
        return year + month/12 + (now.getDate()/days)*(1/12);
    else if(id == 'year')
        return year;
}

var timePeriods = [

    // COSMOLOGIC

    {
        id: 'before', // before time
        val: 'Who knows',
        z: -13820000000,
        parent: 0
    },
    {
        id: 'time',
        val: 'Time',
        a: -13820000000,
        z: now,
        parent: 0
    },
    {
        id: 'preprecambrian',
        val: 'Formation of the Universe',
        a: -13820000000,
        z: -4600000000,
        parent: 'time',
        sterile: true
    },


    // GEOLOGIC
    // https://en.wikipedia.org/wiki/Geologic_time_scale

    // super eon

    {
        id: 'precambrian',
        val: 'Precambrian',
        a: -4600000000,
        z: -541000000,
        parent: 'time'
    },

    // eon

    {
        id: 'hadean',
        val: 'Hadean',
        a: -4600000000,
        z: -4000000000,
        parent: 'precambrian',
        sterile: true
    },
    {
        id: 'archean',
        val: 'Archean',
        a: -4000000000,
        z: -2500000000,
        parent: 'precambrian',
        sterile: true
    },
    {
        id: 'proterozoic',
        val: 'Proterozoic',
        a: -2500000000,
        z: -541000000,
        parent: 'precambrian',
        sterile: true
    },
    {
        id: 'phanerozoic',
        val: 'Phanerozoic',
        a: -541000000,
        z: now,
        parent: 'time',
        sterile: false
    },

    // era

    {
        id: 'paleozoic',
        val: 'Paleozoic',
        a: -541000000,
        z: -251902000,
        parent: 'phanerozoic',
        sterile: true
    },
    {
        id: 'mesozoic',
        val: 'Mesozoic',
        a: -251902000,
        z: -66000000,
        parent: 'phanerozoic',
        sterile: true
    },
    {
        id: 'cenozoic',
        val: 'Cenozoic',
        a: -66000000,
        z: now,
        parent: 'phanerozoic',
        sterile: false
    },
        {
            id: 'Paleogene',
            val: 'Paleogene',
            a: -66000000,
            z: -23030000,
            parent: 'cenozoic',
            sterile: true
        },
        {
            id: 'Neogene',
            val: 'Neogene',
            a: -23030000,
            z: -2580000,
            parent: 'cenozoic',
            sterile: true
        },
        {
            id: 'quaternary',
            val: 'Quaternary',
            a: -2580000,
            z: now,
            parent: 'cenozoic',
            sterile: false
        },
            {
                id: 'pleistocene',
                val: 'Pleistocene',
                a: -2588000,
                z: -11700,
                parent: 'quaternary',
                sterile: false
            },
                {
                    id: 'gelasian',
                    val: 'Gelasian',
                    a: -2588000,
                    z: -1806000,
                    parent: 'pleistocene',
                    sterile: true
                },
                {
                    id: 'calabrian',
                    val: 'Calabrian',
                    a: -1806000,
                    z: -781000,
                    parent: 'pleistocene',
                    sterile: true
                },
                {
                    id: 'ionian',
                    val: 'Middle Pleistocene',
                    a: -781000,
                    z: -126000,
                    parent: 'pleistocene',
                    sterile: true
                },
                {
                    id: 'tarantian',
                    val: 'Late Pleistocene',
                    a: -126000,
                    z: -11700,
                    parent: 'pleistocene',
                    sterile: true
                },

            {
                id: 'holocene',
                val: 'Holocene',
                a: -11700,
                z: now,
                parent: 'quaternary',
                sterile: false
            },

    // period

    

    // epoch

    // age

    // CURRENTS

    /*{
        id: 'quaternary', // period
        val: 'quaternary',
        a: -2580000,
        z: now,
        parent: 'cenozoic'
    },
    {
        id: 'holocene', // epoch
        val: 'holocene',
        a: -11700,
        z: now,
        parent: 'quaternary'
    },*/

    // PREHISTORY

    /*{
        id: 'prehistory',
        val: 'Prehistory',
        a: -3500000,
        z: -3000,
        parent: 'cenozoic',
        sterile: true
    },*/

    {
        id: 'neolithic',
        val: 'Neolithic',
        a: -11700,
        z: -3000,
        parent: 'holocene',
        sterile: true
    },

    // HISTORY

    {
        id: 'history',
        val: 'Recorded history',
        a: -3000,
        z: now,
        parent: 'holocene',
        sterile: false
    },
    {
        id: 'ancient',
        val: 'Ancient history',
        a: -3000,
        z: 476,
        parent: 'history',
        sterile: false
    },
    {
        id: 'preclassic',
        val: 'Pre-classical history',
        a: -3000,
        z: -800,
        parent: 'ancient',
        sterile: false
    },
        {
            id: 'edynasticegypt',
            val: 'Early dynastic Egypt',
            a: -3000,
            z: -2686,
            parent: 'preclassic',
            sterile: true
        },
        {
            id: 'oldegypt',
            val: 'Old Kingdom of Egypt',
            a: -2686,
            z: -2181,
            parent: 'preclassic',
            sterile: true
        },
        {
            id: 'intermediateegypt',
            val: 'Intermediate Egypt',
            a: -2181,
            z: -1549,
            parent: 'preclassic',
            sterile: true
        },
        {
            id: 'newegypt',
            val: 'New egyptian Kingdom',
            a: -1549,
            z: -1100,
            parent: 'preclassic',
            sterile: true
        },
        /*{
            id: 'mycenaean',
            val: 'mycenaean greece',
            a: -1600,
            z: -1100,
            parent: 'preclassic',
            sterile: true
        },*/
        {
            id: 'greekdark',
            val: 'Greek Dark Ages',
            a: -1100,
            z: -800,
            parent: 'preclassic',
            sterile: true
        },
    {
        id: 'classicant',
        val: 'Classical antiquity',
        a: -800,
        z: 476,
        parent: 'ancient',
        sterile: false
    },
        {
            id: 'classicantarc',
            val: 'Archaic antiquity',
            a: -800,
            z: -500,
            parent: 'classicant',
            sterile: true
        },
        {
            id: 'classicgreece',
            val: 'Classical Greece',
            a: -500,
            z: -323,
            parent: 'classicant',
            sterile: true
        },
        {
            id: 'helenistic',
            val: 'Helenistic period',
            a: -323,
            z: -146,
            parent: 'classicant',
            sterile: true
        },
        {
            id: 'romanrep',
            val: 'Late Roman Republic',
            a: -146,
            z: -27,
            parent: 'classicant',
            sterile: true
        },
        {
            id: 'rome',
            val: 'Roman Empire',
            a: -27,
            z: 476,
            parent: 'classicant',
            sterile: false
        },
            
            /*{
                id: 'augustus',
                val: 'Augustus',
                a: -27,
                z: 14,
                parent: 'rome',
                sterile: true
            },
            {
                id: 'julioclaudian',
                val: 'Julio-Claudian Dinasty',
                a: 14,
                z: 68,
                parent: 'rome',
                sterile: true
            },
            {
                id: 'yearfour',
                val: 'Year of the Four Emperors',
                a: 68,
                z: 69,
                parent: 'rome',
                sterile: true
            },
            {
                id: 'flavian',
                val: 'Flavian Dinasty',
                a: 69,
                z: 96,
                parent: 'rome',
                sterile: true
            },*/
            {
                id: 'earlyroman',
                val: 'Early Roman Empire',
                a: -27,
                z: 96,
                parent: 'rome',
                sterile: true
            },
            {
                id: 'fivegood',
                val: 'Five good Emperors',
                a: 96,
                z: 180,
                parent: 'rome',
                sterile: true
            },
            {
                id: 'lateromanem',
                val: 'Late Roman Empire',
                a: 180,
                z: 476,
                parent: 'rome',
                sterile: true
            },
                /*{
                    id: 'commodus',
                    val: 'Commodus',
                    a: 180,
                    z: 193,
                    parent: 'lateromanem',
                    sterile: true
                },
                {
                    id: 'severan',
                    val: 'Severan dynasty',
                    a: 193,
                    z: 235,
                    parent: 'lateromanem',
                    sterile: true
                },
                {
                    id: 'crisisiii',
                    val: 'Crisis of the Third Century',
                    a: 235,
                    z: 284,
                    parent: 'lateromanem',
                    sterile: true
                },
                {
                    id: 'crisisiii',
                    val: 'Crisis of the Third Century',
                    a: 235,
                    z: 284,
                    parent: 'lateromanem',
                    sterile: true
                },
                {
                    id: 'diocletian',
                    val: 'Diocletian and the Tetrarchy',
                    a: 284,
                    z: 301,
                    parent: 'lateromanem',
                    sterile: true
                },
                {
                    id: 'constantinian',
                    val: 'Constantinian Dynasty',
                    a: 301,
                    z: 363,
                    parent: 'lateromanem',
                    sterile: true
                },
                {
                    id: 'valentinian',
                    val: 'Valentinian dynasty',
                    a: 363,
                    z: 392,
                    parent: 'lateromanem',
                    sterile: true
                },
                {
                    id: 'theodosian',
                    val: 'Theodosian dynasty',
                    a: 392,
                    z: 457,
                    parent: 'lateromanem',
                    sterile: true
                },
                {
                    id: 'wromedecline',
                    val: 'Decline Western Rome',
                    a: 457,
                    z: 476,
                    parent: 'lateromanem',
                    sterile: true
                },*/
    {
        id: 'middle',
        val: 'Middle Ages',
        a: 476,
        z: 1500,
        parent: 'history',
        sterile: false
    },
        {
            id: 'earlymiddle',
            val: 'Early Middle Ages',
            a: 476,
            z: 1000,
            parent: 'middle',
            sterile: true
        },
        {
            id: 'highmiddle',
            val: 'High Middle Ages',
            a: 1000,
            z: 1300,
            parent: 'middle',
            sterile: true
        },
        {
            id: 'latemiddle',
            val: 'Late Middle Ages',
            a: 1300,
            z: 1500,
            parent: 'middle',
            sterile: true
        },
    {
        id: 'modern',
        val: 'Modern history',
        a: 1500,
        z: now,
        parent: 'history'
    },
    {
        id: 'earlymo',
        val: 'Early modernity',
        a: 1500,
        z: 1800,
        parent: 'modern',
        sterile: true
    },
    {
        id: 'latemo',
        val: 'Late modernity',
        a: 1800,
        z: 1950,
        parent: 'modern',
        sterile: false
    },
        {
            id: 'xix',
            val: 'XIX century',
            a: 1800,
            z: 1900,
            parent: 'latemo',
            sterile: true
        },
        {
            id: 'exx',
            val: 'Early XX century',
            a: 1900,
            z: 1950,
            parent: 'latemo',
            sterile: false
        },
        {
            id: '1900',
            val: '1900&#39;s',
            a: 1900,
            z: 1910,
            parent: 'exx',
            sterile: true
        },
        {
            id: '1910',
            val: '1910&#39;s',
            a: 1910,
            z: 1920,
            parent: 'exx',
            sterile: true
        },
        {
            id: '1920',
            val: '1920&#39;s',
            a: 1920,
            z: 1930,
            parent: 'exx',
            sterile: true
        },
        {
            id: '1930',
            val: '1930&#39;s',
            a: 1930,
            z: 1940,
            parent: 'exx',
            sterile: true
        },
        {
            id: '1940',
            val: '1940&#39;s',
            a: 1940,
            z: 1950,
            parent: 'exx',
            sterile: true
        },

    {
        id: 'contemporary',
        val: 'Contemporary history',
        a: 1950,
        z: now,
        parent: 'modern',
        sterile: false
    },
        {
            id: '1950',
            val: '1950&#39;s',
            a: 1950,
            z: 1960,
            parent: 'contemporary',
            sterile: true
        },
        {
            id: '1960',
            val: '1960&#39;s',
            a: 1960,
            z: 1970,
            parent: 'contemporary',
            sterile: true
        },
    /*{
        id: 'earlycontemporary',
        val: 'Early contemporary history',
        a: 1950,
        z: 1970,
        parent: 'contemporary',
        sterile: true
    },*/
    {
        id: 'info',
        val: 'Information Age',
        a: 1970,
        z: now,
        parent: 'contemporary',
        sterile: false
    },
    {
        id: 'earlyinfo',
        val: 'Early information age',
        a: 1970,
        z: 2010,
        parent: 'info',
        sterile: false
    },
        {
            id: '1970s',
            val: '1970&#39;s',
            a: 1970,
            z: 1980,
            parent: 'earlyinfo',
            sterile: true
        },
        {
            id: '1980s',
            val: '1980&#39;s',
            a: 1980,
            z: 1990,
            parent: 'earlyinfo',
            sterile: true
        },
        {
            id: '1990s',
            val: '1990&#39;s',
            a: 1990,
            z: 2000,
            parent: 'earlyinfo',
            sterile: true
        },
        {
            id: '2000s',
            val: '2000&#39;s',
            a: 2000,
            z: 2010,
            parent: 'earlyinfo',
            sterile: true
        },
    /*{
        id: 'bigdata',
        val: 'Big Data',
        a: 2010,
        z: now,
        parent: 'info',
        sterile: false
    },*/
    {
        id: '2010s',
        val: '2010&#39;s',
        a: 2010,
        z: now,
        parent: 'info',
        sterile: true
    },
    /*{
        id: 'thisyear',
        val: 'This year',
        a: currentYear,
        z: now,
        parent: 'info',
        sterile: true
    },*/

    // FUTURE

    {
        id: 'future',
        val: 'Future',
        a: now,
        parent: 0,
        sterile: true
    }
];