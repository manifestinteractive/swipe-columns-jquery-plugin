# SwipeColumns jQuery Plugin

SwipeColumns jQuery Plugin - [CSS3 Columns](http://webdesign.tutsplus.com/tutorials/htmlcss-tutorials/an-introduction-to-the-css3-multiple-column-layout-module/) + [Swipeable Pages](http://labs.rampinteractive.co.uk/touchSwipe/demos/Basic_swipe.html) = [Magic](http://octodex.github.com/nyantocat/)

This jQuery Plugin lets you take your existing HTML Markup and have it automatically take anything that does not fit on the screen, and move it onto a new slide that you can swipe to.  It does this without modifying your HTML at all, so you are not required to rethink your existing markup.  Just throw it in an element, and call this plugin on it, and wammo, Swipeable Columns.

### Required Libraries

* [TouchSwipe jQuery Plugin](https://github.com/mattbryson/TouchSwipe-Jquery-Plugin) - for handling Swipe Events ( without Requiring breaking up content first like other libraries )
* [Debug Console](http://benalman.com/projects/javascript-debug-console-log)

# Demo Page

I have setup a demo for you to view, but to get an idea, use your mobile device or tablet.  If you wish to view it on the desktop, make sure you size your window to be pretty small, and then refresh the page ;)

[SWIPE COLUMN DEMO](http://lab.peterschmalfeldt.com/swipe-columns-jquery-plugin/demo/)

### HTML Usage ( "column_wrapper" can be named anything, but needs to contain the nested structure and class names )

	<div class="column_wrapper">
		<div class="columns">

			<div class="page_numbers"></div>

			<!--// PLACE YOUR HTML HERE //-->

		</div>
	</div>

### Example JavaScript Usage:

	<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
	<script src="js/jquery.touchSwipe.min.js"></script>
	<script src="js/swipe_columns.min.js"></script>

	<script>
	/** Create Variable to Store Element */
	var column_wrapper = jQuery('.column_wrapper');

	/** Setup Swipe Columns */
	jQuery(function(){
		column_wrapper.SwipeColumns({
			debug_level: 5,
			hide_adress_bar: true,
			column_padding: 20,
			use_keyboard_navigation: true,
			generate_page_numbers: true
		});
	});
	</script>

### Listening for Events

	<script>
	/** Listen for SwipeColumns init function to be triggered */
	jQuery('body').bind('sc_init.swipe_columns', function(evt, data){
		console.log(data); // Returns { 'options': options, 'element': element }
	});

	/** Listen for SwipeColumns swipe_status function to be triggered */
	jQuery('body').bind('sc_swipe_status.swipe_columns', function(evt, data){
		console.log(data); // Returns { 'phase': phase, 'direction': direction, 'distance': distance }
	});

	/** Listen for SwipeColumns animate function to be triggered */
	jQuery('body').bind('sc_animate.swipe_columns', function(evt, data){
		console.log(data); // Returns { 'distance': distance, 'duration': duration }
	});

	/** Listen for SwipeColumns update_layout function to be triggered */
	jQuery('body').bind('sc_update_layout.swipe_columns', function(evt, data){
		console.log(data);

		/*	Returns:
			{
				'updated': boolean,
				'page_count': integer,
				'column_width': integer,
				'column_height': integer,
				'css_column_width': integer,
				'css_column_gap': integer
			}
		*/
	});

	/** Listen for SwipeColumns setup_swipe function to be triggered */
	jQuery('body').bind('sc_setup_swipe.swipe_columns', function(evt, data){
		console.log(data); // Returns swipeOptions Settings
	});

	/** Listen for SwipeColumns previous function to be triggered */
	jQuery('body').bind('sc_previous.swipe_columns', function(evt, data){
		console.log(data);

		/*	Returns:
			{
				'current_page': integer,
				'current_percent': integer,
				'page_count': integer
			}
		*/
	});

	/** Listen for SwipeColumns next function to be triggered */
	jQuery('body').bind('sc_next.swipe_columns', function(evt, data){
		console.log(data);

		/*	Returns:
			{
				'current_page': integer,
				'current_percent': integer,
				'page_count': integer
			}
		*/
	});

	/** Listen for SwipeColumns go_to_page function to be triggered */
	jQuery('body').bind('sc_go_to_page.swipe_columns', function(evt, data){
		console.log(data);

		/*	Returns:
			{
				'current_page': integer,
				'current_percent': integer,
				'page_count': integer
			}
		*/
	});

	/** Listen for SwipeColumns home function to be triggered */
	jQuery('body').bind('sc_home.swipe_columns', function(evt, data){
		console.log(data);

		/*	Returns:
			{
				'current_page': integer,
				'current_percent': integer,
				'page_count': integer
			}
		*/
	});

	/**
	 * Listen for SwipeColumns page_change function to be triggered
	 * Fires on previous, next, go_to_page & home
	 */
	jQuery('body').bind('sc_page_change.swipe_columns', function(evt, data){
		console.log(data);

		/*	Returns:
			{
				'current_page': integer,
				'current_percent': integer,
				'page_count': integer
			}
		*/
	});
	</script>
