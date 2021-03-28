(function($){
    "use strict";
    $.fn.extend({
        timelineCloud: function(options) {

            // Config
            var defaults = {
                screenMode: 'fullScreen',
                queryUrl: ""
            };

            var base = this,
                timeline,
                rawData,
                mod_interpreter,
                mod_win;

            function init(){

                mod_interpreter = base.timelineCloudInterpreter({
                    'getItem' : getItem
                });

                mod_win = base.timelineCloudWindow({
                    editableNode : queueNode
                });

                if(options.screenMode == "fullScreen"){

                    resize();

                    $(window).resize(function(){
                        resize();
                    });

                }

                loadData();

            }

            function openItemDetail(it){
                var html = mod_interpreter.template(getItem(it));
                mod_win.newWindow(html);
            }

            function loadData(){

                $.ajax({
                    dataType: "json",
                    url: options.queryUrl,

                    error: function(error){
                        console.log(error);
                    },
                    success: function(data){

                        if(is(Drupal, 'admin'))
                            console.log(data);

                        rawData = data;

                        setTimeout(function(){

                            var send = {},
                                orphans = {};

                            send = $.extend(true, send, data.tao);
                            send = $.extend(true, send, data.timely);

                            /*
                            // Print string of timely wikidata ids
                            var str = '';
                            $.each(data.timely, function(id, d){
                                str += d.ids.wikidata[0] + ',';
                            });
                            console.log(str);
                            */

                            orphans = $.extend(true, orphans, data.tax);

                            //

                            if(is(data, 'tao')){

                                var showGeo = false;

                                send = $.extend(true, send, data.tao);

                                $.each(data.tao, function(id, tao){

                                    if(is(tao, 'geo'))
                                        showGeo = true;
                                });
                            }

                            if(!is(data, 'tao'))
                                showGeo = true;

                            //if(Object.keys(send).length < 20)
                                showGeo = true;

                            if(showGeo){
                                send = $.extend(true, send, data.geotime);
                            } else {
                                orphans = $.extend(true, orphans, data.geotime);
                            }

                            timeline = $('.r-content').timelineCloudBrain({
                                'data': send,
                                'getFullItem': getItem,
                                'openItemDetail': openItemDetail,
                                'timeNatureByTime': mod_interpreter.timeNatureByTime
                            });

                            timeline.find('.timeline-menu').append('<div class="orphans"></div>');

                            var orphans = $.extend(true, data.tao, data.tax);

                            if(is(Drupal, 'admin'))
                                orphans = $.extend(true, orphans, data.sets);

                            var mod_taxonomymap = timeline.find('.orphans').mindmap({
                                'data': orphans,
                                'getFullItem': getItem,
                                'openItemDetail': openItemDetail
                            });

                        }, 100);

                    }
                });

            }

            function queueNode(nodeId, field, val){

                field = typeof field !== 'undefined' ? field : false;
                val = typeof val !== 'undefined' ? val : false;

                var params = "id=" + nodeId;
                    if(field) params += "&field=" + field;
                    if(val) params += "&val=" + val;

                $.ajax({
                    dataType: "json",
                    url: "/ajax/node_queue?" + params,
                    error: function(error){
                        console.log(error);
                    },
                    success: function(data){
                        console.log(data);
                    }
                });
            }

            function changeField(nodeId){

                $.ajax({
                    dataType: "json",
                    url: "/ajax/node_queue?id=" + nodeId,
                    error: function(error){
                        console.log(error);
                    },
                    success: function(data){
                        console.log(data);
                    }
                });
            }

            function getItem(itemId){

                if(!itemId)
                    return false;

                var ret = false;

                $.each(rawData, function(idx, d){

                    if(is(d, itemId))
                        ret = d[itemId];
                });

                return ret;
            }

            function resize(){
                $('.r-content').css('height', $(window).height() - $('.r-content').position().top);
            }


            return this.each(function(){
                init();
            });
        }
    });

    // INITIALIZE FROM DRUPAL

    $( document ).ready(function() {

        if(!isDevideBig()){
            $('.mobile-msg').show();
            $('.r-content').hide();
            return;
        }

        if(is(Drupal.settings, 'genealogy')){

            $('.r-content').timelineCloud({
                screenMode: 'fullScreen',
                queryUrl: "/ajax/get_nodes?id=" + Drupal.settings.genealogy.nid,
            });

        } else {

            $('.r-content').timelineCloud({
                screenMode: 'block',
                queryUrl: "/ajax/get_nodes?id=892511",
            });

        }
    });

    function isDevideBig(){
        if($(window).width() > 1000)
            return true;
        else
            return false;
    }

    function is(obj, prop){
        if(obj && typeof obj[prop] !== 'undefined' && obj[prop])
            return obj[prop];
        else
            return false;
    }

})(jQuery);