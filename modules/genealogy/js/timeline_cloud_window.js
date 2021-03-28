/**
 *  Timeline Cloud 2.0 dev
 *  Categories module
 *  
 */

(function($){
    "use strict";
    $.fn.extend({
        timelineCloudWindow: function(options) {

            // CONFIG
            var defaults = {
                container: this,
                content: {},
                editableNode: function(){}
            };

            var options = $.extend(defaults, options),
                base = this,
                cta = -1;

            // INIT

            function init(){
                //$('.gen-veil').hide();
            }

            function newWindow(html){

                var oldIt = $('#gen-window-' + cta);

                if(oldIt.length)
                    oldIt.remove();

                cta++;

                var code = '<div class="gen-window" id="gen-window-'+ cta +'">' +
                                '<div class="gen-veil"></div>' +
                                '<div class="gen-window-wrap">'+ html +'</div>' +
                            '</div>';

                base.append(code);

                var it = $('#gen-window-' + cta);

                triggers(it);

                it.find('.gen-veil').click(function(){
                    $(this).closest('.gen-window').remove();
                });
            }

            function triggers(windowIt){
                windowIt.find('.trigger-edit').click(function(){
                    options.editableNode.call(base, $(this).attr('data-id'));
                });

                windowIt.find('.trigger-hierarchy').click(function(){

                    var delta = ($(this).hasClass('more') ? 1 : -1);

                    var val = parseInt($(this).parent().find('.val input').val()) + delta;

                    $(this).parent().find('.val input').val(val);

                    triggerHierarchy($(this).attr('data-id'), val);
                    
                });
            }

            function triggerHierarchy(id, val){
                console.log(id, val);

                options.editableNode.call(base, id, 'hie', val);
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

            this.newWindow = function(html){
                newWindow(html);
            }

            return this.each(function(){
                init();
            });
        }
    });
})(jQuery);