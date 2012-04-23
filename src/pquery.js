define(
	[
		'util/slick.parser',
		'util/tools',
		'physics/world',
		'physics/phyget'
		
		//'timer'
	],
	function(
		Slick,
		Tools,
		World,
		Phyget,
		
		//timer,

		undefined
	){
		var pQuery = function( selector, context ){

				var ret
					,w
					;

				// Handle $(""), $(null), or $(undefined)
				if ( !selector ) {
					return pQuery.createWorld();
				}
				
				// HANDLE: $(function)
				// Shortcut for context specific
				if ( !World.isWorld( selector ) && pQuery.isFunction( selector ) ) {
					ret = pQuery(false);
					selector( ret );
					return ret;
				}

				return new pQuery.fn.init( selector, context );
			}

			// placeholder for no context
			,noContext = false

			// A simple way to check for HTML strings or ID strings
			// Prioritize #id over <tag> 
			,quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/
			// Check if a string has a non-whitespace character in it
			,rnotwhite = /\S/

			// Used for trimming whitespace
			,trimLeft = /^\s+/
			,trimRight = /\s+$/

			// Match a standalone tag
			,rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/

			,worlds = []
			;

		pQuery.fn = pQuery.prototype = {

			constructor: pQuery,
			init: function( selector, context ) {
				var match
					,elem
					,ret
					,doc
					;

				// Handle $(World)
				if ( World.isWorld( selector ) ) {
					this.context = this[0] = selector;
					this.length = 1;
					return this;
				}

				// Handle query strings
				if ( typeof selector === "string" ) {
					// Are we dealing with HTML style string or an ID?
					if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
						// Assume that strings that start and end with <> are HTML and skip the regex check
						match = [ null, selector, null ];

					} else {
						match = quickExpr.exec( selector );
					}

					// Verify a match, and that no context was specified for #id
					if ( match && match[1] ) {

						// HANDLE: $(html) -> $(array)
						if ( match[1] ) {
							context = context instanceof pQuery ? context[0] : context;
							doc = context || noContext;

							// If a single string is passed in and it's a single tag
							// just do a createPhyget and skip the rest
							ret = rsingleTag.exec( selector );

							if ( ret ) {

								selector = [ pQuery.createPhyget( ret[1] ) ];

								// add to world if world is context
								if ( doc )
									doc.add( selector[0] );
								
							} else {
								// TODO
								ret = pQuery.buildFragment( [ match[1] ], [ doc ] );

								// TODO
								selector = ( ret.cacheable ? pQuery.clone(ret.fragment) : ret.fragment ).childNodes;
							}

							return pQuery.merge( this, selector );

						} 

					// HANDLE: $(expr, $(...))
					} else if ( !context || context.pQuery ) {
						return ( context || pQuery ).find( selector );

					// HANDLE: $(expr, context)
					// (which is just equivalent to: $(context).find(expr)
					} else {
						return this.constructor( context ).find( selector );
					}
				}

				if ( selector.selector !== undefined ) {
					this.selector = selector.selector;
					this.context = selector.context;
				}

				return pQuery.makeArray( selector, this );
			}

			// Start with an empty selector
			,selector: ''


			// The current version of pQuery being used
			,pQuery: '0.1a'

			// The default length of a pQuery object is 0
			,length: 0

			// Execute a callback for every element in the matched set.
			// (You can seed the arguments with an array of args)
			,each: function( callback, args ) {
				return pQuery.each( this, callback, args );
			}
		};

		// Give the init function the pQuery prototype for later instantiation
		pQuery.fn.init.prototype = pQuery.fn;

		pQuery.fn.extend = pQuery.extend = Tools.extend;

		pQuery.extend( Tools );

		// asset creation
		pQuery.extend({

			createWorld: function(){
				var w;
				worlds.push( w = new World() );
				return pQuery.extend(function( s, c ){
						return pQuery( s, c || w );
					},
					pQuery( w )
				);
			}

			,createPhyget: function( type ){

				//TODO
				return new Phyget();
			}

		});


		// Finder
		pQuery.find = function( selector, context, results ){

			var matches = []
				,selectorObj = Slick.parse( selector )
				;

			context = context || worlds;

			var i, j, currentExpression, currentBit;
			for (i = 0; (currentExpression = expressions[i]); i++){
				for (j = 0; (currentBit = currentExpression[j]); j++){

				}
			}

			return matches;
		}


		return pQuery;
	}
);