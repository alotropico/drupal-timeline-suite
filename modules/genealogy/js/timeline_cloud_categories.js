/**
 *  Timeline Cloud 2.0 dev
 *  Categories module
 *  
 */

(function($){
    "use strict";
    $.fn.extend({
        timelineCloudCategories: function(options) {

            // CONFIG
            var defaults = {
                container1: this,
                container2: this,
                categories: {},
                getItem: function(){},
                makeSelection: function(){}
            };

            var options = $.extend(defaults, options),
                base = this,
                container,
                buttons = {},
                selection = [],
                clicks,
                dcTimer,
                dcDelay = 300;

            // INIT

            function init(categories){

                options.container1.html('');
                options.container2.html('');

                var firstOther = false;

                $.each(categories, function(idx, cat){

                    if(cat[1] > 1) {

                        var cid = cat[0],
                            c = options.getItem.call(base, cid);

                        if(c){
                            cat.item = c;
                            buttons[idx] = cat;
                        }

                    } else {

                        if(firstOther === false){

                            firstOther = idx;

                            buttons[firstOther] = {
                                0: cat[0],
                                1: cat[1],
                                item: {
                                    id: 'more',
                                    val: 'other',
                                    css: 'tao',
                                    bod: 'categories with a single ocurrence'
                                }
                            };

                        } else {

                            buttons[firstOther][0] += ',' + cat[0];
                            buttons[firstOther][1] += cat[1];
                        }
                    }

                });

                /*buttons[firstOther+1] = {
                    0: "0",
                    1: 0,
                    item: {
                        id: 'undefined',
                        val: 'not specified',
                        css: 'tao',
                        bod: 'items with no specific category'
                    }
                };*/

                $.each(buttons, function(idx, cat){

                    var cid = cat[0],
                        c = cat.item;

                    if(isNaN(cid) && cid.indexOf('A') == 0)
                        var mc = appendCategory(options.container2, c, cat[1], true, idx);
                    else
                        var mc = appendCategory(options.container1, c, cat[1], false, idx);

                    mc.data('id', cid);

                    mc.click(function(e){

                        e.preventDefault();

                        clicks++;

                        if(clicks === 1) {

                            var crt = $(this).data('id');

                            dcTimer = setTimeout(function() {

                                clicks = 0;
                                selectCategory(crt, true);

                            }, dcDelay);

                        } else {
                            clicks = 0;
                            clearTimeout(dcTimer);
                            selectCategory($(this).data('id'), false);
                        }

                    });

                    mc.dblclick(function(e){
                        e.preventDefault();
                    });

                });
            }

            function selectCategory(cat, append){

                cat = cat.split(",");

                if(append) {

                    for(var i=0; i<cat.length; i++){
                        var ct = cat[i],
                            idx = selection.indexOf(ct);

                        if(idx > -1)
                            selection.splice(idx, 1);
                        else
                            selection.push(ct);
                    }

                } else
                    selection = cat;

                options.container1.add(options.container2).find('.cat-button').each(function(){
                    var active = false;

                    for(var i=0; i<selection.length; i++){
                        var itData = $(this).data('id').split(",");

                        if(itData.indexOf(selection[i]) > -1)
                            active = true;
                    }

                    if(active)
                        $(this).addClass('active').removeClass('unactive');
                    else {

                        if(selection.length)
                            $(this).addClass('unactive');
                        else
                            $(this).removeClass('unactive');

                        $(this).removeClass('active');
                    }
                });

                options.makeSelection.call(base, selection);
            }

            //

            function appendCategory(container, c, count, obj, sortId){

                var title = (is(c, 'bod') ? c.bod : '');

                if(count)
                    var css = 'cat-' + sortId;
                else
                    var css = 'cat-tao';

                if(title.indexOf(':') > -1)
                    title = title.substr(0, title.indexOf(':'));
                else
                    title = (title.indexOf('.') > -1 ? title.substr(0, title.indexOf('.')) : title);

                title = (title.indexOf('(') > -1 ? title.substr(0, title.indexOf('(')) : title);

                var path = (is(c, 'path') ? '/' + c.path : 'javascript:;');

                var html = '<a id="ct-' + c.id + '" href="' + path + '" class="cat-button" title="' + title + '">';

                if(!obj)
                    html += '<span class="bg ' + css + '">' + '</span>';

                html += c.val;

                if(count)
                    html += ' <sup>' + count + '</sup>';

                if(obj)
                    html += '<span class="bg ' + css + '">' + '</span>';

                html += '</div>';

                container.append(html);

                return container.find('#ct-' + c.id);

            }

            // TOOLS

            function is(obj, prop){
                if(obj && typeof obj[prop] !== 'undefined' && obj[prop])
                    return obj[prop];
                else
                    return false;
            }

            // METHODS

            this.refresh = function(items){

            }

            return this.each(function(){
                init(options.categories);
            });
        }
    });
})(jQuery);