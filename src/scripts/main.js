(function(){
  "use strict";
  (function($) {

    $.fn.toggleNav = function(options){
        var settings = {
          btn: '.sidenav',
          wrap: '.sidenavwrap',
          easing: 'easeOutCirc',
          ClassToToggle: 'open',
          duration: 300
        };

        var o = $.extend({}, settings, options);

        var $this = $(this);
        var $btn = $this.find(o.btn);
        var $wrap = $this.find(o.wrap);

        function toggleWrap(event) {
          event.stopPropagation();
          $wrap.toggle(o.duration, o.easing, function(){
            $(this).toggleClass( o.ClassToToggle, function(){
            });
          });
        }

        function hideWrap(){
          $wrap.hide(o.duration, o.easing,function() {});
        }


          $btn.on('click', toggleWrap);
          $('body').on('click', hideWrap);
          //$wrap.css('position', 'absolute').hide();


    };

  })(jQuery);
})();
