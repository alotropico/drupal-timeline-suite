var jqHome = (function(me, $, undefined) {

    $( document ).ready(function() {
        init();
    });

    function init(){

        $('.menu-btn').click(function(){
            if($(this).hasClass('open')){
                $(this).removeClass('open');
                $('.menu-content').removeClass('open');
            } else {
                $(this).addClass('open');
                $('.menu-content').addClass('open');
            }
        });
        $(document).click(function(event) { 
            if(!$(event.target).closest('.menu-content').length && !$(event.target).closest('.menu-btn').length) {
                if($('.menu-btn').hasClass('open')) {
                    $('.menu-btn').trigger('click');
                }
            }        
        });

        /*$('.view-collections-nav > .view-content > .views-row').addClass('msryItem');

        $('.view-collections-nav > .view-content').masonry({
            // options
            itemSelector: '.msryItem',
            percentPosition: true
        });*/

        /*$('.w-properties-nav .view-content').aloDragAndDrop({
            vertical: false,
            centered: false
        });*/
    }

}) (jqHome || {}, jQuery);