/**
 *  Timeline Cloud 2.0 dev
 *
 *  Some inspiration:
 *  https://pomax.github.io/bezierinfo/
 *  http://cubic-bezier.com/
 *  https://www.desmos.com/calculator/cahqdxeshd
 *  
 */

(function($){
    "use strict";
    $.fn.extend({
        timelineCloudBrain: function(options) {

            // Config
            var defaults = {
                data : [],
                getFullItem : function(){},
                editableNode : function(){},
                openItemDetail : function(){},
                timeNatureByTime : function(){}
            };

            var options = $.extend(defaults, options),
                base = this,
                currentDate = nowDate(),
                stage,
                rawData = {},
                rawItems = {},
                items = {},
                taos = {},
                taosCount = 0,
                categoriesGroups = {},
                currentGroup = '',
                categories = {},
                timelines = [],
                oldTimelines = [],
                mod_render,
                mod_groups,
                mod_tax,
                rawSelection,
                currentStart,
                currentEnd,
                oldStart,
                oldEnd,
                currentPeriod,
                absoluteStart,
                absoluteEnd,
                zoomTO,
                zoomDelta = 0;

            var db_id = {
                'instance_of' : 657750
            };

            // CONSTANTS

            var verticalProportions = /*[30, 28, 26, 24, 22, 20, 18, 16, 14, 12],//*/[50, 36, 24, 24, 24, 20, 18],//[40, 30, 28, 24, 24, 24, 16, 16, 16, 16, 16, 16, 16, 12],
                now = (new Date()).getFullYear(),
                heightOfTimeline = 3,
                deepDistribution = false,
                timeZero = -100000000000, 
                timeZ = 100000000000000;

            // INIT

            function nowDate(){
                var now = (new Date()),
                    year = now.getFullYear(),
                    month = now.getMonth(),
                    days = new Date(year, month, 0).getDate();

                return year + month/12 + (now.getDate()/days)*(1/12);
            }

            function init(data){
                rawData = $.extend(true, {}, data);

                setTaos(rawData);

                categoriesGroups = getGroups(data, 'sets');

                currentGroup = getGroupsBiggest(categoriesGroups);

                mod_render = base.timelineCloudRender({
                    'getStyle': elementVizCssExt,
                    'itemClick': openItemDetail,
                    'periodClick' : gotoPeriod
                });
                stage = $('.timeline-stage');

                if(!$.isEmptyObject(categoriesGroups)){

                    mod_groups = base.timelineCloudGroups({
                        'container': base.find('.timeline-groups'),
                        'groups': categoriesGroups,
                        'defaultSelection': currentGroup,
                        'makeSelection': changeGroup
                    });

                } else {
                    base.find('.timeline-groups').hide();
                }

                changeGroup(currentGroup);

                setupInteractions();

            }

            function changeGroup(groupId){

                currentGroup = groupId;

                items = dataSanitize($.extend(true, {}, rawData));

                if(is(categoriesGroups[currentGroup], 'cats')){
                    categories = categoriesGroups[currentGroup].cats;
                    categories = sortCategories(categories);
                } else {
                    categories = [];
                }

                if(!categories.length)
                    base.find('.timeline-categories-wrap').hide();
                else {

                    mod_tax = base.timelineCloudCategories({
                        'container1': base.find('.timeline-categories-1'),
                        'container2': base.find('.timeline-categories-2'),
                        'categories': categories,
                        'getItem': getItem,
                        'makeSelection': makeSelection
                    });
                }

                items = itemCategoryAttrs(items, categories, taosCount);
                items = itemAttrs(items);

                refresh(items, '', true);
            }

            function setupInteractions(){

                $(window).resize(function(){
                    refresh(rawItems, rawSelection, true);
                });

                stage.aloDragAndDrop({
                    vertical: true,
                    horizontal: false,
                    centered: true
                });

                $('.timeline-content').aloDragAndDrop({
                    vertical: false,
                    horizontal: true,
                    tolerance: 1,
                    onRelease: refreshFromDrag
                });

                $('.timeline-categories-wrap').aloDragAndDrop({
                    vertical: false,
                    horizontal: true
                });

                base.find('.menu-bt').click(function(){
                    var menu = base.find('.timeline-menu');

                    if(menu.hasClass('visible')){
                        base.find('.velo').remove();
                        menu.removeClass('visible');
                        $(this).removeClass('visible');
                    } else {
                        base.prepend('<div class="velo"></div>')
                        menu.addClass('visible');
                        $(this).addClass('visible');

                        base.find('.velo').click(function(){
                            base.find('.menu-bt').trigger('click');
                        });
                    }
                });

                var ref = $('.timeline-wrap');

                ref.bind('mousewheel', function(e){
                    e.preventDefault();
                    var x = (e.pageX - $(this).offset().left) / $(this).width();
                    zoomCatcher(x, e.deltaY);
                });

            }

            function zoomCatcher(pos, delta){

                clearTimeout(zoomTO);
                if(delta>0) delta = 1.5; else delta = -1.5;

                zoomDelta += delta;
                if(zoomDelta>4) zoomDelta = 4;
                if(zoomDelta<-4) zoomDelta = -4;

                zoomTO = setTimeout(function(){
                    zoom(pos, zoomDelta);
                    zoomDelta = 0;
                }, 200);
            }

            function zoom(pos, delta){

                //delta = delta>-6 ? delta : -6;

                var dif = Math.abs(currentEnd - currentStart);

                var as = currentStart + dif * (pos)*delta*0.2;
                var ae = currentEnd - dif * (1-pos)*delta*0.2;

                if(as < timeZero)
                    as = timeZero;

                if(ae > timeZ)
                    ae = timeZ;

                //console.log(absoluteStart, as, ' ... ', absoluteEnd, ae);

                if(absoluteStart != as || absoluteEnd != ae){

                    absoluteStart = as;
                    absoluteEnd = ae;

                    refresh(rawItems, rawSelection, false);
                }
            }
            function refreshFromDrag(coef){
                var dif = (currentEnd - currentStart) * coef[0];

                absoluteStart = currentStart - dif;
                absoluteEnd = currentEnd - dif;

                refresh(rawItems, rawSelection, false, false);

                $('.timeline-content').css({
                    left: '0px'
                });
            }

            function openItemDetail(it){
                options.openItemDetail.call(base, it);
            }

            function makeSelection(selection){

                absoluteStart = false;
                absoluteEnd = false;

                rawSelection = selection;

                refresh(rawItems, selection, true);
            }

            function getItem(itemId){
                return options.getFullItem.call(base, itemId);
            }

            function dataSanitize(data){
                var ret = {};

                $.each(data, function(idx, d){

                    if(is(d, 's')){

                        if(is(d, 'e') && !isTao(d) && (isHuman(d, true) || isShowAsPoint(d)) )
                           d.e = d.s;
                        
                        ret[idx] = d;
                    }

                });

                return ret;
            }

            function isHuman(d, strict){

                if(is(d, 's_p') && is(d.s_p, 'timetype') && d.s_p['timetype'] == 'P569')
                    return true;
                if(!strict && is(d, 'sets') && is(d.sets, '657750') && is(d.sets['657750'], 'vals') && d.sets['657750'].vals.includes('657756'))
                    return true;
                else
                    return false;
            }

            function isShowAsPoint(d){

                if(is(d, 'sets') && is(d.sets, '730781') && is(d.sets['730781'], 'vals') && d.sets['730781'].vals.includes('740286'))
                    return true;
                else
                    return false;
            }

            function sortByKey(array, key) {
                return array.sort(function(a, b) {

                    var x = a[key],
                        y = b[key];

                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            }

            function refresh(items, filters, uncut, animate){

                filters = (typeof filters != 'undefined' ? filters : false);
                uncut = (typeof uncut != 'undefined' ? uncut : true);
                animate = (typeof animate != 'undefined' ? animate : true);

                rawItems = $.extend(true, {}, items);

                var localTaos = itemsVizSanitize(getTaos(items));
                var taosBounds = getTimeBounds(taos, true);
                    

                /*switch(mode){

                    case 'by tao':
                    case 'by prop':
                        items = itemsFilterByCategory(items, filters, 'prop');
                        break;

                    case 'sets':
                        
                        break;

                    case 'by time':
                        items = itemsFilterByTime(items, [s, e], true);
                        break;

                    default:

                        var taosBounds = getTimeBounds(taos, true);

                        if(taosBounds[0])
                            items = itemsFilterByTime(items, taosBounds, true);
                }*/



                if(absoluteStart && absoluteEnd){

                    items = itemsFilterByCategory(items, filters, 'sets');

                    if(!uncut){

                        var marg = (absoluteEnd - absoluteStart)/5;

                        items = itemsFilterByTime(items, [absoluteStart-marg, absoluteEnd+marg/2], false);

                    } else {

                        items = itemsFilterByTime(items, [absoluteStart, absoluteEnd], false);
                    }

                } else if(!is(filters, 0) && taosBounds[0]) {

                    items = itemsFilterByTime(items, taosBounds, true);

                } else {

                    items = itemsFilterByCategory(items, filters, 'sets');
                }

                // Convert object to ARRAY
                // Make sure s and e are valid and numeric
                items = itemsVizSanitize(items);

                if(!items.length)
                    return false;

                items.sort(function(a, b) { 
                  return b.hie - a.hie;
                });

                if(items.length > 520)
                    items = items.slice(0, 520);

                // items (data) bounds

                var bounds = getTimeBounds(items, false);

                /*if(absoluteStart){
                    var dif = bounds[1] - bounds[0],
                        absDif = absoluteEnd - absoluteStart;

                    if(absDif <= dif*10)
                        bounds = [absoluteStart, absoluteEnd];
                }*/

                if(absoluteStart){
                    bounds = [absoluteStart, absoluteEnd];
                }

                if(bounds[1] < bounds[0] + 10)
                    bounds[1] = bounds[0] + 10;

                items = itemsVPC(items, verticalProportions);

                items = itemsVizHorizontal(items, bounds);

                items = itemsVizVertical(items);


                // visual bounds

                var vBounds = getVisualBounds(items, false);

                currentStart = vBounds[0];
                currentEnd = vBounds[1];

                if(absoluteStart){

                    if(absoluteStart < timeZero)
                        absoluteStart = timeZero;

                    if(absoluteEnd > timeZ)
                        absoluteEnd = timeZ;

                    if(uncut){
                        currentStart = (currentStart<absoluteStart ? currentStart : absoluteStart);
                        absoluteStart = currentStart;

                        currentEnd = (currentEnd>absoluteEnd ? currentEnd : absoluteEnd);
                        absoluteEnd = currentEnd;
                    } else {
                        currentStart = absoluteStart;
                        currentEnd = absoluteEnd;
                    }
                } else {

                    if(uncut){

                        var cdif = currentEnd - currentStart;
                        currentStart -= cdif/100;
                        currentEnd += cdif/100;
                    }
                }

                if(typeof oldStart === 'undefined'){
                    oldStart = currentStart;
                    oldEnd = currentEnd;
                }

                // guides

                var guides = getGuides(currentStart, currentEnd);

                if(!guides.length)
                    guides = getGuidesDecimal(currentStart, currentEnd);

                // special items

                var specials = getSpecials(currentStart, currentEnd);

                // render

                var h = Math.round(timelines.length * heightOfTimeline);

                if(h>stage.parent().outerHeight()) h = stage.parent().outerHeight();
                
                var y = -(h - stage.parent().height())/2;

                if(animate){
                    //$('.timeline-content').addClass('animate');
                    stage.addClass('animate');
                } else {
                    //$('.timeline-content').removeClass('animate');
                    stage.removeClass('animate');
                }

                stage.css({
                    height: h,
                    transform: 'translate(0, ' + y + 'px)',
                    left: '0px',
                    top: '0px'
                });

                items = itemsDimensions(items, currentEnd-currentStart, timelines.length, stage.width(), stage.height());

                mod_render.refreshRender(items, guides, specials, vBounds[0], vBounds[1], animate);

                oldStart = currentStart;
                oldEnd = currentEnd;
                oldTimelines = timelines;
            }

            function toArray(obj){
                var ret= [];
                $.map(obj, function(value, index) {
                    ret.push(value);
                });
                return ret;
            }

            function getGuides(s, e){
                var ret = [];

                var dif = e-s;
                s -= dif;
                e += dif;

                var roundTo = Math.round((e-s)/24);

                var rNr = Math.pow(10, Math.round(roundTo.toString().length-1));
                var roundTo = Math.round(roundTo/rNr) * rNr;

                var sR = Math.round( Math.round(s/roundTo) * roundTo);
                var eR = Math.round( Math.round(e/roundTo) * roundTo);

                for(var i=sR; i<=eR; i+=roundTo){

                    var v = Math.round(i);
                    if(v==0) v=1;

                    ret.push({'a': v});
                }
                if(sR<s) ret[0] = {'a': s}; else if(sR>s+roundTo*2) ret.unshift(s);
                if(eR>e) ret[ret.length-1] = {'a': e}; else if(eR<e-roundTo*2) ret.push({'a': e});

                return ret;
            }
            function getGuidesDecimal(s, e){
                var ret = [];

                var idn = s;
                var dif = (e - s) / 10;

                s -= dif;
                e += dif;

                for(var i=s; i<=e; i+=dif){
                    var v = i;
                    if(v==0) v=1;

                    ret.push({'a': v});
                }
                // if(sR<s) ret[0] = {'a': s}; else if(sR>s+roundTo*2) ret.unshift(s);
                // if(eR>e) ret[ret.length-1] = {'a': e}; else if(eR<e-roundTo*2) ret.push({'a': e});

                return ret;
            }

            // special

            function gotoPeriod(it){

                var current;

                if(currentPeriod != it.id){
                    current = it;
                } else {
                    current = {id: false, a: false, z: false};
                }

                currentPeriod = current.id;
                absoluteStart = current.a;
                absoluteEnd = current.z;

                refresh(rawItems, rawSelection, true);
            }

            function getSpecials(s, e){

                var ar = [],
                    periods = JSON.parse(JSON.stringify(timePeriods)),
                    includes = [],
                    dif = e-s;

                s -= dif;
                e += dif;

                if(typeof periods !== 'undefined'){

                    for(var i=0; i<periods.length; i++){
                        var p = periods[i];

                        if(!is(p, 'a'))
                            p.a = s;

                        if(!is(p, 'z'))
                            p.z = e;

                        var periodIdx = (p.z-p.a) / (e-s);

                        if( p.a<e && p.z>s && periodIdx > 0.001 ){

                            var include = true;

                            if(is(p, 'parent')){
                                // for(var i=0; i<ar.length; i++){

                                include = false;

                                for(var j=0; j<includes.length; j++){

                                    if(includes[j] == p.parent){
                                        include = true;
                                        break;
                                    }
                                }

                                // if(include)
                                //     ret.push(p);
                            }

                            if(include){

                                if(periodIdx > .7/3 && !is(p, 'sterile')){

                                    //if()
                                    includes.push(p.id);

                                } else {

                                    if(p.a<s) p.a = s;
                                    if(p.z>e) p.z = e;

                                    p.period = p.z-p.a;
                                    p.css = 'color-' + i;
                                    ar.push(p);
                                }

                            }
                        }

                    }
                    //var ar = [{a: now, z: e, id: 'now', period: e-now}];

                }

                // var ret = [];

                // for(var i=0; i<ar.length; i++){
                //     var include = true;

                //     for(var j=0; j<excludes.length; j++){

                //         if(excludes[j] == ar[i].id){
                //             include = false;
                //             break;
                //         }
                //     }

                //     if(include)
                //         ret.push(ar[i]);
                // }

                return ar;
            }

            // GROUPS & CATEGORIES

            function getGroups(data, attr){
                var groups = {};

                $.each(data, function(idx, d){

                    //var getItem();

                    if((is(d,'s') || is(d,'e')) && is(d, attr)){

                        $.each(d[attr], function(sid, set){

                            if(is(set, 'group') && is(set, 'vals')){

                                var group = set.group;

                                if(!is(groups, group))
                                    groups[group] = [];

                                set.vals.forEach(function(val){
                                    groups[group].push({
                                        'prop': val,
                                        'it': idx
                                        });
                                });

                                //groups[group] = groups[group].concat(set.vals);

                            }

                        });
                    }
                });

                var groupsPro = {};

                $.each(groups, function(gid, g){

                    var categories = getCategories(g);
                    var diversity = categoryDiversity(categories);

                    if(categoryDiversity(categories) >= 2){
                        groupsPro[gid] = {
                            cats: categories,
                            diversity: diversity
                        }
                    }
                });

                //console.log(groupsPro);

                return groupsPro;
            }

            function categoryDiversity(cat){

                var ret = 0;

                $.each(cat, function(cid, c){

                    if(c && c.length>1)
                        ret++;
                });

                return ret;
            }

            function getGroupsBiggest(groups){

                var ret,
                    big = 0;

                $.each(groups, function(gid, group){
                    if(group.diversity > big){
                        big = group.diversity;
                        ret = gid;
                    }
                });

                return ret;
            }

            function getCategories(categories){
                var ret = {};

                $.each(categories, function(cid, c){

                    if(is(c, 'prop') && is(c, 'it')){

                        var catId = c.prop;

                        if(!is(ret, catId))
                            ret[catId] = [];

                        ret[catId].push(c.it);
                    }
                });

                return ret;
            }

            // Converts categories into a sorted array
            // for each place it has the values:
            // [categoryNid, category item count, category item ids as an array]
            function sortCategories(cats){

                var ar = [],
                    ret = {};

                $.each(cats, function(idx, d){
                    ar.push([idx, d.length, d]);
                });

                ar = ar.sort(function(a,b) { return b[1] - a[1]; });

                return ar;
            }

            // ITEMS

            function itemCategoryAttr(items, cat, hasTao, i){

                if(!is(cat, 2))
                    return true;

                for(var j=0; j<cat[2].length; j++){

                    var id = cat[2][j];

                    // first condition is for layers to be
                    // no more than one
                    // (one color per item)
                    // since we've turned off the multi-layer

                    if( !is(items[id], 'layers') && is(items, id) ) {

                        var layers = 'cat cat-' + i + ' bgs-' + j;

                        if(hasTao)
                            layers += ' pro-' + cat[0];
                        else
                            layers += ' ins-' + cat[0];

                        layers += ' catQty-' + cat[1];

                        if(!is(items[id], 'layers'))
                            items[id].layers = [];

                        items[id].layers.push(layers);

                        if(!is(items[id],'catHie') || items[id]['catHie'] > i )
                            items[id]['catHie'] = i;

                    }
                }
            }

            function itemCategoryAttrs(items, cats, hasTao){

                //console.log(cats);

                var startPoint = cats.length-1;

                for(var i=cats.length-1; i>=0; i--){
                    if(cats[i][2].length > 1){
                        startPoint = i;
                        break;
                    }
                }

                for(var i=0; i<=startPoint; i++){

                    itemCategoryAttr(items, cats[i], hasTao, i);
                }

                for(var i=startPoint; i<cats.length; i++){

                    itemCategoryAttr(items, cats[i], hasTao, startPoint+1);
                }

                return items;
            }

            function itemInstanceOf(d){
                var ret = [];

                if(is(d, 'sets') && is(d.sets, db_id.instance_of)){

                    d['sets'][db_id.instance_of].vals.forEach(function(val){
                        ret.push(val);
                    });
                }

                //console.log(ret);

                return ret;
            }

            function itemAttrs(items){

                $.each(items, function(idx, it){
                    var css = [];

                    if(isOdd(idx))
                        it.tli = 0;
                    else
                        it.tli = 1;

                    if(is(it, 'tao') && it.tao == it.id)
                        css.push('tao');

                    css.push('mon');

                    //css.push('mon-' + it.id);

                    if(is(it, 'pic'))
                        css.push('haspic');

                    // if(is(it, 'layers'))
                    //     css.push('lys-' + it.layers.length);

                    var iof = itemInstanceOf(it);

                    if(iof){
                        iof.forEach(function(val){
                            css.push('iof-' + val);
                        });
                    }

                    if(is(it, 's_p')){

                        if(is(it['s_p'], 'timetype')) {

                            var timetype = options.timeNatureByTime.call(base, it['s_p']['timetype']);

                            if(is(timetype, 1))
                                css.push('tmn-' + timetype[1]);

                            if((!timetype || !is(timetype, 1)) && !is(it, 'e')){
                                it.ext = 'point';
                            } else {

                                //if(is(it, 'e')){

                                    it.ext = 'period';

                                /*} else if(currentDate-it.s < 150 && it.s_p['timetype'] == 'P569'){
                                    it.e = currentDate;//it.e;

                                    //console.log(it);

                                    it.ext = 'period';*/

                                // } else {
                                //     it.ext = 'timespan';
                                // }
                                //else
                                //    it.ext = 'timespan';
                            }
                        }

                        if(is(it, 'ext'))
                            css.push('tmn-' + it.ext);
                    }

                    it.css = css;

                });

                return items;
            }

            function itemsVizSanitize(items){

                var ret = [];

                // Calculate times for the Genealogy

                $.each(items, function(idx, d){

                    d.s = Number(d.s);
                    d.e = Number(d.e);
                    d.e = (d.e ? d.e : d.s);
                    d.e = (d.e > d.s ? d.e : d.s);
                    d.period = (d.e ? d.e-d.s : 0);

                    ret.push(d);
                });

                return ret;
            }

            function itemsLimitByCategory(items){

                var ret = [];
                var cats = {};

                for(var i=0; i<items.length;i++){
                    var it = items[i];

                    if(is(it, 'prop')){

                        var prop = it.prop[0];

                        if(!is(cats, prop))
                            cats[prop] = 0;

                        cats[prop]++;

                        if(cats[prop] < 10000)
                            ret.push(it);
                    }
                }

                return ret;
            }

            // Asigns the VPC
            // (vertical proportion coeficient)
            // to every item
            function itemsVPC(items, h){

                items.forEach(function(d, idx) {
                    var counter = Math.floor((idx)/6 + 0.9);
                    if(counter > h.length-1) counter = h.length - 1;

                    d.vpc = h[counter];
                });

                return items;
            }

            // Calculates actual size of the item in pixels
            function itemsDimensions(items, dur, tls, w, h){

                items.forEach(function(d, idx) {

                    var len = d.len;

                    if(is(d, 'pic'))
                        len /= 2;

                    d.size = {
                        'w': (d.lar/dur) * w,
                        'h': (d.vpc/tls) * h
                    };
                });

                return items;
            }

            function itemsVizHorizontal(items, bounds){

                for(var i=0; i<items.length; i++){
                    var d = items[i];

                    d.a = d.s;

                    var timeLength = bounds[1] - bounds[0];

                    var dif = d.e - d.s;

                    var coef = d.vpc/verticalProportions[0];

                    var txCoef = d.val.length/50;

                    if(txCoef > 1) txCoef = 1;

                    var minItemLapse = timeLength * 0.1 * coef + timeLength * 0.015 + timeLength * 0.02 * txCoef;

                    d.lar = minItemLapse;

                    if(is(d, 'pic'))
                        minItemLapse += timeLength * 0.02;

                    // if(minItemLapse < 1)
                    //     minItemLapse = 1;

                    if(dif < minItemLapse){
                        d.z = d.s + minItemLapse;
                        //d.bg = Math.round(1000 * dif/minItemLapse)/10;
                    } else {
                        d.z = d.e;
                        d.lar = d.z - d.a;
                    }

                    d.len = d.z - d.a;
                }

                return items;
            }

            // calculates timelines
            function itemsVizVertical(items){

                var tls = [[], []];

                items.forEach(function(d, idx) {

                    //if(tls[0].length < 180 && tls[1].length < 180)
                    tls = timelineGetBetter(d, d.vpc, tls);

                });

                timelines = [];

                for(var i=tls[1].length-1; i>=0; i--){
                    timelines.push(tls[1][i]);
                }

                timelines = timelines.concat(tls[0]);

                return itemsTimelines(items, timelines);
            }

            // current item, amount of timelines occupied, timelines array
            function timelineGetBetter(d, h, tls){

                var tmlns,
                    ret,
                    dif,
                    tl1,
                    tl2;

                tmlns = $.extend(true, [], tls);
                tl1 = timelineAsign(d, h, tmlns, 1);

                tmlns = null;
                tmlns = $.extend(true, [], tls);
                tl2 = timelineAsign(d, h, tmlns, 0);

                //console.log(d);

                if(!tl1 && !tl2){

                    ret = tmlns;

                } else if(!tl1) {

                    ret = tl2;

                } else if(!tl2) {

                    ret = tl1;

                }else if(is(d, 'tli')) {

                    if(d.tli == 0){
                        ret = tl1;
                    } else {
                        ret = tl2;
                    }

                } else {

                    dif = tl1[0].length + tl2[0].length - tl1[1].length - tl2[1].length;

                    if(dif == 0){

                        if(deepDistribution){

                            var tlsLengths = [0, 0];

                            for(var k=0; k<tls.length; k++){

                                for(var l=0; l<tls[k].length; l++){

                                    for(var m=0; m<tls[k][l].length; m++){

                                        tlsLengths[k]++;
                                    
                                    }
                                }
                            }

                            if(tlsLengths[0].length < tlsLengths[1].length){
                                ret = tl1;
                            } else if(tlsLengths[0].length > tlsLengths[1].length){
                                ret = tl1;
                            } else {
                                ret = tl1;//(Math.random() > 0.5 ? tl1 : tl2);
                            }
                        } else {
                            
                            ret = tl1;
                        }

                    } else if(dif>0)
                        ret = tl1;
                    else
                        ret = tl2;
                }

                return ret;
            }

            // gets an item,
            // a vpc (how many timelines will the item take)
            // and an array of current timelines
            // returns the updated timelines
            function timelineAsign(d, h, tls, tli){

                //var ret = -1,
                var first = -1,
                    space = 0;/*,
                    tli = (tls[0].length > tls[1].length ? 1 : 0);*/

                for(var i=0; i<tls[tli].length+h; i++){

                    var tl = is(tls[tli], i);

                    if(tl){
                        for(var j=0; j<tl.length; j++){

                            var isSpace = true,
                                bro = tl[j];

                            if(d.z<=bro[0] || d.a>=bro[1]){
                                //
                            } else {
                                isSpace = false;
                                break;
                            }
                        }

                        if(isSpace){
                            if(!space)
                                first = i;
                            space++;

                            if(space >= h)
                                break;
                        } else {
                            first = -1;
                            space = 0;
                        }

                    } else {
                        if(!space)
                            first = i;

                        space++;
                        if(space >= h)
                            break;
                    }
                }

                if(first<120){

                    for(var i=first; i<first+h; i++){

                        if(!is(tls[tli], i))
                            tls[tli][i] = [];

                        //console.log(tls[tli]);

                        tls[tli][i].push([d.a,d.z,d.id,tli]);
                    }

                    return tls;

                } else {

                    return false;

                }
            }

            function itemsTimelines(items, tls){

                var ret = [];

                items.forEach(function(d, idx) {

                    var tl = [],
                        tli;

                    for(var i=0; i<tls.length; i++){

                        for(var j=0; j<tls[i].length; j++){

                            var t = tls[i][j];

                            if(t[2] == d.id){
                                if(!is(tl, 0)) {
                                    tl = [i, 1];
                                    tli = t[3];
                                } else
                                    tl[1]++;

                                // AGREGAR UN BREAK
                                // CUANDO ENCUENTRO EL FINAL
                                // DE LA TL
                            }
                        }
                    }

                    if(is(tl, 0)){

                        d.tl = tl;
                        d.tli = tli;

                        //d.dist = Math.abs(tls.length/2 - (tl[0]-tl[1]/2));

                        ret.push(d);
                    }
                });

                // console.log(ret);

                return ret;
            }

            // ELEMENTS VISUALIZATION

            function elementVizCssExt(it, mode){

                var oldIt = elementVizCss(it, oldStart, oldEnd, oldTimelines);
                var newIt = elementVizCss(it, currentStart, currentEnd, timelines);
                var style = {};

                if(mode != 'new'){
                    style = newIt;
                    if(mode == 'gone'){
                        style.y = oldIt.y;
                        style.h = oldIt.h;
                    }
                    return style;
                } else {
                    style = oldIt;
                    style.y = newIt.y;
                    style.h = newIt.h;
                    return style;
                }
            }

            function elementVizCss(it, start, end, tls){

                //console.log(stage.width(), stage.height());

                //console.log(it, start, end, tls);

                var ret = {};

                //ret.h = elementVizH(it.tl[1]-1, timelines.length);

                //if(is(it, 'a'))
                    ret.x = num(elementVizX(it.a, start, end));

                if(tls && is(it, 'tl'))
                    ret.y = num(elementVizY(it.tl[0], tls.length));
                else
                    ret.y = 0;

                if(is(it, 'period'))
                    ret.w = num(elementVizW(it.period, start, end));
                else ret.w = 0;

                if(tls && is(it, 'tl'))
                    ret.h = num(elementVizH(it.tl[1]-1, tls.length));
                else
                    ret.h = 1;

                return ret;
            }

            function num(val){
                if(isNaN(val))
                    return 100;
                else
                    return val;
            }

            function elementVizX(x, t1, t2){

                return stage.width() * 1 * (x-t1) / (t2-t1);
            }

            function elementVizY(y, tls){

                return stage.height() * (y / tls);
            }

            function elementVizW(w, t1, t2){
                // t1 = typeof t1 !== 'undefined' ? t1 : s;
                // t2 = typeof t2 !== 'undefined' ? t2 : e;

                return stage.width() * 0.01 * w / (t2 - t1);
            }

            function elementVizH(h, tls){

                return stage.height() * 0.01 * (h / tls);

            }

            // FILTER ITEMS

            function itemsFilterByTime(items, t, cut){

                var ret = {};

                $.each(items, function(itId, it){
                    if(is(it, 's') && (!is(t, 0) || it.s >= t[0] ) && (!is(t, 1) || it.s <= t[1] )){

                        if( !is(it, 'e') || !is(t, 1) || ( (is(it, 'e') && is(t, 1) && it.e <= t[1] + 1) ) ){

                            ret[itId] = it;
                        }
                    }
                });

                return ret;
            }

            function itemsFilterByCategory(items, cats, mode){

                if(typeof cats == 'undefined' || !cats.length){
                    return items;
                }

                var ret = {};

                $.each(items, function(itId, it){

                    var cat = false;
                    
                    if(is(it, mode))
                        cat = it[mode];

                    else if(is(it,[mode]))
                        cat = it[mode];

                    //console.log(cat, currentGroup);

                    // if(is(cat, currentGroup))
                    //     console.log(cat[currentGroup]);

                    //console.log(cat);
                    // else if(is(it,'ids') && is(it.ids, mode))
                    //     cat = it.ids[mode];

                    if(cat){

                        //console.log(cat);

                        var go = true;

                        $.each(cat, function(prop, obj){

                            if(is(obj, 'group') && obj.group == currentGroup){

                                if(is(obj, 'vals')){

                                    obj.vals.forEach(function(id){

                                        if(cats.includes(id)){
                                            ret[itId] = it;
                                            go = false;
                                        }

                                        // if(!go)
                                        //     break;

                                    });
                                }
                            }

                            if(!go)
                                return false;
                        });

                        /*loop2:
                        for(var j=0; j<cat.length; j++){

                            for(var i=0; i<cats.length; i++){
                                if(cat[j] == cats[i]){
                                    
                                }
                            }
                        }*/
                    }
                });

                return ret;
            }

            //  TAOS

            function setTaos(data){
                taosCount = 0;

                $.each(data, function(idx, d){
                    if(is(d, 'tao') && d.tao == d.id){
                        taos[idx] = d;
                        taosCount++;
                    }
                });

                //console.log(taos);
            }

            function isTao(d){

                if(is(taos, d.id))
                    return true;
                else
                    return false;
            }

            function getTaos(data){
                var ret = [];

                $.each(data, function(idx, d){
                    if(is(d, 'tao') && d.tao == d.id){
                        ret.push(d);
                    }
                });

                return ret;
            }

            // BOUNDS

            function getTimeBounds(items, extend){
                var ret = [null, null];

                $.each(items, function(itId, it){

                    if(is(it, 's') && (!is(ret, 0) || it.s<ret[0]))
                        ret[0] = it.s;

                    if(is(it, 'e') && (!is(ret, 1) || it.e>ret[1]))
                        ret[1] = it.e;

                    if(is(it, 'z') && (!is(ret, 1) || it.z>ret[1]))
                        ret[1] = it.z;
                });

                if(extend) {

                    var ext = 80;

                    if(is(ret, 0)){
                        ext = (Math.round(now-ret[0]).toString().length + 1) * 20;
                        ret[0] -= ext;
                    }

                    if(is(ret, 1))
                        ret[1] += ext * 2;
                    else if(is(ret, 0))
                        ret[1] = now + ext*2;//ret[0] + 1160;
                }

                if(ret[1] <= ret[0])
                    ret[1] = ret[0]+1;

                return ret;
            }

            function getVisualBounds(items){
                var ret = [null, null];

                $.each(items, function(itId, it){
                    if(is(it, 'a') && (!is(ret, 0) || it.a<ret[0]))
                        ret[0] = it.a;

                    if(is(it, 'z') && (!is(ret, 1) || it.z>ret[1]))
                        ret[1] = it.z;
                });

                return ret;
            }

            // TOOLS

            function is(obj, prop){
                if(obj && typeof obj[prop] !== 'undefined' && obj[prop])
                    return obj[prop];
                else
                    return false;
            }

            function isOdd(num) { return num % 2;}

            /*this.hoverStage = function(mouseX){
                hoverStage(mouseX);
            }*/

            return this.each(function(){
                init(options.data);
            });
        }
    });
})(jQuery);