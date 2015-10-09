/* ========================================================================
 * TriggerResize: jQuery.triggerresize.js v1.0.1
 * Author: Daniel Pfisterer (info@daniel-pfisterer.de)
 * ========================================================================
 * Copyright 2015-2015 Ventzke Media
 *
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 * ======================================================================== */

+function ($) {
  'use strict'
  var TriggerResize = function(element, options) {
    this.$element      = $(element)
    this.data          = $('[data-trigger="screen"]') ? $('[data-trigger="screen"]').data() : null
    this.options       = $.extend({}, TriggerResize.DEFAULTS, options)

    this.xs_max        = this.data.xs_max ? this.data.xs_max : this.options.xs_max
    this.sm_min        = this.data.sm_min ? this.data.sm_min : this.options.sm_min
    this.sm_max        = this.data.sm_max ? this.data.sm_max : this.options.sm_max
    this.md_min        = this.data.md_min ? this.data.md_min : this.options.md_min
    this.md_max        = this.data.md_max ? this.data.md_max : this.options.md_max
    this.lg_min        = this.data.lg_min ? this.data.lg_min : this.options.lg_min

    this.width_target  = this.data.width_target ? this.data.width_target : this.options.width_target
    this.set_inside    = this.data.inside ? this.data.inside : this.options.inside
    this.set_below     = this.data.below ? this.data.below : this.options.below
    this.set_above     = this.data.above ? this.data.above : this.options.above

    this.init()
    }
  TriggerResize.VERSION  = '1.0.1'

  TriggerResize.DEFAULTS = {
    xs_max        : 767,
    sm_min        : 768,
    sm_max        : 991,
    md_min        : 992,
    md_max        : 1199,
    lg_min        : 1200,
    width_target  : '#navbar',
    inside        : true,
    below         : true,
    above         : true
  }

  TriggerResize.prototype.init = function () {
    var timeOut = null;
    var screen_resized = false
    var $this = this
    if(!screen_resized){
      $this.trigger()
    }
    $(this.$element).resize(function(){
      if (timeOut != null)
      clearTimeout(timeOut);
      timeOut = setTimeout(function(){
        screen_resized = true
        $this.trigger()
      }, 100)
    })
  }

  TriggerResize.prototype.trigger = function () {
    if(this.set_inside){
      this.inside()
    }
    if(this.set_below){
      this.belowXS()
      this.belowSM()
      this.belowMD()
    }
    if(this.set_above){
      this.aboveLG()
      this.aboveMD()
      this.aboveSM()
    }
    this.all()
  }

  TriggerResize.prototype.inside = function () {
    var resized = null
    var width = $(this.width_target).outerWidth(true)
    if(width <= this.xs_max){
      resized= 'xs'
    } else if (width >= this.sm_min && width <= this.sm_max) {
      resized= 'sm'
    } else if (width >= this.md_min && width <= this.md_max) {
      resized= 'md'
    } else if (width >= this.lg_min) {
      resized= 'lg'
    }
    var eventType = resized
    var e = $.Event(eventType + '-inside.triggerresize')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
  }

  TriggerResize.prototype.belowXS = function () {
    var resized = setBelow($(this.width_target).outerWidth(true), this.xs_max, 'xs_max')
    var eventType = resized
    var e = $.Event(eventType + '-below.triggerresize')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
  }
  TriggerResize.prototype.belowSM = function () {
    var resized = setBelow($(this.width_target).outerWidth(true), this.sm_max, 'sm_max')
    var eventType = resized
    var e = $.Event(eventType + '-below.triggerresize')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
  }
  TriggerResize.prototype.belowMD = function () {
    var resized = setBelow($(this.width_target).outerWidth(true), this.md_max, 'md_max')
    var eventType = resized
    var e = $.Event(eventType + '-below.triggerresize')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
  }
  TriggerResize.prototype.aboveLG = function () {
    var resized = setAbove($(this.width_target).outerWidth(true), this.lg_min, 'lg_min' )
    var eventType = resized
    var e = $.Event(eventType + '-above.triggerresize')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
  }
  TriggerResize.prototype.aboveMD = function () {
    var resized = setAbove($(this.width_target).outerWidth(true), this.md_min, 'md_min' )
    var eventType = resized
    var e = $.Event(eventType + '-above.triggerresize')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
  }
  TriggerResize.prototype.aboveSM = function () {
    var resized = setAbove($(this.width_target).outerWidth(true), this.sm_min, 'sm_min' )
    var eventType = resized
    var e = $.Event(eventType + '-above.triggerresize')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
  }
  TriggerResize.prototype.all = function () {
    var e = $.Event('triggerresize')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
  }

  var setAbove = function(width, minwidth, trigger){
    var resized = null
    if(width >= minwidth){
      resized = trigger
    }
    return resized
  }

  var setBelow = function(width, maxwidth, trigger){
    var resized = null
    if(width <= maxwidth){
      resized = trigger
    }
    return resized
  }

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('triggerresize')
      var options = $.extend({}, TriggerResize.DEFAULTS, data, option)
      new TriggerResize($this, options)
    })
  }

  var old = $.fn.triggerresize

  $.fn.triggerresize             = Plugin
  $.fn.triggerresize.Constructor = TriggerResize

  $.fn.triggerresize.noConflict = function () {
    $.fn.triggerresize = old
    return this
  }

  $(window).on('load.triggerresize', function(){
    $(this).triggerresize()
  })

  /* ========================================================================
   * EXAMPLE USAGE
   *
    $(window).on('triggerresize', function(){
      console.log('Trigger All')
    }).on('xs-inside.triggerresize', function(){
      console.log('fire in XS')
    }).on('sm-inside.triggerresize', function(){
      console.log('fire in SM')
    }).on('md-inside.triggerresize', function(){
      console.log('fire in MD')
    }).on('lg-inside.triggerresize', function(){
      console.log('fire in LG')
    }).on('xs_max-below.triggerresize', function(){
      console.log('fire below XS')
    }).on('sm_max-below.triggerresize', function(){
      console.log('fire below SM')
    }).on('md_max-below.triggerresize', function(){
      console.log('fire below MD')
    }).on('sm_min-above.triggerresize', function(){
      console.log('fire above SM')
    }).on('md_min-above.triggerresize', function(){
      console.log('fire above MD')
    }).on('lg_min-above.triggerresize', function(){
      console.log('fire above LG')
    })
  *
  * ======================================================================== */

}(jQuery);
