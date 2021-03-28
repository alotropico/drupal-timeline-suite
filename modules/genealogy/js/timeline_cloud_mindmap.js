/**
 *  Mindmap 1.0 dev
 *  In the future could be repleced by something like this:
 *  https://bl.ocks.org/mbostock/4339607
 */
(function($){
    "use strict";
    $.fn.extend({
        mindmap: function(options) {

            // Config
            var defaults = {
                data : [],
                getFullItem : function(){},
                openItemDetail : function(){}
            };

            var options = $.extend(defaults, options),
                base = this;

            // INIT

            function init(data){

                var ret = '',
                    //totalPoints = data.length,
                    categories = {},
                    html = '';

                $.each(data, function(idx, d) {

                    var cat,
                        snack;

                    if(!is(d, 'prop'))
                        d.prop = [''];

                    for(var i=0; i<d.prop.length; i++){

                        var prop = d['prop'][i];

                        if(!prop){
                            cat = '';
                            snack = 'a';
                        }else if(prop.indexOf('A') == 0) {
                            cat = prop;
                            snack = 'c';
                        } else if(prop.match(/\d+/)[0] != d.id.match(/\d+/)[0]) {
                            cat = prop;
                            snack = 'b';
                        }

                        if(snack){

                            if(!is(categories, snack)){
                                categories[snack] = {};
                            }

                            if(!is(categories[snack], cat)){
                                categories[snack][cat] = [];
                            }

                            categories[snack][cat].push(d);

                        }

                    }
                });

                var stage = base.find('#gen_mindmap-stage');

                if(Object.keys(categories).length < 1){
                    html += '<div class="mindmap-content"><div class="msg">All items are shown in the timelines</div></div>';

                    stage.append(html);

                    return;
                }

                //html += '<div class="mindmap-content"><h3>No timely information</h3>';

                ['a','b','c'].forEach(function(cid) {

                    var c = (is(categories, cid) ? categories[cid] : false);

                    if(c){
                        html += '<div class="mindmap-branch mindmap-branch-' + cid + '">';

                        $.each(c, function(idx, d) {

                            html += '<div class="mindmap-set-wrap">';

                            var fullItem = options.getFullItem.call(base, idx),
                                label = '';

                            if(is(fullItem, 'val'))
                                label = fullItem.val;
                            else
                                label = '';

                            html += '<label class="' + d[0].css + ' c-item">' + label + '</label>';

                            html += '<div class="mindmap-set">';

                            var overflow = false;

                            var countHidden = 0;

                            for(var i=0; i<d.length; i++){

                                var it = d[i];

                                it.it_css += ' monad';

                                if(i<2)
                                    html += itemToHtml(it);
                                else {
                                    countHidden ++;
                                    it.it_css += ' hidden hideable';
                                    html += itemToHtml(it);
                                    overflow = true;
                                }
                            }

                            if(overflow){
                                html += itemToHtml({
                                        it_css:'default see-more',
                                        val: '+ ' + countHidden + ' more',
                                        id: '-1',
                                        path: '#'
                                    });

                                html += itemToHtml({
                                        it_css:'default see-less',
                                        val: '- Hide',
                                        path: '#'
                                    });
                            }

                            html += '</div>' +
                                    '</div>';
                        });

                        html += '</div>';
                    }
                });

                html += '</div>';

                stage.append(html);

                stage.find('.monad').each(function(){

                    $(this).click(function(e){

                        e.preventDefault();

                        var offset = $(this).offset();

                        options.openItemDetail.call(base, $(this).data('id'));

                    });
                });

                stage.find('.see-more').each(function(){
                    $(this).click(function(e){

                        e.preventDefault();

                        var set = $(this).closest('.mindmap-set');
                        set.addClass('expanded').find('.mindmap-item.hideable').each(function(){
                            $(this).removeClass('hidden');
                        });

                    });
                });

                stage.find('.see-less').each(function(){
                    $(this).click(function(e){

                        e.preventDefault();

                        var set = $(this).closest('.mindmap-set');
                        set.removeClass('expanded').find('.mindmap-item.hideable').each(function(){
                            $(this).addClass('hidden');
                        });

                    });
                });

                /*$.each(categories, function(idx, d) {

                    itemToHtml(d)
                });*/

                //console.log(categories);

                //base.find('#gen_mindmap-stage').append(ret);
            }

            function itemToHtml(d){

                var ret = '',
                    classes = ['mindmap-item'];

                // if(typeof d.pic != 'undefined')
                //     var pic = '<img alt="' + d.val + '" src="' + d.pic + '">';
                // else
                    //var pic = '';

                // if(is(d, 'css'))
                //     classes.push(d.css);

                if(is(d, 'it_css'))
                    classes.push(d.it_css);

                var valor = (typeof d.val !== 'undefined'? d.val : 'n/n ' + idx),
                    //label = (typeof d.label !== 'undefined'? d.label + ': ' : ''),
                    //suffix = (typeof d.suffix !== 'undefined'? ' ' + d.suffix : ''),
                    title = '<span>' + 
                                '<a href="/' + d.path + '">' +
                                    //pic +
                                    //label + 
                                    d.val +
                                    //suffix +
                                '</a>' +
                            '</span>';

                ret +=  '<div class="mind-item"><div class="' + classes.join(' ') + '" data-id="' + d.id + '">' +
                            title +
                        '</div></div>';

                return ret;
            }

            function is(obj, prop){
                if(obj && typeof obj[prop] !== 'undefined' && obj[prop])
                    return obj[prop];
                else
                    return false;
            }

            return this.each(function(){

                base.prepend(   '<div class="gen-mindmap-shell">' +
                                    '<div id="gen_mindmap" class="gen-mindmap">' +
                                        '<div id="gen_mindmap-stage" class="gen-mindmap-wrap">' +
                                        '</div>' +
                                    '</div>' +
                                '</div>');

                init(options.data);
            });
        }
    });
})(jQuery);