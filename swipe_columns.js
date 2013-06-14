/*
 * @fileOverview SwipeColumns - jQuery Plugin
 * @version 1.0.1
 *
 * @author Peter Schmalfeldt http://www.github.com/manifestinteractive
 * @see https://github.com/manifestinteractive/swipe-columns-jquery-plugin
 * @requires https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
 * @requires http://benalman.com/projects/javascript-debug-console-log ( for Debugging )
 *
 * Copyright (c) Peter Schmalfeldt
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * @example
 *
 *	// Create Variable to Store Element
 *	var column_wrapper = jQuery('.column_wrapper');
 *
 *	// Setup Swipe Columns
 *	jQuery(function(){
 *		column_wrapper.SwipeColumns({
 *			debug_level: 5,
 *			hide_adress_bar: true,
 *			column_padding: 20,
 *			use_keyboard_navigation: true,
 *			generate_page_numbers: true
 *		});
 *	});
 */

;(function ( $, window, document, undefined ) {

	"use strict";

		/** Plugin Name used for jQuery PLugin */
	var plugin_name = 'SwipeColumns',

		/** Debug Object with defaults in case window.debug does not exist */
		debug = (typeof window.debug !== 'undefined') ? window.debug : { log:function(){}, debug:function(){}, info:function(){}, warn:function(){}, error:function(){} },

		/** jQuery Element use by plugin */
		element = null,

		/** Configuration Options, defaults will be set below unless provided. */
		options = {},

		/** Column Width. This will be set based on the existing width of the element. */
		column_width = 0,

		/** Column Height. This will be set based on the existing height of the element. */
		column_height = 0,

		/** Current Page. This is zero based, so the first page is actually page 0 */
		current_page = 0,

		/** Current Percent. Keeps track of progress from start to finish. Used if page changes size / orientation. */
		current_percent = 0,

		/** Snap Threshold.  How far user must swipe from edge before page snaps back to where it was. */
		snap_threshold = 0.25,

		/** Page Count. This is calculated based on element height and column height. */
		page_count = 0,

		/** Default Options */
		defaults = {

			/** Animation Speed. Lower numbers mean faster animations. Larger means slower. */
			animation_speed: 300,

			/**
			 * Debug Level
			 * 5 = log, debug, info, warn, & error
			 * 4 = debug, info, warn, & error
			 * 3 = info, warn, & error
			 * 2 = warn & error
			 * 1 = error
			 * 0 = disable all debug messages
			 */
			debug_level: 0,

			/** Hide Address Bar. Used for iOS and Android Mobile Phones Only */
			hide_adress_bar: false,

			/** Use Keyboard Navigation. Whether or not to listen for key presses. */
			use_keyboard_navigation: false,

			/** Generate Page Numbers. Whether to display Page Numbers */
			generate_page_numbers: false,

			/** Page Number Format. How to display Page Numbers. %%NUMBER%% is current page. %%TOTAL%% is total. */
			page_number_format: 'Page %%NUMBER%% of %%TOTAL%%',

			/** Column Padding. */
			column_padding: 0
		};

	/**
	 * Plugin
	 * Default jQuery Plugin Setup
	 *
	 * @param {object} element DOM Element
	 * @param {object} options    Configuration Options
	 */
	function Plugin( element, options ) {
		this._defaults = defaults;
		this._name = plugin_name;
		this.element = element;
		this.options = $.extend({}, defaults, options);

		this.init();
	}

	/**
	 * Keyboard Handler
	 * Listen for specific key presses if options.use_keyboard_navigation is true
	 *
	 * @param  {object} e Key Pressed
	 * @access private
	 */
	function keyboard_handler(e) {
		switch(e.keyCode)
		{
			// Left & Page Up Keypress - Previous Page
			case 37:
			case 33:
				this.previous();
				break;

			// Right & Page Down Keypress - Next Page
			case 39:
			case 34:
				this.next();
				break;

			// Up & Home Keypress - First Page
			case 38:
			case 36:
				this.home();
				break;

			// Up & End Keypress - Last Page
			case 40:
			case 35:
				this.go_to_page(page_count);
				break;
		}
	}

	/**
	 * Generate Page Numbers
	 * Gets called in setup_swipe if options.generate_page_numbers is true
	 *
	 * @access private
	 */
	function generate_page_numbers()
	{
		var position = null;
		var i = 0;

		$('.page_number').remove();
		$('.page_numbers', element).html('');

		for(i=0; i<page_count; i++)
		{
			var html = '<div class="page_number" id="page_number_'+ (i+1) +'">' + options.page_number_format + '<\/div>';
			html = html.replace('%%NUMBER%%', (i+1));
			html = html.replace('%%TOTAL%%', page_count);

			$('.page_numbers', element).append(html);

			if(position === null)
			{
				position = $('#page_number_1', element).position();
			}

			$('#page_number_' + (i+1), element).css({ 'left': Math.ceil(position.left) + Math.ceil( column_width * i ) + 'px' });
		}
	}

	/**
	 * Swipe Status
	 * Handles Swipe Detection and figured out direction, speed & animation
	 *
	 * @param  {object} event
	 * @param  {string} phase [move, left, right, end, cancel]
	 * @param  {string} direction [left, right, up, down]
	 * @param  {number} distance
	 *
	 * @access private
	 */
	function swipe_status(event, phase, direction, distance)
	{
		// If we are moving before swipe, and we are going L or R in X mode, or U or D in Y mode then drag.
		if(phase == 'move' && (direction == 'left' || direction == 'right') )
		{
			if (direction == 'left')
			{
				animate((column_width * current_page) + distance, 0);
			}
			else if (direction == 'right')
			{
				animate((column_width * current_page) - distance, 0);
			}
		}
		else if(phase == 'cancel')
		{
			animate(column_width * current_page, options.animation_speed);
		}
		else if(phase == 'end' && distance > Math.ceil(column_width * snap_threshold))
		{
			if (direction == 'right')
			{
				Plugin.prototype.previous();
			}
			else if (direction == 'left')
			{
				Plugin.prototype.next();
			}
		}
		else if(phase == 'end' && distance <= Math.ceil(column_width * snap_threshold))
		{
			animate(column_width * current_page, options.animation_speed);
		}

		if(direction)
		{
			$('body').trigger('sc_swipe_status.swipe_columns', [{ 'phase': phase, 'direction': direction, 'distance': distance }]);
		}
	}

	/**
	 * Animate Page Swipe
	 * Use CSS to animate the page smoothly
	 *
	 * @param  {number} distance How far to move
	 * @param  {number} duration Time it takes to move in milliseconds
	 *
	 * @access private
	 */
	function animate(distance, duration)
	{
		var value = (distance<0 ? '' : '-') + Math.abs(distance).toString();

		$('.columns', element).css({
			'-webkit-transition-duration': (duration/1000).toFixed(1) + 's',
			'-webkit-transform': 'translate3d('+ value + 'px,0,0)',

			'-moz-transition-duration': (duration/1000).toFixed(1) + 's',
			'-moz-transform': 'translate3d('+ value + 'px,0,0)',

			'-o-transition-duration': (duration/1000).toFixed(1) + 's',
			'-o-transform': 'translate3d('+ value + 'px,0,0)',

			'transition-duration': (duration/1000).toFixed(1) + 's',
			'transform': 'translate3d('+ value + 'px,0,0)'
		});

		if(distance > 0)
		{
			$('body').trigger('sc_animate.swipe_columns', [{ 'distance': distance, 'duration': duration }]);
		}
	}

	/**
	 * Hide Address Bar
	 * Code to hide the address bar for browsers that support it
	 *
	 * @access private
	 */
	function hide_address_bar()
	{
		var win = window;
		var doc = win.document;

		// If there's a hash, or addEventListener is undefined, stop here
		if( !location.hash && win.addEventListener ){

			//scroll to 1
			win.scrollTo( 0, 1 );
			var scrollTop = 1,
			getScrollTop = function(){
				return win.pageYOffset || doc.compatMode === "CSS1Compat" && doc.documentElement.scrollTop || doc.body.scrollTop || 0;
			},

			//reset to 0 on bodyready, if needed
			bodycheck = setInterval(function(){
				if( doc.body ){
					clearInterval( bodycheck );
					scrollTop = getScrollTop();
					win.scrollTo( 0, scrollTop === 1 ? 0 : 1 );
				}
			}, 15);

			win.addEventListener( "load", function(){
				setTimeout(function(){
					//at load, if user hasn't scrolled more than 20 or so...
					if( getScrollTop() < 20 ){
						//reset to hide addr bar at onload
						win.scrollTo( 0, scrollTop === 1 ? 0 : 1 );
					}
				}, 15);
			}, false );

			win.addEventListener( "orientationchange", function(){
				setTimeout(function(){
					//at load, if user hasn't scrolled more than 20 or so...
					if( getScrollTop() < 20 ){
						//reset to hide addr bar at onload
						win.scrollTo( 0, scrollTop === 1 ? 0 : 1 );
					}
				}, 15);
			}, false );
		}
	}

	/**
	 * Public Plugin Methods
	 * @type {Object}
	 */
	Plugin.prototype = {

		/** Initialize Plugin */
		init: function()
		{
			options = this.options;
			element = this.element;

			if(typeof window.debug !== 'undefined')
			{
				debug.setLevel(options.debug_level);
			}

			debug.log('init()');

			Plugin.prototype.update_layout();

			if(options.hide_adress_bar)
			{
				hide_address_bar();
			}

			$('body').trigger('sc_init.swipe_columns', [{ 'options': options, 'element': element }]);
		},

		/**
		 * Update Layout
		 * Setup CSS for the elements used by the plugin.  Call this any time the element changes size.
		 *
		 * @param  {boolean} updated Indicates if request is made after initial update
		 */
		update_layout: function(updated)
		{
			debug.log('update_layout()');

			$('.columns', element).css({ 'width': 'auto' });

			// Add required CSS to Wrapper Element
			$(element).css({
				'width': '100%',
				'height': '100%',
				'overflow': 'hidden',
				'position': 'absolute',

				'-webkit-overflow-scrolling': 'touch',
				'-moz-overflow-scrolling': 'touch',
				'-o-overflow-scrolling': 'touch',
				'overflow-scrolling': 'touch',

				'-webkit-transform': 'translate3d(0,0,0)',
				'-moz-transform': 'translate3d(0,0,0)',
				'-0-transform': 'translate3d(0,0,0)',
				'transform': 'translate3d(0,0,0)',

				'-webkit-box-sizing': 'border-box',
				'-moz-box-sizing': 'border-box',
				'-o-box-sizing': 'border-box',
				'box-sizing': 'border-box'
			});

			$('.columns', element).css({ 'overflow': 'hidden' });

			// Set Width & Height with update CSS in place
			column_width = Math.ceil($(element).width());
			column_height = Math.ceil($(element).height() - (options.column_padding * 2));

			// Set CSS Widths
			var css_column_width = Math.ceil( column_width - options.column_padding );
			var css_column_gap = Math.ceil(options.column_padding * 2);

			// Add required CSS to Child Elements
			$('.columns', element).css({
				'height': column_height + 'px',
				'z-index': 100,
				'padding': options.column_padding + 'px',
				'margin': '0',
				'padding-right': '0',
				'position': 'relative',

				'-webkit-transition-property': '-webkit-transform',
				'-webkit-transition-duration': '0.5s',
				'-webkit-transition-timing-function': 'ease-out',
				'-webkit-transform': 'translate3d(0,0,0)',

				'-moz-transition-property': '-moz-transform',
				'-moz-transition-duration': '0.5s',
				'-moz-transition-timing-function': 'ease-out',
				'-moz-transform': 'translate3d(0,0,0)',

				'-o-transition-property': '-o-transform',
				'-o-transition-duration': '0.5s',
				'-o-transition-timing-function': 'ease-out',
				'-o-transform': 'translate3d(0,0,0)',

				'transition-property': 'transform',
				'transition-duration': '0.5s',
				'transition-timing-function': 'ease-out',
				'transform': 'translate3d(0,0,0)',

				/* Safari and Chrome */
				'-webkit-column-count': 'auto',
				'-webkit-column-width': css_column_width + 'px',
				'-webkit-column-gap': css_column_gap + 'px',
				'-webkit-column-rule': 'none',

				/* Firefox */
				'-moz-column-count': 'auto',
				'-moz-column-width': css_column_width + 'px',
				'-moz-column-gap': css_column_gap + 'px',
				'-moz-column-rule': 'none',

				/* Opera */
				'-o-column-count': 'auto',
				'-o-column-width': css_column_width + 'px',
				'-o-column-gap': css_column_gap + 'px',
				'-o-column-rule': 'none',

				/* Non Vendor Prefixed */
				'column-count': 'auto',
				'column-width': css_column_width + 'px',
				'column-gap': css_column_gap + 'px',
				'column-rule': 'none'
			});

			// Reset Box Model and Max Widths on all Elements in Columns
			$('*', element).css({
				'-webkit-box-sizing': 'border-box',
				'-moz-box-sizing': 'border-box',
				'-o-box-sizing': 'border-box',
				'box-sizing': 'border-box',
				'max-width': css_column_width + 'px'
			});

			// Fix for figuring out page width if update is true
			var offset = (updated) ? column_width : 0;

			// Determine number of columns after everything is styled
			page_count = Math.ceil(($('.columns', element)[0].scrollWidth-offset) / column_width);

			$('.columns', element).css({ 'width': ( page_count * column_width ) + 'px', 'overflow': 'visible' });

			if(updated)
			{
				var new_page = Math.floor(page_count * current_percent);
				Plugin.prototype.go_to_page(new_page);
			}

			Plugin.prototype.setup_swipe();

			$('body').trigger('sc_update_layout.swipe_columns', [{
				'updated': updated,
				'page_count': page_count,
				'column_width': column_width,
				'column_height': column_height,
				'css_column_width': css_column_width,
				'css_column_gap': css_column_gap
			}]);
		},

		/**
		 * Setup Swipe. This should only be called once.  Sets up the swipe plugin.
		 */
		setup_swipe: function()
		{
			debug.log('setup_swipe()');

			var swipeOptions = {
				triggerOnTouchEnd : true,
				swipeStatus: swipe_status,
				allowPageScroll: 'vertical',
				threshold: 75,
				cancelThreshold: 50
			};

			$('.columns', element).swipe('destroy');
			$('.columns', element).swipe( swipeOptions );

			if(options.generate_page_numbers)
			{
				setTimeout(function(){ generate_page_numbers(); }, 100);
			}

			if(options.use_keyboard_navigation)
			{
				Plugin.prototype.keyboard_navigation();
			}

			$('body').trigger('sc_setup_swipe.swipe_columns', [swipeOptions]);
		},

		/**
		 * Keyboard Navigation. Sets up Event Listeners for Key Presses
		 */
		keyboard_navigation: function()
		{
			debug.log('keyboard_navigation()');

			var that = this;

			// Unbind existing Keyups on Page
			$('body').off('keyup.swipe_columns');

			// Bind Keyups on Page
			$('body').on('keyup.swipe_columns', function(e){ keyboard_handler.call(that, e); });
		},

		/**
		 * Go to Previous Page
		 * @example column_wrapper.SwipeColumns('previous');
		 */
		previous: function()
		{
			current_page--;
			if(current_page < 0)
			{
				current_page = 0;
				debug.log('On First Page');
			}

			debug.log('Go to Page ' + (current_page+1) + ' of ' + page_count);
			animate( column_width * current_page, options.animation_speed );
			current_percent = (1+current_page) / page_count;

			$('body').trigger('sc_previous.swipe_columns', [{
				'current_page': (1+current_page),
				'current_percent': Math.round(current_percent*100),
				'page_count': page_count
			}]);
			$('body').trigger('sc_page_change.swipe_columns', [{
				'current_page': (1+current_page),
				'current_percent': Math.round(current_percent*100),
				'page_count': page_count
			}]);
		},

		/**
		 * Go to Next Page
		 * @example column_wrapper.SwipeColumns('next');
		 */
		next: function()
		{
			current_page++;
			if(current_page > (page_count-1))
			{
				current_page = (page_count-1);
				debug.log('On Last Page');
			}

			debug.log('Go to Page ' + (current_page+1) + ' of ' + page_count);
			animate( column_width * current_page, options.animation_speed );
			current_percent = (1+current_page) / page_count;

			$('body').trigger('sc_next.swipe_columns', [{
				'current_page': (1+current_page),
				'current_percent': Math.round(current_percent*100),
				'page_count': page_count
			}]);
			$('body').trigger('sc_page_change.swipe_columns', [{
				'current_page': (1+current_page),
				'current_percent': Math.round(current_percent*100),
				'page_count': page_count
			}]);
		},

		/**
		 * Go to a Specific Page
		 * @param  {number} page Page number to go to
		 * @example column_wrapper.SwipeColumns('go_to_page', 3);
		 */
		go_to_page: function(page)
		{
			page = (page - 1);
			current_page = Math.min(Math.max(parseInt(page, 10), 0), (page_count-1));
			debug.log('Jumping to Page ' + (current_page+1) + ' of ' + page_count);
			animate( column_width * current_page, options.animation_speed);

			current_percent = (1+current_page) / page_count;

			$('body').trigger('sc_go_to_page.swipe_columns.swipe_columns', [{
				'current_page': (1+current_page),
				'current_percent': Math.round(current_percent*100),
				'page_count': page_count
			}]);
			$('body').trigger('sc_page_change.swipe_columns.swipe_columns', [{
				'current_page': (1+current_page),
				'current_percent': Math.round(current_percent*100),
				'page_count': page_count
			}]);
		},

		/**
		 * Go to Home Page
		 *
		 * @example column_wrapper.SwipeColumns('home');
		 */
		home: function()
		{
			debug.log('Go to First Page');

			current_page = 0;
			animate( column_width * current_page, options.animation_speed);

			current_percent = (1+current_page) / page_count;

			$('body').trigger('sc_home.swipe_columns.swipe_columns', [{
				'current_page': (1+current_page),
				'current_percent': Math.round(current_percent*100),
				'page_count': page_count
			}]);
			$('body').trigger('sc_page_change.swipe_columns.swipe_columns', [{
				'current_page': (1+current_page),
				'current_percent': Math.round(current_percent*100),
				'page_count': page_count
			}]);
		},

		/**
		 * Get Current Page
		 *
		 * @example column_wrapper.SwipeColumns('current_page');
		 */
		current_page: function()
		{
			debug.log('Get Current Page');

			return current_page;
		}
	};

	/** Initialize Plugin */
	$.fn[plugin_name] = function (options, args) {
		return this.each(function (){
			if (!$.data(this, 'plugin_' + plugin_name))
			{
				$.data(this, 'plugin_' + plugin_name, new Plugin(this, options));
			}
			else if ($.isFunction(Plugin.prototype[options]))
			{
                $.data(this, 'plugin_' + plugin_name)[options](args);
            }

			// Listen for orientation changes
			window.addEventListener('resize', function() {
				debug.log('Resize Event Fired');
				setTimeout(function(){ Plugin.prototype.update_layout(true); }, 10);
			}, false);

			// Listen for orientation changes
			window.addEventListener('orientationchange', function() {
				debug.log('Orientation Change Event Fired');
				setTimeout(function(){ Plugin.prototype.update_layout(true); }, 10);
			}, false);
		});
	};

})( jQuery, window, document );
