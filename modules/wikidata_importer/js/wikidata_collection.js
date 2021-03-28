(function($) {

	var lastInputMulti = [],
		lang = 'en',
		autoLoadRelations = false,
		ajaxUrl
		showRelations = false;

    Drupal.behaviors.gen_importer = {
        'attach': function(context) {
            consoleInit();
        }
    }

    // SNIPPETS

    function getTime(){
    	var dt = new Date();
		return time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    }

    function logError(msg){
    	updateErrors++;
		consoleAppend(msg, true);
    }

	// INIT

    function consoleInit(){

    	consoleSearch();

    	$('#btn-apply').click(function(e){
    		submitData();
    	});
	}

	function submitData(){
		var collection = $('#collection_in').val();

		var items = parseText($('#console_in').val());

		saveNode($('#collection_in').val(), items);
	}

	// RETRIEVE & SAVE DATA

	function trim1(str) {
	    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	function cleanSpecialString(str){

		val = str.split(",");

		var ret = [];

		for(var j=0; j<val.length; j++){

			var rx = '/[.*]\((.*?)\)/';

			var therm = val[j].replace(/ *\(.*/g, "");

			therm = trim1(therm);

			ret.push(therm);
		}

		return ret.join(',');
	}

	function appendToBuffer(val){

		var newTerms;

		if(val != ''){
			if(val.indexOf("\n") > 0)
				newTerms = val.split("\n");
			else
				newTerms = val.split(",");

			lastInputMulti = lastInputMulti.concat(newTerms);
		}
		
	}

	function consoleSearch(){

		consoleAppend('{' + Drupal.t('ready') + '}' + getTime());
		consoleAppend('');

		$('#console_in').focus();
	}

	function saveNode(collectionId, itemIds){

		try{

			$.ajax({
	            type: "POST",
	            url : '/ajax/includeincollection/',
	            data: {
		            collectionid: encodeURI(encodeURIComponent(collectionId)),
		            itemids: encodeURI(encodeURIComponent(itemIds))
		        },
			    error: function(xhr, ajaxOptions, thrownError) {
					consoleAppend('{error}' + thrownError, true);

					consoleSearch();
				},
	            success : function(results) {

	            	consoleAppend(results, true);

	        		consoleSearch();
	            }
	        });

        }

		catch(e){
			logError('{error}' + e);
		}
	}

	function consoleAppend(val, save){

		save = save || 0;

		var key,
			typeClass,
			body,
			regex = /\{(.*?)\}(.*)/,
			sRegex = /\[(.*?)\](.*)/;

		if(val.indexOf('{') > -1){
			var exp = regex.exec(val);
			if(exp !== null){
				key = exp[1];
				body = exp[2];
			}

			if(body.indexOf('[') > -1){
				exp = sRegex.exec(body);
				var prebody = exp[1];

				body = exp[2];
			}

		} else {
			key = '';
			body = (typeof val != 'undefined'? val.toString() : '');
		}

		switch(key.toLowerCase()){
			case 'ready':
			case 'listo':
			case 'searching':
				typeClass = 'it_h2';
				break;

			case 'status':
			case 'saved':
			case 'guardado':
				typeClass = 'it_h2_small';
				break;

			case 'error':
				typeClass = 'it_h2_error';
				break;

			case 'warning':
				typeClass = 'it_h2_warning';
				break;

			case '':
				typeClass = 'it_empty';
				break;

			default:
				typeClass = 'it_p';

		}

		var bal = body.toLowerCase();

		if(bal.indexOf('.jpg') >= 0 || bal.indexOf('.png') >= 0 || bal.indexOf('.svg') >= 0 || bal.indexOf('.gif') >= 0){

			body = '<a href="' + body + '" target="_blank">' +
				'<img style="height: 100px; width: auto; min-width: 10px;" src="' + body + '"> ' +
				'</a>';

		}else if(body.indexOf('http') == 0 || body.indexOf('/') == 0){
			body = '<a href="' + body + '" target="_blank">' + body + '</a>';

		}

		var html = '<div class="' + typeClass + '">' +
			'<span class="key">' + key + '</span>' + 
			'<span class="val">' + decodeURIComponent(body) + '</span>' + 
		'</div>';

		if($('#console_out').length)
			$('#console_out').append(html).stop().animate({ scrollTop: $("#console_out")[0].scrollHeight}, 1000);

		if(save){
			if(key == 'guardado'){
				$('#console_history').append(html);
			} else if(key != 'warning'){
				$('#console_errors').append(html);
			}

		}

	}

	function removeDuplicates(a) {
	    var seen = {};
	    var out = [];
	    var len = a.length;
	    var j = 0;
	    for(var i = 0; i < len; i++) {
	         var item = a[i];
	         if(seen[item] !== 1) {
	               seen[item] = 1;
	               out[j++] = item;
	         }
	    }
	    return out;
	}

	function is(obj, prop){
        if(obj && typeof obj[prop] !== 'undefined' && obj[prop])
            return obj[prop];
        else
            return false;
    }

    function parseText(val){

    	var ret = [],
    		parts = val.split('\n');

    	parts.forEach(function(p, idx){

    		var id = getIdentifiers(p);

    		if(id)
    			ret = ret.concat(id);
    	});

    	var sep = ',';

    	return uniq(ret).join(sep);
    }

    function getIdentifiers(s){

    	var re = /(Q|P)\d+/gi,
			m,
			ret = [];

		while ( (m = re.exec(s)) ) {
			ret.push(m[0]);
		}

		if(ret.length)
			return ret;
		else
			return false;
    }

    // this function is only good
    // for arrays with primitives of the same type
    function uniq(a) {
	    var seen = {};
	    return a.filter(function(item) {
	        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	    });
	}

})(jQuery);