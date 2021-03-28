/**
 *  Timeline Cloud 2.0 dev
 *  Categories module
 *  
 */

(function($){
    "use strict";
    $.fn.extend({
        timelineCloudGroups: function(options) {

            // CONFIG
            var defaults = {
                container: this,
                groups: {},
                defaultSelection: '',
                makeSelection: function(){}
            };

            var o = $.extend(defaults, options),
                base = this;

            // INIT

            function init(){
                render(getHtml(o.groups));

                var selector = base.find('#gen-groups');

                selector.change(function(){

                    var selected = $(this).find(":selected").text();

                    o.makeSelection.call(base, selected);
                });

                selector.val(o.defaultSelection);

            }

            function getHtml(obj){

                var ret = '<select id="gen-groups" class="gen-groups">';

                $.each(obj, function(id){
                    ret += '<option name="' + id + '">' + id + '</option>';
                });

                ret += '</select>';

                return ret;
            }

            function render(html){
                o.container.html(html);
            }

            // METHODS

            this.select = function(id){

            }

            return this.each(function(){
                init();
            });
        }
    });
})(jQuery);