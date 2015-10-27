(function(){
  "use strict";

  (function($,sr){
    var debounce = function (func, threshold, execAsap) {
        var timeout;
        return function debounced () {
            var obj = this, args = arguments;
            function delayed () {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null;
            }
            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);
            timeout = setTimeout(delayed, threshold || 100);
        };
    }
    jQuery.fn[sr] = function(fn){  return fn ? this.on('resize', debounce(fn)) : this.trigger(sr); };
  })(jQuery,'smartresize');

  (function($) {
    $.fn.navHeight = function(ele){
      var NavigationHeight = 0
      $(ele).each(function(){
        NavigationHeight += $(this).css('display') != 'none' ? $(this).outerHeight(true) : 0
        //navHeight += $(this).outerHeight()
      })
      return NavigationHeight
    }
  })(jQuery);

  +(function($) {

    $.fn.toggleAttr = function(attr, attr1, attr2) {
      return this.each(function() {
        var self = $(this);
        if (self.attr(attr) == attr1)
          self.attr(attr, attr2);
        else
          self.attr(attr, attr1);
      });
    };

    $.fn.pushMenu = function(options){

      var o = $.extend({}, $.fn.pushMenu.defaults, options);
      var $this = $(this)
      var target

      var Plugin = {
        init : function(element, options) {
          Plugin.clickHandler($(element), options)

          var timeOut = null;
          window.onresize = function(){
            if (timeOut != null)
          	clearTimeout(timeOut);
            timeOut = setTimeout(function(){
              Plugin.clickHandler($(element), options)
            }, 300);
          }
        },
        clickHandler: function(element, options){
          var o = options

          // Add push-class on Page load
          if(o.pushElement) {
            $(o.pushElements).addClass( o.pushClass )
          }

          $(element).on('click', function(e){
            e.preventDefault()
            var thisTarget = Plugin.findTarget($(element))
            Plugin.open($(element), o.activeClass)
            Plugin.open($(thisTarget), o.menuOpenClass)

            // Mobile-Navigation, close on 'click'
            var winWidth = $('body').outerWidth(true)
            if (winWidth >= o.mobileBreakpoint){
              Plugin.close($this.not($(element)), o.activeClass, o.menuOpenClass)
            } else if (winWidth <= o.mobileBreakpoint + 1 && $(this).is('.navbar-toggle')) {
              Plugin.close($this.not($(element)), o.activeClass, o.menuOpenClass)
            }

            // Push the body or other elements
            if ($this.is('[aria-expanded="true"]')){
              Plugin.push.open(o)
            } else {
              Plugin.push.close(o)
            }

            // Close on 'click' outside
            if(o.closeOnClickOutside){
              $(document).on('click', function(e){
                var closetTarget = $(e.target).closest('[aria-expanded="true"]').length
                var closetTrigger = $(e.target).closest( '[data-toggle="subnav_close"]' ).length
                if (!closetTarget && !closetTrigger && $(element).attr('aria-expanded') === 'true') {
                  Plugin.close($(element), o.activeClass, o.menuOpenClass)
                  Plugin.push.close(o)
                }
              })
            }

            // Close on 'click' link in Menü
            if(o.closeOnClickLink && $(thisTarget).children('.nav')){
              $(thisTarget).children('.nav_subnav').find('a').on('click',function(){
                Plugin.close($(element), o.activeClass, o.menuOpenClass)
                Plugin.push.close(o)
              })
            }

            // Close on 'click' the Backdrop
            $('[data-toggle="subnav_close"]').on('click', function(){
              var parent = $(this).parent()
              var parentId = $(parent).attr('id')
              Plugin.close($('[href="#'+ parentId +'"], [data-target="' + parentId + '"]'), o.activeClass, o.menuOpenClass)
              Plugin.push.close(o)
            })

            return false
          })
        },
        findTarget: function(element){
          var hrefTarget = $(element).attr('href')
          var dataTarget = $(element).data('target')
          target= (hrefTarget ? hrefTarget : dataTarget)
          return target
        },
        open: function(element, cssClass){
          $(element).toggleClass(cssClass).toggleAttr('aria-expanded', 'true', 'false')
          closingTransition(element)
        },
        close: function(element, css_1, css_2){
          $(element).each(function(){
            var thisTarget = Plugin.findTarget($(this))
            $(this).removeClass( css_1 ).attr('aria-expanded', 'false')
            $(thisTarget).removeClass( css_2 ).attr('aria-expanded', 'false')
            closingTransition(element)
          })
        },
        push: {
          open: function(o){
            if (o.pushElement && $this.is('[aria-expanded="true"]')) {
              $(o.pushElements).addClass(o.menuOpenClass)
            }
          },
          close: function(o){
            if (o.pushElement && !$this.is('[aria-expanded="true"]')) {
              $(o.pushElements).removeClass(o.menuOpenClass)
            }
          }
        }
      }

      var closingTransition = function(elem) {
        if($(elem).attr('aria-expanded')==='false'){
          var ele = elem
          $(elem).addClass('closing')
          setTimeout(function(){
            $(ele).removeClass('closing')
          }, 400)
        }
      }

      return this.each(function(){
        o = $.extend({}, $.fn.pushMenu.defaults, options);
        new Plugin.init($(this), o)
      })
    }

    $.fn.pushMenu.defaults = {
      activeClass        : 'menu-active',
      menuOpenClass      : 'menu-open',
      closeOnClickOutside: true,
      closeOnClickLink   : true,
      pushElement        : true,
      pushElements       : 'body, #anker-nav',
      pushClass          : 'push-element',
      mobileBreakpoint   : 1199
    }

    $(document).ready(function(){
      $('[data-toggle="subnav"]').pushMenu()
    })

  })(jQuery);

+function ($) {

    // Create Constractor and build prototype
    var AnkerNav = function(element, options) {
      this.$element      = $(element)
      this.$target       = this.$element.attr('href')
      this.options       = $.extend({}, AnkerNav.DEFAULTS, options)
      this.offsetTop     = this.options.offsetTop ? this.options.offsetTop : $(window).navHeight('.navbar-fixed-top, .scrollerbar-inner , .navbar_anker') - 2
      this.init(this.options)
      }
    AnkerNav.VERSION  = '1.0.0'

    AnkerNav.DEFAULTS = {
      offsetTop : null,
      ease      : 'easeInOutQuart',
      duration  : 600
    }

    AnkerNav.prototype.init = function () {
      this.animate()
    };

    AnkerNav.prototype.animate = function() {
      $("html, body").animate({ scrollTop: this.offset() }, this.options.duration, this.options.ease);
    }

    AnkerNav.prototype.offset = function() {
      var targetOffsetTop = $(this.$target).offset().top
      var offset = targetOffsetTop - this.offsetTop
      return offset
    }

    function Plugin(option) {
      return this.each(function () {
        var $this   = $(this)

        var data    = $this.data('bs.ankernav')
        var options = $.extend({}, AnkerNav.DEFAULTS, data, option)
        new AnkerNav(this, options)
      })
    }

    var old = $.fn.ankernav

    $.fn.ankernav             = Plugin
    $.fn.ankernav.Constructor = AnkerNav

    $.fn.ankernav.noConflict = function () {
      $.fn.ankernav = old
      return this
    }

    $(document).on('click.bs.ankernav.data-api', '[data-toggle="ankernav"]', function(e){
      var $this   = $(this)
      e.preventDefault()
      var option  = $this.data()
      Plugin.call($this, option)
    })

    $('body').scrollspy({
      //target: '#anker-navbar',
      //offset: $(window).navHeight('.navbar-fixed-top, .scrollerbar-inner , .navbar_anker')
    })

  }(jQuery);

})();
