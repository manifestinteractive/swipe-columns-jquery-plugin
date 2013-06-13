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
});
