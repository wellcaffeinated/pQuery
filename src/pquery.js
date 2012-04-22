define(
	[
		'world',
		'body',
		//'timer'
	],
	function(
		World,
		Body,
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

			// [[Class]] -> type pairs
			,class2type = {}

			// Save a reference to some core methods
			,toString = Object.prototype.toString
			,hasOwn = Object.prototype.hasOwnProperty
			,push = Array.prototype.push
			,slice = Array.prototype.slice
			,trim = String.prototype.trim
			,indexOf = Array.prototype.indexOf

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
							// just do a createElement and skip the rest
							ret = rsingleTag.exec( selector );

							if ( ret ) {

								selector = [ pQuery.createBody( ret[1] ) ];

								// add to world if world is context
								if ( doc )
									doc.add( selector[0] );
								
							} else {
								ret = pQuery.buildFragment( [ match[1] ], [ doc ] );
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

		pQuery.extend = pQuery.fn.extend = function() {
			var options, name, src, copy, copyIsArray, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = false;

			// Handle a deep copy situation
			if ( typeof target === "boolean" ) {
				deep = target;
				target = arguments[1] || {};
				// skip the boolean and the target
				i = 2;
			}

			// Handle case when target is a string or something (possible in deep copy)
			if ( typeof target !== "object" && !pQuery.isFunction(target) ) {
				target = {};
			}

			// extend pQuery itself if only one argument is passed
			if ( length === i ) {
				target = this;
				--i;
			}

			for ( ; i < length; i++ ) {
				// Only deal with non-null/undefined values
				if ( (options = arguments[ i ]) != null ) {
					// Extend the base object
					for ( name in options ) {
						src = target[ name ];
						copy = options[ name ];

						// Prevent never-ending loop
						if ( target === copy ) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if ( deep && copy && ( pQuery.isPlainObject(copy) || (copyIsArray = pQuery.isArray(copy)) ) ) {
							if ( copyIsArray ) {
								copyIsArray = false;
								clone = src && pQuery.isArray(src) ? src : [];

							} else {
								clone = src && pQuery.isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[ name ] = pQuery.extend( deep, clone, copy );

						// Don't bring in undefined values
						} else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}

			// Return the modified object
			return target;
		};

		pQuery.extend({
			// See test/unit/core.js for details concerning isFunction.
			// Since version 1.3, DOM methods and functions like alert
			// aren't supported. They return false on IE (#2968).
			isFunction: function( obj ) {
				return pQuery.type(obj) === "function";
			}

			,isArray: Array.isArray || function( obj ) {
				return pQuery.type(obj) === "array";
			}

			,isNumeric: function( obj ) {
				return !isNaN( parseFloat(obj) ) && isFinite( obj );
			}

			,type: function( obj ) {
				return obj == null ?
					String( obj ) :
					class2type[ toString.call(obj) ] || "object";
			}

			,isPlainObject: function( obj ) {
				// Must be an Object.
				// Because of IE, we also have to check the presence of the constructor property.
				// Make sure that DOM nodes and window objects don't pass through, as well
				if ( !obj || pQuery.type(obj) !== "object" || obj.nodeType || obj == obj.window ) {
					return false;
				}

				try {
					// Not own constructor property must be Object
					if ( obj.constructor &&
						!hasOwn.call(obj, "constructor") &&
						!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
						return false;
					}
				} catch ( e ) {
					// IE8,9 Will throw exceptions on certain host objects #9897
					return false;
				}

				// Own properties are enumerated firstly, so to speed up,
				// if last one is own, then all properties are own.

				var key;
				for ( key in obj ) {}

				return key === undefined || hasOwn.call( obj, key );
			}

			,isEmptyObject: function( obj ) {
				for ( var name in obj ) {
					return false;
				}
				return true;
			}

			,error: function( msg ) {
				throw new Error( msg );
			}

			,noop: function() {}

			// args is for internal usage only
			,each: function( object, callback, args ) {
				var name, i = 0,
					length = object.length,
					isObj = length === undefined || pQuery.isFunction( object );

				if ( args ) {
					if ( isObj ) {
						for ( name in object ) {
							if ( callback.apply( object[ name ], args ) === false ) {
								break;
							}
						}
					} else {
						for ( ; i < length; ) {
							if ( callback.apply( object[ i++ ], args ) === false ) {
								break;
							}
						}
					}

				// A special, fast, case for the most common use of each
				} else {
					if ( isObj ) {
						for ( name in object ) {
							if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
								break;
							}
						}
					} else {
						for ( ; i < length; ) {
							if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
								break;
							}
						}
					}
				}

				return object;
			}

			// results is for internal usage only
			,makeArray: function( array, results ) {
				var ret = results || [];

				if ( array != null ) {
					// The window, strings (and functions) also have 'length'
					// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
					var type = pQuery.type( array );

					if ( array.length == null || type === "string" || type === "function" || type === "regexp" || array === array.window ) {
						push.call( ret, array );
					} else {
						pQuery.merge( ret, array );
					}
				}

				return ret;
			}

			,merge: function( first, second ) {
				var i = first.length,
					j = 0;

				if ( typeof second.length === "number" ) {
					for ( var l = second.length; j < l; j++ ) {
						first[ i++ ] = second[ j ];
					}

				} else {
					while ( second[j] !== undefined ) {
						first[ i++ ] = second[ j++ ];
					}
				}

				first.length = i;

				return first;
			}

		});

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

			,createBody: function( type ){

				return new Body();
			}

		});

		// Populate the class2type map
		pQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
			class2type[ "[object " + name + "]" ] = name.toLowerCase();
		});


		return pQuery;
	}
);