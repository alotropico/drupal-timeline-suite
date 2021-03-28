(function($){
    "use strict";
    $.fn.extend({
        aloDragAndDrop: function(options) {

            // CONFIG
            var defaults = {
                vertical: true,
                horizontal: true,
                fit: true,
                centered: false,
                tolerance: 0,
                onRelease: function(){},
                onDrag: function(){}
            };

            var o = $.extend(defaults, options),
                base = this,
                dragging = false,
                time,
                x,
                y,
                xp,
                yp,
                xb,
                yb,
                w,
                h,
                isDragging = false,
                coef = [0, 0];

            // INIT

            function init(){
                if(is_touch_device())
                    initScrollable();
                else
                    initDraggable();
            }

            function initScrollable(){

                if(o.horizontal)
                    base.parent().css({
                        'overflow-x': 'auto'
                    });

                if(o.vertical)
                    base.parent().css({
                        'overflow-y': 'auto'
                    });
            }

            function initDraggable(){

                base.mousedown(function(e){

                    var tol = o.tolerance,
                        baseW = base.outerWidth();

                    if(o.horizontal){
                        xp = e.pageX;
                        xb = parseInt(base.css('left'));
                        w = ( baseW + baseW * tol * 2 - base.parent().width()) / 2;
                    }

                    if(o.vertical){
                        yp = e.pageY;
                        yb = parseInt(base.css('top'));
                        h = (base.outerHeight() - base.parent().height()) / 2;
                    }

                    base.mousemove(function(e) {

                        var css = {};

                        if(o.horizontal && w>0){

                            x = e.pageX;

                            var xx = xb + x - xp;

                            coef[0] = xx / w;

                            if(o.fit){

                                if(o.centered){

                                    if(xx<-w)
                                        xx = -w;

                                    if(xx>w)
                                        xx = w;

                                } else {

                                    if(xx<-w*2)
                                        xx = -w*2;

                                    if(xx>tol*baseW)
                                        xx = tol*baseW;

                                }
                            }

                            if(xb!= xx){

                                if(!isDragging)
                                    isDragging = true;

                                css.left = xx + 'px';
                            }
                        }

                        if(o.vertical && h>0){

                            y = e.pageY;

                            var yy = yb + y - yp;

                            coef[1] = yy / y;

                            if(o.fit){

                                if(o.centered){

                                    if(yy<-h)
                                        yy = -h;

                                    if(yy>h)
                                        yy = h;

                                } else {

                                    if(yy<-h*2)
                                        yy = -h*2;

                                    if(yy>0)
                                        yy = 0;

                                }
                            }

                            if(yb!= yy){

                                if(!isDragging)
                                    isDragging = true;

                                css.top = yy + 'px';
                            }
                            
                        }

                        base.css(css);

                    });
                })
                .mouseup(function(){
                    release();
                })
                .mouseleave(function() {
                    release();
                })
                .mouseenter(function() {
                    release();
                });
            }

            function release(){
                base.unbind("mousemove");

                if(isDragging){
                    isDragging = false;
                    o.onRelease.call(base, coef);
                }
            }

            function is_touch_device() {
                return 'ontouchstart' in window // works on most browsers 
                || navigator.maxTouchPoints;    // works on IE10/11 and Surface
            };

            /*function drag(){

                $(document).mousemove(function(event) {
                    currentMousePos.x = event.pageX;
                    currentMousePos.y = event.pageY;
                });

                timer(true);
            }
            function drop(){
                timer(false);
            }

            function timer(start){
                dragging = start;
                if(dragging){

                    time = setInterval(function(){

                    }, 100);
                } else {
                    clearInterval(time);
                }
            }*/

            // METHODS

            return this.each(function(){
                init();
            });
        }
    });
})(jQuery);