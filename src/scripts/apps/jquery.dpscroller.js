/* ========================================================================
 * DpScroller: jQuery.dpscroller.js v1.0.1
 * Author: Daniel Pfisterer (info@daniel-pfisterer.de)
 * ========================================================================
 * Copyright 2015-2015 Ventzke Media
 *
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 * ======================================================================== */

+function ($) {
  'use strict';

  var DpScroller = function(element, options) {
    this.$element       = $(element)
    this.data           = this.$element.data()
    this.options        = $.extend({}, DpScroller.DEFAULTS, this.data, options)

    this.pos            = $(window).scrollTop()
    this.start          = this.offsetTop()
    this.end            = this.offsetBottom()

    //$('.inidcator.top').css('top', animation_begin_pos )
    //$('.inidcator.bottom').css('top', animation_end_pos )

    this.Init()
  }
  DpScroller.VERSION  = '1.0.1'

  DpScroller.DEFAULTS = {
    beforeClass       : 'scroller_before',
    whileClass        : 'scroller_while',
    afterClass        : 'scroller_after',
    triggerStart      : 0,
    triggerEnd        : 0
  }

  DpScroller.prototype.Init = function() {
    var scrolled = null

    if(this.pos >= this.start && this.pos <= this.end ) {
      scrolled = 'inside'
      this.Inside();
    } else if ( this.pos >= this.end ) {
      scrolled = 'after'
      this.After();
    } else if ( this.pos <= this.start ) {
      scrolled = 'before'
      this.Before();
    } else {
      //console.log('else: ' + scroll_pos)
    }

    var eventType = scrolled
    var e = $.Event(eventType + '.dp.scroller')
    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return
  }

  DpScroller.prototype.Position = function() {
    var percent_scroll_position
    if( this.data.scrollerReverse ) {
      percent_scroll_position = this.data.scrollerEnd + (1 - (this.pos / (this.end - this.start) * this.data.scrollerFaktor))
    } else {
      if (this.pos > this.end) {
        percent_scroll_position = this.data.scrollerStart + (this.pos / (this.end - this.start) * -1 * this.data.scrollerFaktor)
      } else {
        percent_scroll_position = this.data.scrollerStart + (this.pos / (this.end - this.start) * this.data.scrollerFaktor)
      }
    }
    return percent_scroll_position
  }

  DpScroller.prototype.Inside = function() {

    this.$element.one()
      .addClass(this.options.whileClass)
      .removeClass(this.options.beforeClass)
      .removeClass(this.options.afterClass)
    if(this.options.scrollerStyle) {
      this.$element.css(this.options.scrollerStyle, this.Position() );
    }
  }

  DpScroller.prototype.Before = function() {

    this.$element.one()
      .removeClass(this.options.whileClass)
      .addClass(this.options.beforeClass)

    if(this.options.scrollerStyle) {
      this.$element.css(this.options.scrollerStyle, this.data.scrollerStart );
    }
  }

  DpScroller.prototype.After = function() {
    //console.log(afterEvent)
    this.$element.one()
      .removeClass(this.options.whileClass)
      .addClass(this.options.afterClass)

    if(this.options.scrollerStyle){
      this.$element.css(this.options.scrollerStyle, this.data.scrollerEnd );
    }
  }

  DpScroller.prototype.offsetTop = function() {
    var trigger = this.data.triggerStart
    var offsetTop
    if(trigger){
      offsetTop = typeof trigger === 'number' ? trigger :  $(trigger).offset().top
    } else {
      offsetTop = typeof this.options.triggerStart === 'number' ? this.options.triggerStart :  this.$element.offset().top
    }
    return offsetTop;
  }

  DpScroller.prototype.offsetBottom = function() {
    var trigger = this.data.triggerEnd
    var offsetBottom
    if(trigger){
      offsetBottom = typeof trigger === 'number' ? trigger : $(trigger).offset().top
    } else {
      offsetBottom = typeof this.options.triggerEnd === 'number' ? this.options.triggerEnd : this.$element.offset().top
    }
    return offsetBottom;
  }

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('dp.scroller')
      var options = $.extend({}, DpScroller.DEFAULTS, data, option)
      new DpScroller($this, options)
    })
  }

  var old = $.fn.dpscroller

  $.fn.dpscroller             = Plugin
  $.fn.dpscroller.Constructor = DpScroller

  $.fn.dpscroller.noConflict = function () {
    $.fn.dpscroller = old
    return this
  }


  $(window).on('scroll.dp.scroller.data-api', function() {
    $('[data-spy="scroller"]').each(function(){
      var $spy = $(this)
      var data = $spy.data()
      Plugin.call($spy, data)
    })
  });

}(jQuery);
