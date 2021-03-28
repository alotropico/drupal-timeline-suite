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

    	if(typeof Drupal.settings.wikidata_importer.ajaxUrl !== 'undefined')
            ajaxUrl = Drupal.settings.wikidata_importer.ajaxUrl;

    	// init RETRIEVE & SAVE DATA

    	consoleAppend('{' + Drupal.t('ready') + '}' + Drupal.t('Import from Wikipedia & Wikidata') + ': ' + getTime());
    	//consoleAppend('{' + Drupal.t('ready') + '}' + Drupal.t('start') + ': ' + getTime());

		$('#console_action').click(function(){
			readInput();
		});

		$('#console_in').keydown(function(e) {
			if (e.which == 13 && !e.shiftKey) {
				readInput();

				return false;
			}
		});
		
	}

	// RETRIEVE & SAVE DATA

	function trim1(str) {
	    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	function cleanSpecialString(val){

		var val = $('#console_in').val().split(",");

		for(var j=0; j<val.length; j++){

			var rx = '/[.*]\((.*?)\)/';

			var therm = val[j].replace(/ *\(.*/g, "");

			therm = trim1(therm);

			$('#console_tools').append(therm);
			$('#console_tools').append('<br>');
		}

		return false;
	}

	function readInput(){
		var val = $('#console_in').val();
		appendToBuffer(val);
		consoleSearch();
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

		lastInputMulti = removeDuplicates(lastInputMulti);

		$('#console_tools').html(lastInputMulti.join('<br>'));

		//return false;

		if(lastInputMulti.length > 0){

			var val = lastInputMulti.shift();

			//var val = $('#console_in').val();

			if(val != ''){
				consoleLoadFromURL( val );

				$('#console_in').attr('disabled','disabled').val('');
			} else {
				consoleAppend('{warning}' + Drupal.t('nothing to search for'));
				consoleSearch();
			}

		} else{

			$('#console_in').removeAttr('disabled');

			consoleAppend('{' + Drupal.t('ready') + '}' + getTime());
			consoleAppend('');

			$('#console_in').focus();
		}


	}

	function consoleLoadFromURL(src){

		consoleAppend('{searching}"' + src + '" - ' + getTime());

		try{

			$.ajax({
	            context: this,
	            type: "POST",
	            url : ajaxUrl,
	            data: { 
			        'src': encodeURIComponent(src)
			    },
			    error: function() {

			    	idAppend('skip:error');

					consoleAppend('{error}'+Drupal.t('data could not be loaded'));

					setTimeout(function(){
						consoleLoadFromURL(src);
					}, 1000 * 10);
				},
	            success : function(results) {

	            	res = JSON.parse(results);

	            	if(!results || res == 'Error'){

	            		idAppend('skip:notFound');

	            		consoleAppend('{error}' + Drupal.t('this term does not seem to appear on Wikipedia. Check the spelling or look for another one'));

	            		consoleSearch();

	            	} else {

	            		$('#console_in').val('').focus();

	            		console.log(res);

		            	if(results.indexOf('{error}') > -1){

		            		idAppend('skip:notFound');

		            		consoleAppend(JSON.parse(results), true);

		            		consoleSearch();

		            	} else {

		            		consoleAppend('{status}' + Drupal.t('found!'));

			            	$.each( res, function(key, val) {

			            		if(typeof val !== 'object')
			            			consoleAppend('{' + key + '}' + val);
			            		else {
			            			if(typeof keys !== 'undefined')
			            				consoleAppend('{' + key + '}' + Object.keys(val).length + ' keys');
			            		}

			            		if(showRelations && typeof val === 'object'){

			            			// res[key] = [];

			            			$.each( val, function(keyC, valC) {

			            				if(typeof valC !== 'object'){
				            				consoleAppend('{' + keyC + '}' + valC);
					            			res[key].push(valC);

					            			if(autoLoadRelations)
				            					appendToBuffer( decodeURIComponent(valC) );
					            		} else {

					            			consoleAppend('{' + keyC + '}');

					            			$.each( valC, function(keyD, valD) {

					            				consoleAppend('{' + keyD + '}' + valD);
					            				res[key].push(valD);

					            				if(autoLoadRelations)
				            						appendToBuffer( decodeURIComponent(valD) );
					            			});
					            		}
				            		});

				            		//res[key] = res[key].join();
				            		res[key] = encodeURIComponent(res[key]);


			            		}
			            		/*else if(typeof val == 'string' && (val.indexOf('.') > -1 || val.indexOf('/') > -1)){
			            			res[key] = encodeURIComponent(val);
			            		}*/
							});

							if(is(res, 'body') && res.body.indexOf('disambiguation%20page') > -1) {

								if(is(res, 'wikidata_id'))
			            			idAppend('dis:' + res.wikidata_id);
			            		else
			            			idAppend('dis');

			            		consoleAppend('{warning}' + Drupal.t('disambiguation page. Go on...'));

			            		consoleSearch();

			            		return;
			            	}

			            	//

							if($('[name="collectonly"]:checked').length){

								idAppend(res);

		            			consoleAppend('{status}' + Drupal.t('collected. Go on...'));

		            			consoleSearch();

		            			return;
		            		}

							if($('[name="timeonly"]:checked').length && !is(res, 'start_time')){

								if(is(res, 'wikidata_id'))
			            			idAppend('notime:' + res.wikidata_id);
			            		else
			            			idAppend('notime');

		            			consoleAppend('{warning}' + Drupal.t('no timely information. Go on...'));

		            			consoleSearch();

		            			return;
		            		}

		            		idAppend(res);

		            		var stringToSend = results;

		            		consoleAppend('{status}' + Drupal.t('saving'));

							saveNode(stringToSend);
			            }
					}
	            }
	        });

		}

		catch(e){
			logError('{error}' + e);
		}
	}

	function saveNode(sendData){

		try{

			$.ajax({
	            type: "POST",
	            url : '/ajax/importnewnode/',
	            data: {
		            postData: encodeURI(encodeURIComponent(sendData)),
		            override: $('[name="override"]:checked').length
		        },
	            // url : '/ajax/importnewnode/' + encodeURIComponent(JSON.stringify(data)),
			    error: function(xhr, ajaxOptions, thrownError) {
					consoleAppend('{error}' + thrownError, true);

					consoleSearch();
				},
	            success : function(results) {

	        		saveNodeResponse(results);

	        		consoleSearch();
	            }
	        });

        }

		catch(e){
			logError('{error}' + e);

			var tryAgain = setTimeout(function(){
				saveNode(sendData);
			}, 5000);
		}
	}

	function saveNodeResponse(response) {
    	consoleAppend(response, true);
    }

	function scroll(height, ele) {
		ele.stop().animate({
			scrollTop: height
		}, 1000);
	}

	function idAppend(obj){

		if(is(obj, 'wikidata_id'))
			$('#console_ids_ok').append('<div>' + obj.wikidata_id + '</div>');
		else if(typeof obj == 'string')
			$('#console_ids_ok').append('<div>' + obj + '</div>');
		else
			$('#console_ids_ok').append('<div>' + 'skip' + '</div>');

		//console.log(obj);
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

				//console.log(body);

				//appendToBuffer( decodeURIComponent(prebody) );

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

		//if(save){
			if(key == 'saved'){
				$('#console_history').append(html);
			} else if(key == 'warning' || key == 'error'){
				$('#console_errors').append(html);
			}

		//}

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

})(jQuery);