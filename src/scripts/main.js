(function($) {

  $.fn.fullWidthBgImg = function(options){
      var settings = {
      };
      
      var o = $.extend({}, settings, options);

      var $this = $( this ).find('.jumbotron-fullwidthimg');

      var idHeight;
      var idWidth;

      function getHeight(height) {
        var height = $(window).height();
        var navHeight = $('body').find('.navbar').height();

        $this.css('height', height - navHeight );
        console.log(height);
      };

      function getWidth(width) {
        var width = $this.width()
        console.log(width);
      };


      $(window).resize( function() {
        clearTimeout(idHeight, idWidth);
        idHeight = setTimeout(getHeight, 500);
        idWidth = setTimeout(getWidth, 500);
      });

      return getWidth(), getHeight();
  };

})(jQuery);


