/*
 * spa.shell.js
 * Shell module for SPA
 */

 // Page - 91

spa.shell = (function() {
	/* BEGIN MODULE SCOPE VARIABLES */
	var 
		configMap = {
			anchor_schema_map : { open : true, closed : true },
			main_html : String()
				+ '<div class="spa-shell-head">'
					+ '<div class="spa-shell-head-logo"></div>'
					+ '<div class="spa-shell-head-acct"></div>'
					+ '<div class="spa-shell-head-search"></div>'
				+ '</div>'
				+ '<div class="spa-shell-main">'
					+ '<div class="spa-shell-main-nav"></div>'
					+ '<div class="spa-shell-main-content"></div>'
				+ '</div>'
				+ '<div class="spa-shell-foot"></div>'
				+ '<div class="spa-shell-chat"></div>'
				+ '<div class="spa-shell-modal"></div>',

			chat_extend_time : 300,
			chat_retract_time : 300,
			chat_extend_height : 450,
			chat_retract_height : 15,
			chat_extend_title : "Click to retract",
			chat_retract_title : "Click to extend"
		},
		stateMap = { 
			$container : null,
			anchor_map : {},
			is_chat_retracted : true
		},
		jqueryMap = {},
		copyAnchorMap, setJqueryMap, toggleChat,
		changeAnchorPart, onHashchange,
		onClickChat, initModule;
	/* END MODULE SCOPE VARIABLES */

	/* BEGIN UTILITY METHODS */
	// Returns copy of storred anchor map
	copyAnchorMap = function() {
		return $.extend( true, {}, stateMap.anchor_map );
	};
	/* END UTILITY METHODS */

	/* BEGIN DOM METHODS */
	/* Begin DOM method setJqueryMap */
	setJqueryMap = function() {
		var $container = stateMap.$container;
		jqueryMap = { 
			$container : $container,
			$chat : $container.find( ".spa-shell-chat")
		};
	};

	/* Begin DOM method changeAnchorPart */
	// Purpose: Change part of the URI anchor component
	// Arguments:
	//  * arg_map - The map describing what part of the URI anchor we want to change
	// Returns: boolean
	// 	* true - the Anchor portion of the URI was updated
	// 	* false - the Anchor portion of the URI could not be updated
	// Action:
	// 	The current Anchor rep storred in the stateMap.anchor_map
	//  This method
	//		* Creates copy of this map using copyAnchorMap(),
	//		* Modifies the kay-values using arg_map,
	//		* Manages the indication between independent and dependent values in the encoding,
	//		* Attempts to change the URI using uriAnchor,
	//		* Returns true on success and false on failure.
	changeAnchorPart = function( arg_map ) {
		var
			anchor_map_revise = copyAnchorMap(),
			bool_return = true;
			key_name, key_name_dep;

		// Begin merge changes into anchor map
		KEYVAL:
		for ( key_name in arg_map ) {
			if ( arg_map.hasOwnProperty( key_name ) ) {

				// skip dependent keys during iteration
				if ( key_name.indexOf( "_" ) === 0 ) continue KEYVAL;

				// update independent key value
				anchor_map_revise[key_name] = arg_map[key_name];

				// update matching dependent key
				key_name_dep = "_" + key_name;
				if ( arg_map[key_name_dep] ) anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
				else {
					delete anchor_map_revise[key_name_dep];
					delete anchor_map_revise["_s" + key_name_dep];
				}
			}
		}
		// End merge changes into anchor map

		// Begin attempt to update URI; revert if unsuccessful
		try {
			$.uriAnchor.setAnchor( anchor_map_revise );
		}
		catch( error ) {
			// Replace URI with existing state
			$.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
			bool_return = false;
		}
		// End attempt to update URI

		return bool_return;
	};
	/* End DOM method changeAnchorPart */
	/* End DOM method setJqueryMap */

	/* Begin DOM method toggleChat */
	// Purpose: Extends and retracts chat slider
	// Arguments:
	// 	* do_extend - if true, extends slider; if false, retracts
	//	* callback - optional function to execute at end of animation
	// Settings:
	// 	* chat_extend_time, chat_retract_time,
	//  * chat_extend_height, chat_retract_height
	// State:
	//  * sets stateMap.is_chat_retracted
	// Returns:
	// 	* true - slider is retracted
	// 	* false - slider is extended
	toggleChat = function(do_extend, callback) {
		var
			px_chat_ht = jqueryMap.$chat.height(),
			is_open = px_chat_ht === configMap.chat_extend_height,
			is_closed = px_chat_ht === configMap.chat_retract_height,
			is_sliding = !is_open && !is_closed;

		// Avoid race condition
		if ( is_sliding ) return false;

		// Begin extend chat slider
		if ( do_extend ) {
			jqueryMap.$chat.animate(
				{ height : configMap.chat_extend_height },
				configMap.chat_extend_time,
				function () {
					jqueryMap.$chat.attr("title", configMap.chat_extend_title);
					stateMap.is_chat_retracted = false;
					if ( callback ) { callback (jqueryMap.$chat ) };
				}
			);
			return true;
		}
		// End extend chat slider

		// Begin retract chat slider
		jqueryMap.$chat.animate(
			{ height : configMap.chat_retract_height },
			configMap.chat_retract_time,
			function () {
				jqueryMap.$chat.attr("title", configMap.chat_retract_title);
				stateMap.is_chat_retracted = true;
				if ( callback ) { callback (jqueryMap.$chat ) };
			}
		);
		return true;
		// End retract chat slider
	};
	/* End DOM method toggleChat */
	/* END DOM METHODS */

	/* BEGIN EVENT HANDLERS */
	/* Begin event handler onClickChat */
	onClickChat = function() {
		if ( toggleChat(stateMap.is_chat_retracted) )
			$.uriAnchor.setAnchor({ chat : (stateMap.is_chat_retracted ? "open" : "closed") });
		return false;
	};
	/* End event handler onClickChat */
	/* END EVENT HANDLERS */

	/* BEGIN PUBLIC METHODS */
	/* Begin public method initModule */
	initModule = function($container) {
		// load HTML and map jquery collections
		stateMap.$container = $container;
		$container.html(configMap.main_html);
		setJqueryMap();

		// Initialize the chat slider and bind click event handler
		stateMap.is_chat_retracted = true;
		jqueryMap.$chat
			.attr("title", configMap.chat_retract_title)
			.click(onClickChat);
	};
	/* End public method initModule */

	return { initModule : initModule };
	/* END PUBLIC METHODS */
})();