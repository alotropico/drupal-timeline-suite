/**
 *  Timeline Cloud 2.0 dev
 *  Render module
 *  
 */

(function($){
    "use strict";
    $.fn.extend({
        timelineCloudRender: function(options) {

            // CONFIG
            var defaults = {
                getStyle: function(){},
                itemClick: function(){},
                periodClick: function(){}
            };

            var options = $.extend(defaults, options),
                base = this,
                speed = 400,
                animationOn = true;

            // INIT

            function getTitle(obj){

                var ret = '';

                $.each(obj, function(ix, o){
                    ret += '<h1>' + o.val + '</h1>';

                    if(is(o, 'bod'))
                        ret += '<p class="desc">' + o.bod + '</p>';
                });

                return ret;
            }

            function init(){
                //base.find('.timeline-title').html( getTitle(options.titles) );
            }

            function refresh(items, guides, specials, start, end, animate){
                animationOn = animate;
                stageMove(items, guides, specials);
            }

            // actualize entities

            function stageMove(items, guides, specials){
                monadsMove(base.find('.timeline-stage'), items);
                guidesMove(base.find('.timeline-guides'), guides);
                specialsMove(base.find('.timeline-specials'), specials);
            }

            function guidesMove(container, guides){

                container.find('.guide').each(function(){
                    g = $(this);

                    var x = options.getStyle.call(base, g.data('item'), 'keep').x;

                    g.attr('id', g.attr('id') + '-gone');

                    var styles = {
                        transform: 'translate(' + x + 'px, 0)',
                        opacity: 0
                    };
                    doSetTimeout(g, styles, false);

                    //g.removeAttr('id');
                });

                for(var i=0; i<guides.length; i++){

                    var gg = guides[i];

                    var g = guideDraw(container, gg, i);

                    // initial position of new guides

                    var x = options.getStyle.call(base, gg, 'new').x;

                    var styles = {
                        transform: 'translate(' + x + 'px, 0)',
                        opacity: 0
                    };

                    applyCss(g, styles);

                    // animate guides to final position

                    x = options.getStyle.call(base, gg, 'keep').x;

                    styles = {
                        transform: 'translate(' + x + 'px, 0)',
                        opacity: 1
                    };

                    doSetTimeout(g, styles, true);

                    g.data('item', gg);
                }
            }

            function monadsMove(container, items){

                for(var i=0; i<items.length; i++){

                    var it = items[i],
                        m = container.find('#mon-' + it.id);

                    if(!m.length){

                        // draw new monads
                        m = monadDraw(container, it);

                        var oldStyles = getItemCss(it, options.getStyle.call(base, it, 'new'));

                        oldStyles.mon.opacity = 0;

                        applyCss(m, oldStyles);

                        m.click(function(e){
                            e.preventDefault();
                            options.itemClick.call(base, $(this).data('item').id);
                        });
                    } else {
                        monadBgs(it, m);
                    }

                    m.data('item', it);
                    m.data('keep', true);
                    
                }

                container.find('.mon').each(function(nix, n){

                    var m = $(n);
                    var it = m.data('item');

                    //m.addClass('animate');

                    if(m.data('keep')){
                        var styles = getItemCss(it, options.getStyle.call(base, it, 'keep'));
                        styles.mon.opacity = 1;
                        doSetTimeout(m, styles, true);

                        m.find('.tx-val').html(monadVisibleName(it.val, it.size, it.s));
                    } else {
                        var styles = getItemCss(it, options.getStyle.call(base, it, 'gone'));
                        styles.mon.opacity = 0;
                        doSetTimeout(m, styles, false);
                    }
                });
            }

            function specialsMove(container, items){

                for(var i=0; i<items.length; i++){

                    var it = items[i],
                        m = container.find('#spe-' + it.id);

                    if(!m.length){

                        // draw new monads
                        m = specialDraw(container, it);

                        var oldStyles = getSpecialCss(it, options.getStyle.call(base, it, 'new'));

                        oldStyles.it.opacity = 0;

                        applyCss(m, oldStyles);

                        m.click(function(e){
                            e.preventDefault();
                            options.periodClick.call(base, $(this).data('item'));
                        });
                    }

                    m.data('item', it);
                    m.data('keep', true);
                }

                container.find('.special').each(function(nix, n){

                    var m = $(n);
                    var it = m.data('item');

                    //m.addClass('animate');

                    if(m.data('keep')){
                        var styles = getSpecialCss(it, options.getStyle.call(base, it, 'keep'));
                        styles.it.opacity = 1;
                        //

                        if(!it.size)
                            it.size = {w:1, h:1};

                        doSetTimeout(m, styles, true);

                        //m.find('.tx-val').html(textParse(it.val, it.size));
                    } else {
                        var styles = getSpecialCss(it, options.getStyle.call(base, it, 'gone'));
                        styles.it.opacity = 0;
                        doSetTimeout(m, styles, false);
                    }
                });
            }

            function getSlice(str, w){
                var ret = str.substr(0, w);

                if(str.length > w){

                    if(ret.indexOf(' ') > -1){
                        ret = ret.substr(0, ret.lastIndexOf(' ') + 1);

                    }else if(ret.indexOf('-') > -1){
                        ret = ret.substr(0, ret.lastIndexOf('-') + 1);
                        //ret2 = ret.length + 1;
                    } else {
                        ret += '';
                        //ret2 = ret.length;
                    }
                }

                return ret;
            }

            function monadVisibleName(tx, size, date){
                var ret = textParse(tx, size);

                if(size.h>60)
                    ret = '<span class="date">' + dateToStr(date) + '</span><br>' + ret;

                return ret;
            }

            function textParse(tx, size){
                var ret = '',
                    slices = [],
                    txx = tx,
                    h = Math.ceil(size.h/30),
                    w = Math.ceil(size.w/(h*3.4)+1);

                if(w<6) w = 6;

                while(txx && txx.length>w){

                    var slice = getSlice(txx, w);

                    slices.push(slice);
                    txx = txx.substr(slice.length, txx.length);
                }

                slices.push(txx);

                for(var i=0; i<slices.length; i++){
                    if(i<h){
                        ret += slices[i];

                        if(i+1 < h)
                            ret += '<br>';
                    }
                }

                // ' - ' + w + ' : '+ h

                return '<span>' + ret +'</span>';
            }

            function applyCss(m, styles){

                if(is(styles, 'mon')){
                    m.css(styles.mon);
                    m.find('.bg').css(styles.bg);
                    m.find('.tx').css(styles.tx);
                    m.find('.pic').css(styles.pic);
                    m.find('.circ').css(styles.circ);

                } else if(is(styles, 'it')){
                    m.css(styles.it);

                    if(is(styles, 'bg'))
                        //console.log(styles.bg);
                        m.find('.bg').css(styles.bg);

                    if(is(styles, 'tx'))
                        m.find('.tx').css(styles.tx);

                } else {
                    m.css(styles);
                }
            }

            function executeSetTimeOut(m, styles, keep){

                if(keep && animationOn)
                    m.addClass('animate');
                else if(!animationOn)
                    m.removeClass('animate');

                applyCss(m, styles);
                m.data('keep', false);
            }

            function doSetTimeout(m, styles, keep) {

                if(animationOn){

                    setTimeout(function(){

                        executeSetTimeOut(m, styles, keep);
                        
                    }, 1);

                    if(!keep){
                        setTimeout(function(){
                            m.remove();
                        }, speed + 1);
                    }

                } else {

                    if(keep){
                        executeSetTimeOut(m, styles, keep);
                    } else {
                        m.remove();
                    }

                }
            }

            function getSpecialCss(it, styles){

                var txCss = {};

                if(styles.w > 1){
                    txCss.transform = 'translate(' + (styles.w-2)*50 + 'px, 0px)';
                    txCss.opacity = 1;

                    if(styles.w < 2)
                        txCss.transform += ' scale(.7, .7)';

                    if(styles.w > 30000)
                        styles.w = 30000;
                    
                } else {
                    txCss.opacity = 0;
                }

                return {
                    'it': styleToCss({ transform: 'translate(' + styles.x + 'px, ' + '0px)' }),
                    'bg': styleToCss({ transform: 'scale(' + styles.w + ', 1)' }),
                    'tx': styleToCss( txCss )
                };
            }

            function getItemCss(it, styles){

                var monadCss = {
                    transform: 'translate(' + styles.x + 'px, ' + styles.y + 'px)'
                };

                //if(is(it, 'ext') && it.ext == 'timespan')
                    var minSize = styles.h; // when it covers a period of time
                //else
                 //   var minSize = .03; // when it is a point in time

                var bgWScale = (styles.w < minSize ? minSize : styles.w);
                var bgCss = {
                    transform: 'scale(' + styles.w + ', ' + .03 + ')'
                    // width: bgWScale*100 + 'px',
                    // height: styles.h*100 + 'px'
                };

                var circCss = {
                    transform: 'scale(' + styles.h + ')'
                    // width: minSize*100 + 'px',
                    // height: styles.h*100 + 'px'
                };

                var txScale = styles.h * 0.6 + 0.4;
                var txX = (is(it, 'pic') && styles.h > 0.2 ? 100 * styles.h / txScale : 3);
                var txY = 50 * styles.h / txScale;
                var txCss = {
                    transform: 'scale(' + txScale + ') translate(' + txX + 'px, ' + txY + 'px)'
                };

                //var picScale = styles.h * 0.6 + 0.4;
                var picOpacity = styles.h > 0.2 ? 1 : 0;
                var picCss = {
                    transform: 'scale(' + styles.h + ', ' + styles.h + ')',
                    opacity: picOpacity
                };

                return {
                    'mon': styleToCss(monadCss),
                    'bg': styleToCss(bgCss),
                    'tx': styleToCss(txCss),
                    'pic': styleToCss(picCss),
                    'circ': styleToCss(circCss)
                };
            }

            // render new entities

            function monadBgs(it, mon){

                var layer = '',
                    layers = '';

                if(!is(it, 'layers'))
                    it.layers = ['cat cat-tao catQty-1'];

                for(var j=0; j<it.layers.length; j++){
                    layers += it.layers[j];

                    if(j==0)
                        layer = layers;
                }

                mon.find('.bg .cat').removeAttr('class').addClass(layer);
                mon.find('.circ .cat').removeAttr('class').addClass(layers);
            }

            function monadDraw(c, it){
                var html = '',
                    pic = '',
                    title = (is(it, 'bod') ? it.val + ': ' + it.bod + '' : it.val),
                    layer = '',
                    layers = '';

                // var dates = it.s;
                // if(is(it, 'e') && it.e>it.s) dates += ' to ' + it.e;

                //title = '(' + dates + ') ' + title;

                if(!is(it, 'css'))
                    it.css = [''];
                else if(it.css.length < 2)
                    it.css.push('');

                if(is(it, 'pic'))
                    pic +=  '<div class="pic">' +
                                '<div class="pic-inner">' +
                                    '<a href="' + it.pic + '">'+
                                        '<img src="' + it.pic + '">' +
                                    '</a>' +
                                '</div>' +
                            '</div>';

                if(!is(it, 'layers'))
                    it.layers = ['cat cat-tao catQty-1'];

                for(var j=0; j<it.layers.length; j++){
                    layers += '<div class="' + it.layers[j] + '"></div>';

                    if(j==0)
                        layer = layers;
                }

                html += '<div id="mon-' + it.id + '" class="' + it.css.join(' ') + '">' +
                            pic +
                            '<div class="tx">' +
                                '<span class="tx-inner">' +
                                    '<a href="/' + it.path + '" class="tx-val" title="' + title + '">' +
                                        //it.val +
                                    '</a>' +
                                '</span>' +
                            '</div>' +
                            '<div class="bg">' + layer + '</div>' +
                            '<div class="circ">' + layers + '</div>' +
                        '</div>';

                c.append(html);
                return $('#mon-' + it.id);
            }

            function guideDraw(c, g, id){

                var html = '';

                var tx = dateToStr(g.a);

                html += '<div id="guide-' + id + '" class="guide">' +
                            '<div class="tx tx-1">' + tx + '</div>' +
                            '<div class="tx tx-2">' + tx + '</div>' +
                        '</div>';

                c.append(html);
                return $('#guide-' + id);
            }

            function specialDraw(c, it){

                var html = '';

                var css = (is(it, 'css') ? it.css + ' special' : 'special');

                var dates = Math.floor(it.a) + ' to ' + Math.ceil(it.z);

                //var tx = dateToStr(g.a);

                html += '<div title="' + it.val + ': ' + dates + '" id="spe-' + it.id + '" class="' + css + '">' +
                            '<div class="bg">' + '</div>' +
                            '<div class="tx">' +
                                '<span>' + it.val + '</span>' +
                                //'<sup>' + Math.round(it.a) + ' to ' + Math.round(it.z) + '</sup>' +
                            '</div>' +
                        '</div>';

                c.append(html);

                return $('#spe-' + it.id);
            }

            //

            function styleToCss(style){

                var ret = {};

                $.each(style, function(idx, d){

                    var props = '';

                    if(typeof d == 'string' || typeof d == 'number'){

                        props += d;

                    } else {

                        $.each(d, function(i, s){

                            props += ' ' + i + s;

                        });
                    }

                    ret[idx] = props;
                });

                return ret;
            }

            function dateToStr(d){

                var ret = '',
                    round = '',
                    pfx = '',
                    absD = Math.abs(d);

                if(d<0 && d>-8000){
                    pfx = ' <sub>BCE</sub>';
                    d = absD;
                } /*else if(d<=-8000){
                    pfx = ' <sub>ago</sub>';
                    d = absD;

                    if(d<100000)
                        d+=2000;
                }*/

                if(absD>=1000000000000) ret = roundToOne(d/1000000000000) + " T";
                if(absD>=1000000000) ret = roundToOne(d/1000000000) + " B";
                else if(absD>=1000000) ret = roundToOne(d/1000000) + " M";
                else if(absD>=10000) ret = roundToOne(d/1000) + " K";
                else if(absD<10) ret = 'year ' + Math.floor(d);
                else if(ret=='') ret = Math.floor(d);

                return ret+pfx;
            }

            // TOOLS

            function is(obj, prop){
                if(obj && typeof obj[prop] !== 'undefined' && obj[prop])
                    return obj[prop];
                else
                    return false;
            }

            function roundToOne(n){
                return Math.floor( n * 10 ) / 10;
            }

            // METHODS

            this.refreshRender = function(items, guides, specials, start, end, animate){
                refresh(items, guides, specials, start, end, animate);
            }

            return this.each(function(){
                init();
            });
        }
    });
})(jQuery);