/* ========================================================================
 * ChangeOnScroll: jquery.changeonscroll.js v1.0.2
 * Author: Daniel Pfisterer (info@daniel-pfisterer.de)
 * ========================================================================
 * Copyright 2015-2015 Ventzke Media
 *
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 * ======================================================================== */

+function ($) {
  'use strict';

  var ChangeOnScroll = function(element, options) {
    this.$element       = $(element)
    this.data           = this.$element.data()
    this.options        = $.extend({}, ChangeOnScroll.DEFAULTS, this.data, options)

    this.pos            = $(window).scrollTop()
    this.top            = this.offsetTop()
    this.bottom         = this.offsetBottom()

    this.start          = this.options.start
    this.end            = this.options.end
    this.style          = this.options.style

/*
    var str = this.style
    var res = str.split(" ")
    var style = typeof this.style.constructor === "string" ? 'is String' : 'is something else'
    console.log(res)
*/


    //$('.inidcator.top').css('top', this.top )
    //$('.inidcator.bottom').css('top', this.bottom )

    this.Init()
  }
  ChangeOnScroll.VERSION  = '1.0.2'

  ChangeOnScroll.DEFAULTS = {
    beforeClass       : 'scroller_before',
    whileClass        : 'scroller_while',
    afterClass        : 'scroller_after',
    top               : 0,
    bottom            : 0
  }

  ChangeOnScroll.prototype.Init = function() {
    var scrolled = null

    if(this.pos >= this.top && this.pos <= this.bottom ) {
      scrolled = 'inside'
      this.Inside();
    } else if ( this.pos >= this.bottom ) {
      scrolled = 'after'
      this.After();
    } else if ( this.pos <= this.top ) {
      scrolled = 'before'
      this.Before();
    } else {
      //console.log('else: ' + scroll_pos)
    }

    var eventType = scrolled
    var e = $.Event(eventType + '.changeonscroll')
    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return
  }

  ChangeOnScroll.prototype.Position = function() {
    var percent_scroll_position
    var percent = (this.pos - this.top) / (this.bottom - this.top)
    if( this.options.reverse ) {
      percent_scroll_position = this.start - ( percent * (this.start-this.end) * this.options.faktor)
    } else {
      percent_scroll_position = this.start + ( percent * this.end * this.options.faktor) - this.start
    }
    return percent_scroll_position
  }

  ChangeOnScroll.prototype.Inside = function() {
    this.$element.one()
      .addClass(this.options.whileClass)
      .removeClass(this.options.beforeClass)
      .removeClass(this.options.afterClass)
    if(this.style) {
      this.$element.css(this.style, this.Position() );
    }
  }

  ChangeOnScroll.prototype.Before = function() {

    this.$element.one()
      .removeClass(this.options.whileClass)
      .addClass(this.options.beforeClass)

    if(this.style) {
      this.$element.css(this.style, this.start * this.options.faktor );
    }
  }

  ChangeOnScroll.prototype.After = function() {
    this.$element.one()
      .removeClass(this.options.whileClass)
      .addClass(this.options.afterClass)

    if(this.style){
      this.$element.css(this.style, this.end * this.options.faktor);
    }
  }

  ChangeOnScroll.prototype.offsetTop = function() {
    var trigger = this.options.top
    var offsetTop
    if(trigger){
      offsetTop = typeof trigger === 'number' ? trigger :  $(trigger).offset().top
    } else {
      offsetTop = typeof this.options.top === 'number' ? this.options.top :  this.$element.offset().top
    }
    return offsetTop;
  }

  ChangeOnScroll.prototype.offsetBottom = function() {
    var trigger = this.options.bottom
    var offsetBottom
    if(trigger){
      offsetBottom = typeof trigger === 'number' ? trigger : $(trigger).offset().top
    } else {
      offsetBottom = typeof this.options.bottom === 'number' ? this.options.bottom : this.$element.offset().top
    }
    return offsetBottom;
  }

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('changeonscroll')
      var options = $.extend({}, ChangeOnScroll.DEFAULTS, data, option)
      new ChangeOnScroll($this, options)
    })
  }

  var old = $.fn.changeonscroll

  $.fn.changeonscroll             = Plugin
  $.fn.changeonscroll.Constructor = ChangeOnScroll

  $.fn.changeonscroll.noConflict = function () {
    $.fn.changeonscroll = old
    return this
  }


  $(window).on('load, scroll.changeonscroll.data-api', function() {
    $('[data-spy="scroller"]').each(function(){
      var $spy = $(this)
      var data = $spy.data()
      Plugin.call($spy, data)
    })
  });

}(jQuery);
