(function($){

    // imdb
    // https://tools.wmflabs.org/wikidata-externalid-url/?p=345&url_prefix=http://www.imdb.com/&id=$1
    // http://en.wikipedia.org/?curid=
    // http://wikidata.org/wiki/

    $.fn.extend({
        timelineCloudInterpreter: function(options) {
            "use strict";

            // Config
            var defaults = {
                'getItem' : function(){}
            };

            var options = $.extend(defaults, options),
                base = this,
                rawData;

            function getTemplate(obj){

                var html = '<div class="monad-detail">';

                    html += '<div class="box">';

                    	html += '<div class="header">';

                    		html += '<div class="relations">';

			                    if(is(obj, 'relations')){

				                    for(var i=0; i<obj.relations.length; i++){

				                        html += getTemplateRelation(obj.relations[i]);
				                    }
				                }

			                html += '</div>';

			            html += '</div>'; // header

	                    html += '<div class="content">';

		                    // TEXTS
		                    html += '<div class="article">';

		                    	// IMAGE
                    			if(is(obj, 'pic')){

                                    if(is(obj, 'picurl'))
                                        var big = obj.picurl;
                                    else
                                        var big = obj.pic;

                                    html += '<div class="figure">' +
                                                '<a href="' + big + '" target="_blank">' +
                                                    '<img class="det-pic" src="' + obj.pic + '">' +
                                                '</a>' +
                                            '</div>';
                                }

		                        if(is(obj, 'val'))
                                    html += '<h4 class="title">' + 
                                                '<a href="/' + obj.path + '" target="_blank">' +
                                                    obj.val +
                                                '</a>' +
                                            '</h4>';
		                        
		                        if(is(obj, 'bod')) html += '<p class="body">' + obj.bod + '</p>';

		                    html += '</div>';

		                    // TIMES
		                    if(is(obj, 's') || is(obj, 'e')){

			                    var start = is(obj, 's') ? obj.s : false;
			                    var end = is(obj, 'e') ? obj.e : false;
			                    var sProp = is(obj, 's_p') ? obj.s_p : false;
			                    var eProp = is(obj, 'e_p') ? obj.e_p : false;

			                    html += '<div class="date">';

			                        html += dateTpl(start, end, sProp, eProp);

			                    html += '</div>';

			                }

                            if(is(obj, 'sets')){

                                var setsHtml = '';

                                $.each(obj.sets, function(idx, val){

                                    var broProp = getItem(idx);

                                    if(broProp)
                                        setsHtml += '<li><label>' + broProp.val + '</label> ';
                                    else
                                        setsHtml += '<li><label>' + idx + '</label> ';

                                    setsHtml += '<div class="links">';

                                    val['vals'].forEach(function(sVal){

                                        var broItem = getItem(sVal);

                                        if(broItem)
                                            setsHtml += '<span class="link-inline"><a href="/' + broItem.path + '">' + broItem.val + '</a></span>';
                                        else
                                            setsHtml += '<span class="link-inline"><a href="/node/' + sVal + '">' + sVal + '</a></span>';
                                    });

                                    setsHtml += '</div>';

                                    setsHtml += '</li>';
                                });

                                if(setsHtml){
                                    html += '<ul class="sets">' + setsHtml + '</ul>';
                                }
                            }

                            if(is(obj, 'ids') && is(obj.ids, 'wikidata')){

                                html += '<div class="user-options">';

                                    var val = obj.ids.wikidata;

                                    if(val.slice(0, 1) != 'P')
                                        html += tag(parsePropertyById(val, wikiProperties['wikidata'][1]), 'a', '0', 'lnk trigger-edit', 'data-id="' + obj.id + '"');
                                    else
                                        html += tag(parsePropertyById(val, wikiProperties['wikidata'][2]), 'a', '0', 'lnk trigger-edit');

                                    html += 'Edit in Wikidata';
                                    html += tag('', 'a', '1', '');

                                    html += tag('node/' + obj.id.toString() + '/edit', 'a', '0', 'admin') +
                                            'Edit here' +
                                            tag('', 'a', '1', '');

                                html += '</div>';
                            }

		                html += '</div>'; // content

		                html += '<aside>';

			                html += '<ul class="data">';
			                	
		                        html += '<li class="mon-id">' + '<span class="value"><label>ID</label> ' + obj.id + '</span>' + '</li>';

                                var realId = obj.id;

                                if(is(obj, 'relations')){

                                    var rel = obj.relations[0].rel;

                                    if(is(rel, 0) && realId == rel[0])
                                        realId = obj.relations[0].id;

                                    if(is(rel, 2) && realId == rel[2])
                                        realId = obj.relations[0].id;
                                }

                                var hieBtns =   '<a class="more trigger-hierarchy" data-id="' + realId + '"></a>' +
                                                '<a class="less trigger-hierarchy" data-id="' + realId + '"></a>'

			                	if(is(obj, 'hie'))
		                            html += '<li class="hie">'
                                            + '<span class="value"><label>Hierarchy in context</label> '
                                            + '<span class="val">'
                                            + '<input type="text" value="' + obj.hie + '">'
                                            + '</span>'
                                            + hieBtns
                                            + '</span>'
                                            + '</li>';

                                if(is(obj, 'ids') && is(obj.ids, 'P444'))
                                    html += '<li>' + '<span class="value"><label>External score</label> ' + getRank(obj.ids.P444) + '</span>' + '</li>';

			                html += '</ul>';

		                    if(is(obj, 'ids')){

		                        html += '<ul class="links">';
		                        
		                        $.each(obj.ids, function(i, d){

		                            var prop = getPropertyParsed(i, d);

		                            if(prop)
		                                html += '<li>' + '<span class="value">' + prop + '</span>' + '</li>';

		                        });

                                html += '<li>' + '<span class="value">' +
                                                '<a href="https://www.google.com.uy/search?q=' + encodeURIComponent(obj.val) + '" target="_blank">' +
                                                    'Google search' +
                                                '</a>' +
                                            '</span>' + '</li>';

                                if(is(Drupal, 'admin'))
                                    html += '<li class="admin">' + '<span class="value">' +
                                                    '<a href="/advanced/relations?endpoints_entity_id=' + obj.id + '" target="_blank">' +
                                                        'Relations' +
                                                    '</a>' +
                                                '</span>' + '</li>';

                                // html += tag('node/' + obj.id.toString() + '/edit', 'a', '0', 'admin') +
                                //             'Relations' +
                                //         tag('', 'a', '1', '');

		                        html += '</ul>';

		                    }

		                html += '</aside>';

                    html += '</div>'; // box

                html += '</div>'; // monad-detail

                return html;
            }

            function getTemplateRelation(rel){

                var html = '';

                if(is(rel, 'rel')){

                    html += '<div class="relation">';

                    for(var i=0; i<rel.rel.length; i++){

                        var ep = rel.rel[i];

                        var broItem = getItem(ep);

                        if(!broItem) broItem = ep;

                        if(broItem){

                            html += '<span class="it">';
                        
                            var broItemVal = is(broItem, 'val');

                            if(broItemVal){

                                //if(is(broItem, 'css')) itemValue += tag('', 'div', 2, 'bg ' + broItem.css);

                                    var txtBg = '';//( is(broItem, 'css') ? broItem.css + ' ' : '');

                                    // if(d[4])
                                    //     txtBg += d[4];
                                    // else

                                    txtBg += 'bg';
                                    txtBg += ' det-val-txt';

                                    var href = false;

                                    if(i==1 && is(rel, 'path'))
                                        href = rel.path;
                                    else if(is(broItem, 'path'))
                                        href = broItem.path;

                                    var string = broItem.val;
                                    var trimmedString = string.length > 34 ? 
					                    string.substring(0, 34 - 3) + "..." : 
					                    string;

                                    if(href) html += tag(href, 'a', 0, txtBg);
                                        html += trimmedString;
                                    if(href) html += tag('', 'a', 1, '');

                                //if(is(broItem, 'pic')) itemValue += tag(broItem.pic, 'img', 0, 'det-pic');

                            } else {

                                var href = false;

                                if(i==1 && is(rel, 'path'))
                                    href = rel.path;

                                if(href) html += tag(href, 'a', 0, txtBg);
                                    html += broItem;
                                if(href) html += tag('', 'a', 1, '');

                            }

                            html += '</span>';
                        }
                    }

                    html += '</div>';
                }

                return html;
            }

            function dateTpl(s, e, s_p, e_p){
            	s = typeof s !== 'undefined' ? s : false;
                e = typeof e !== 'undefined' ? e : false;
                s_p = typeof s_p !== 'undefined' ? s_p : false;
                e_p = typeof e_p !== 'undefined' ? e_p : false;

                if(e_p && !s_p && s){
                	e = s;
                	s = false;
                }else if(s == e || !e_p)
                	e = false;

                var ret = '',
                    times = [
                        {
                            t:s,
                            p:s_p,
                            csss: 'date-start'
                        },
                        {
                            t:e,
                            p:e_p,
                            csss: 'date-end'
                        }
                    ];

                var precision = is(times[0].p, 'precision') ? times[0].p.precision : 0;
                precision = is(times[1].p, 'precision') && times[1].p.precision < precision ? times[1].p.precision : precision;

                times.forEach(function(a, idx) {

                    if(a.t && a.p){

                        ret += tag('', 'div', 0, a.csss);

                        if(is(a.p, 'timetype'))
                            ret += tag( getTimeLabel(a.p.timetype), 'label', 2);

                        if(is(a.p, 'precision') && a.p.precision < 9){
                            ret += tag(dateToStr(a.t, a.p.precision), 'span', 2, 'number');
                            ret += tag(' ~', 'span', 2, 'approx', 'title="approximate date"');
                        } else {
                        	ret += tag(dateName(a.t), 'span', 2, 'number');
                        }

                        if(!e && is(a.p, 'timetype') && a.p.timetype == 'P569' && a.t == s && 2017-s > 0 && 2017-s < 130){
                        	// if item born
                            if(a.p.precision > 7)
                        	   ret += tag(' (age ' + dateName(2017-s) + ')', 'span', 2, 'born');
                        }

                        if(s && is(a.p, 'timetype') && a.t == e && e-s > 0){
                        	switch(a.p.timetype){
                        		case 'P570':
                                    if(precision > 7)
    	                        		ret += tag(' (at the age of ' + dateName(e-s) + ')', 'span', 2, 'dead');
	                        		break;

	                        	default:
                                    if(e-s > 1)
                                        ret += tag(' (duration: ' + dateName(e-s) + ' years)', 'span', 2, 'ended');
                        	}
                        }

                        ret += tag('', 'div', 1);
                    }

                });

                return ret;
            }

            function dateName(nm){
                return dateToStr(nm);
            }

            function tag(str, label, idx, css, attrs){

            	attrs = typeof attrs !== 'undefined' ? ' ' + attrs : '';
            	css = typeof css !== 'undefined' ? css : '';

                if(!label)
                    return str;

                var ret = '';

                if(css != '') attrs += ' class="' + css + '"';

                attrs += getAttr(str, label);

                if(idx != 1)
                    ret += '<' + label + attrs + '>';

                if(idx != 0){
                    ret += str;
                    ret += '</' + label + '>';
                }

                return ret;
            }

            function getAttr(attrVal, interpretAs){
                switch(interpretAs){

                    case 'img':
                    case 'iframe':
                        return ' src="' + attrVal + '"';
                        break;

                    case 'a':
                        if(attrVal.indexOf('http') > -1)
                            return ' href="' + attrVal + '" target="_blank"';
                        else
                            return ' href="/' + attrVal + '"';

                    default:
                        return '';
                }
            }

            function getTimeLabel(id){

            	var w = timeNatureByTime(id);

                if(is(w, 0))
                    return w[0];
                else
                    return id;
            }

            function getPropertyParsed(id, val){

                var html = '';

                if(is(wikiProperties, id)) {

                    switch(id){

                        case 'wikidata':
                            if(val.slice(0, 1) != 'P')
                                html += tag(parsePropertyById(val, wikiProperties[id][1]), 'a', '0', 'lnk');
                            else
                                html += tag(parsePropertyById(val, wikiProperties[id][2]), 'a', '0', 'lnk');

                            html += wikiProperties[id][0];
                            html += tag('', 'a', '1', '');

                            break;

                        default:

                            $.each(val, function(idx, d){

                                html += tag(parsePropertyById(d, wikiProperties[id][1]), 'a', '0', 'lnk');
                                html += wikiProperties[id][0];
                                html += tag('', 'a', '1', '');

                            });

                    }

                    
                }

                return html;
            }

            function getRank(val){

                var ranks = [],
                    ret = 0;

                for(var i=0; i<val.length; i++){
                    var d = val[i];

                    var parts = d.toString().split('/');

                    if(d.indexOf('%') > 0)
                        ranks.push( parseFloat(d.slice(0, d.indexOf('%'))) / 100 );
                    else if(parts.length == 2)
                        ranks.push( parseFloat(parts[0]) / parseFloat(parts[1]) );
                    else
                        ranks.push( parts[0]/10 );
                }

                for(var i=0; i<ranks.length; i++){
                    ret += ranks[i];
                }

                ret /= ranks.length;

                return Math.round(ret * 1000) / 10 + '/100';
            }

            function parsePropertyById(val, rule){
                
                return rule.replace("VAR", val);
            }

            function timeNatureByTime(id){
                var wikiTimes = {
                    "P580": ["start", 1],
                    "P569": ["born", 1],
                    "P571": ["inception", 1],
                    "P1319": ["earliest date", 1],
                    "P1619": ["official opening", 1],
                    "P1317": ["floruit", 1],
                    "P1249": ["earliest written record", 0],
                    "P2310": ["minimum date", 1],
                    "P1191": ["first performance", 0],
                    "P1734": ["oath of office", 1],
                    "P606": ["first flight", 1],
                    "P729": ["service entry", 1],
                    "P2031": ["work period", 1],
                    "P575": ["discovery", 0],
                    "P577": ["publication", 0],
                    "P2754": ["production", 0],
                    "P585": ["point in time", 0],
                    "P2285": ["periapsis date", 0],
                    "P2960": ["archive date", 0],
                    "P2913": ["date depicted", 0],
                    "P574": ["taxon name publication", 0],
                    "P619": ["launch", 0],
                    "P622": ["docking/undocking", 0],
                    "P582": ["end", 1],
                    "P570": ["died", 1],
                    "P746": ["disappearance", 1],
                    "P576": ["ended", 1],
                    "P2311": ["maximum date", 1],
                    "P1326": ["latest date", 1],
                    "P730": ["service retirement", 1],
                    "P2032": ["to", 1],
                    "P2669": ["discontinued", 1],
                    "P620": ["landing", 1],
                    "P621": ["orbit decay", 1],
                    "P813": ["retrieved", 1],
                    "P1636": ["baptism", 1],
                    "P578": ["sandbox time", 1]
                }

                if(is(wikiTimes, id))
                    return wikiTimes[id];
                else
                    return false;
            }

            var wikiProperties = {

                "P953": ["Full work", "VAR"],

                "P856": ["Official website", "VAR"],
                "P1581": ['Blog', 'VAR'],
                "P1324": ["Source code", "VAR"],

                "P935": ["Commons gallery", "https://commons.wikimedia.org/wiki/VAR"],

                "P3417": ["Quora", "https://www.quora.com/topic/VAR"],

                "P345": ["IMDB", "https://tools.wmflabs.org/wikidata-externalid-url/?p=345&url_prefix=http://www.imdb.com/&id=VAR"],
                "P1258": ["Rotten Tomatoes", "https://www.rottentomatoes.com/VAR"],
                "P1874": ["Netflix", "https://www.netflix.com/title/VAR"],
                "P1712": ["Metacritic", "http://www.metacritic.com/VAR"],
                "P480": ["Filmaffinity", "https://www.filmaffinity.com/en/filmVAR.html"],

                "P973": ['Description', 'VAR'],
                "P2572": ['#twitter', 'https://twitter.com/hashtag/VAR'],
                "P2411": ['Artsy gene', 'https://www.artsy.net/gene/VAR'],
                "P2035": ['LinkedIn', 'VAR'],

                "P1325": ['Other data', 'VAR'],

                "P236": ['ISSN', 'https://www.worldcat.org/issn/VAR'],

                "P1348": ['Algae base', 'VAR'],

                "wikipedia": ["Wikipedia", "http://en.wikipedia.org/?curid=VAR"],
                "wikidata": ["Wikidata", "http://wikidata.org/wiki/VAR", "http://wikidata.org/wiki/Property:VAR"],

                "P2671": ['Google Graph id', "http://g.co/kgVAR"]

            }

            // SNIPPETS

            function is(obj, prop){
                if(obj && typeof obj[prop] !== 'undefined' && obj[prop])
                    return obj[prop];
                else
                    return false;
            }

            function dateToStr(d){

                var ret = '',
                    round = '',
                    pfx = '',
                    absD = Math.abs(d);

                if(d<0 && d>-10000){
                    pfx = ' <span>BCE</span>';
                    d = absD;
                } else if(d<0){
                	pfx = ' <span>years ago</span>';

                    if(d>-20000)
                        d -= 2018;

                    absD = Math.abs(d);
                	d = absD;
                }

                if(absD>=1000000000000) ret = roundToOne(d/1000000000000) + " trillion";
                else if(absD>=1000000000) ret = roundToOne(d/1000000000) + " billion";
                else if(absD>=1000000) ret = roundToOne(d/1000000) + " million";
                else if(absD>=10000) ret = Math.round(d/1000) + ".000";
                else if(ret=='') ret = Math.floor(d);

                return ret + pfx;
            }

            function roundToOne(n){
                return Math.floor( n * 10 ) / 10;
            }

            function getItem(itemId){

            	return options.getItem.call(base, itemId);
            }

            this.template = function(obj){

                return getTemplate(obj);
            }

            this.timeNatureByTime = function(id){
                return timeNatureByTime(id);
            }

            return this.each(function(){
                rawData = options.data;
            });
        }
    });

})(jQuery);