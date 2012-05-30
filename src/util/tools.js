/*!
 * pQuery physics library v@VERSION
 * https://github.com/wellcaffeinated/pQuery
 * 
 * Copyright 2012, Jasper Palfree
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 * Date: @DATE
 * @license
 */
define(function(){

		/**
		 * Shim for `Array.indexOf` 
		 */
		Array.prototype.indexOf = Array.prototype.indexOf || function ( searchElement, fromIndex ) {
		    "use strict";
		    if (this == null) {
		        throw new TypeError();
		    }
		    var t = Object(this);
		    var len = t.length >>> 0;
		    if (len === 0) {
		        return -1;
		    }
		    var n = 0;
		    if (arguments.length > 0) {
		        n = Number(arguments[1]);
		        if (n != n) { // shortcut for verifying if it's NaN
		            n = 0;
		        } else if (n != 0 && n != Infinity && n != -Infinity) {
		            n = (n > 0 || -1) * Math.floor(Math.abs(n));
		        }
		    }
		    if (n >= len) {
		        return -1;
		    }
		    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		    for (; k < len; k++) {
		        if (k in t && t[k] === searchElement) {
		            return k;
		        }
		    }
		    return -1;
		};

		/*!
		 * Contains modified parts of jQuery JavaScript Library v1.7.2
		 * http://jquery.com/
		 *
		 * Copyright 2011, John Resig
		 * Dual licensed under the MIT or GPL Version 2 licenses.
		 * http://jquery.org/license
		 *
		 */
			// [[Class]] -> type pairs
		var	class2type = {}
			// Save a reference to some core methods
			,toString = Object.prototype.toString
			,hasOwn = Object.prototype.hasOwnProperty
			,push = Array.prototype.push
			,slice = Array.prototype.slice
			,trim = String.prototype.trim
			,indexOf = Array.prototype.indexOf
			,Tools = {

				extend: function() {
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
					if ( typeof target !== "object" && !Tools.isFunction(target) ) {
						target = {};
					}

					// extend current object itself if only one argument is passed
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
								if ( deep && copy && ( Tools.isPlainObject(copy) || (copyIsArray = Tools.isArray(copy)) ) ) {
									if ( copyIsArray ) {
										copyIsArray = false;
										clone = src && Tools.isArray(src) ? src : [];

									} else {
										clone = src && Tools.isPlainObject(src) ? src : {};
									}

									// Never move original objects, clone them
									target[ name ] = Tools.extend( deep, clone, copy );

								// Don't bring in undefined values
								} else if ( copy !== undefined ) {
									target[ name ] = copy;
								}
							}
						}
					}

					// Return the modified object
					return target;
				}

				// See test/unit/core.js for details concerning isFunction.
				// Since version 1.3, DOM methods and functions like alert
				// aren't supported. They return false on IE (#2968).
				,isFunction: function( obj ) {
					return Tools.type(obj) === "function";
				}

				,isArray: Array.isArray || function( obj ) {
					return Tools.type(obj) === "array";
				}

				,isNumeric: function( obj ) {
					return !isNaN( parseFloat(obj) ) && isFinite( obj );
				}

				,isNumericQuick: function( obj ){
					return obj == 0 || 1%(obj) >= 0;
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
					if ( !obj || Tools.type(obj) !== "object" || obj.nodeType || obj == obj.window ) {
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
						isObj = length === undefined || Tools.isFunction( object );

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
						var type = Tools.type( array );

						if ( array.length == null || type === "string" || type === "function" || type === "regexp" || array === array.window ) {
							push.call( ret, array );
						} else {
							Tools.merge( ret, array );
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

				// Cross-browser xml parsing
				,parseXML: function( data ) {
					if ( typeof data !== "string" || !data ) {
						return null;
					}
					var xml, tmp;
					try {
						if ( window.DOMParser ) { // Standard
							tmp = new DOMParser();
							xml = tmp.parseFromString( data , "text/xml" );
						} else { // IE
							xml = new ActiveXObject( "Microsoft.XMLDOM" );
							xml.async = "false";
							xml.loadXML( data );
						}
					} catch( e ) {
						xml = undefined;
					}
					if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
						Tools.error( "Invalid XML: " + data );
					}
					return xml;
				}

				,now: function() {
					return ( new Date() ).getTime();
				}

				// A global GUID counter for objects
				,guid: 1

				// Bind a function to a context, optionally partially applying any
				// arguments.
				,proxy: function( fn, context ) {
					if ( typeof context === "string" ) {
						var tmp = fn[ context ];
						context = fn;
						fn = tmp;
					}

					// Quick check to determine if target is callable, in the spec
					// this throws a TypeError, but we will just return undefined.
					if ( !Tools.isFunction( fn ) ) {
						return undefined;
					}

					// Simulated bind
					var args = slice.call( arguments, 2 ),
						proxy = function() {
							return fn.apply( context, args.concat( slice.call( arguments ) ) );
						};

					// Set the guid of unique handler to the same of original handler, so it can be removed
					proxy.guid = fn.guid = fn.guid || proxy.guid || Tools.guid++;

					return proxy;
				}

				,unique: function( results ){

					var i, j, l;

					for ( i = 0, l = results.length; i < l; i++ ){
						for ( j = i + 1; j < l; j++ ){
							if ( results[ i ] === results[ j ] ){
								results.splice( j--, 1 );
								l--;
							}
						}
					}

					return results;
				}

			}
			;

		// Populate the class2type map
		Tools.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
			class2type[ "[object " + name + "]" ] = name.toLowerCase();
		});

		return Tools;
	}
);