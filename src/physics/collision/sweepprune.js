define(
	[
		'../../util/class',
		'../../math/vector'
	],
	function(
		Class,
		Vector
	){

		var dof = {x:1, y:2}; // degrees of freedom

		// return hash for a pair of objects
		function pairHash( obj1, obj2 ){

			var id1 = obj1.id();
			var id2 = obj2.id();

			if ( obj1 === obj2 ){

				return null;
			}

			return (id1 > id2)? id1 + id2 : id2 + id1;
		}

		var SweepPrune = Class({

			// constructor
			SweepPrune: function(){

				this.intervalLists = {}; // stores lists of aabb projection intervals to be sorted
				this.pairs = {}; // pairs selected as candidate collisions by broad phase
				
				// init intervalLists
				for ( var xyz in dof ){

					this.intervalLists[ xyz ] = [];
				}
			}

			,broadPhase: function(){

				this.sortIntervalLists();
				this.checkOverlaps();
				this.updateCandidates();
			}

			// simple insertion sort for each axis
			,sortIntervalLists: function(){

				var list
					,len
			    	,i
			    	,hole
			    	,item
			    	;

			    // for each axis...
				for ( var xyz in dof ){

					list = this.intervalLists[ xyz ];
					i = 0;
					len = list.length;

					// for each item...
				    while ( (++i) < len ){

				    	// store item
				        item = list[ i ];
				        hole = i;

				        // while others are greater than item...
				        while ( 
				            hole > 0 && 
				            list[ hole - 1 ].val[ xyz ] > item.val[ xyz ]
				        ) {

				        	// move others greater than item to the right
				            list[ hole ] = list[ hole - 1 ];
				            hole--;
				        }

				        // insert item in the hole
				        list[ hole ] = item;
				    }
				}
			}

			,checkOverlaps: function(){

				var isX
					,hash
					,obj
					,other
					,item
					,list
					,len
					,i
					,j
					,c
					,encounters = []
					,pairs = this.pairs
					;

				for ( var xyz in dof ){

					isX = (xyz === 'x');
					list = this.intervalLists[ xyz ];
					i = -1;
					len = list.length;

					while( (++i) < len ){
						
						item = list[ i ];
						obj = item.obj;

						if ( item.type ){

							// is a max

							j = encounters.length;

							while( (--j) >= 0 ){

								other = encounters[j];
								if ( other === obj ){

									encounters.splice(j, 1);
									continue;
								}

								hash = pairHash( obj, other );
								c = pairs[ hash ];

								if ( !c ){

									if ( !isX )
										continue; // doesn't overlap in all axis so continue

									c = pairs[ hash ] = {
										one: obj,
										two: other,
										flag: 0
									}
								}

								c.flag = isX? 1 : c.flag + 1;
							}

						} else {

							// is a min

							encounters.push(obj);
						}
					}
				}

				var set = this.candidates = [];
				len = ( dof.z || dof.y || dof.x );
				// purge non-candidate collisions
				for ( hash in pairs ){

					if ( (c = pairs[ hash ]).flag === len ){

						set.push( c );
					}
				}
			}

			
			,updateCandidates: function(){

				

				
			}

			,addInterval: function( intr ){

				for ( var xyz in dof ){

					this.intervalLists[ xyz ].push( intr.min );
					this.intervalLists[ xyz ].push( intr.max );
				}
			}

			,updateInterval: function( obj ){

				var intr = obj.data('sp-interval')
					,pos = obj.position()
					,vol = obj.AABB()
					;

				if ( !intr ){

					// create new interval
					intr = obj.data('sp-interval', {

						min: {
							type: 0, //min
							val: new Vector(),
							obj: obj
						},

						max: {
							type: 1, //max
							val: new Vector(),
							obj: obj
						}
					});

					this.addInterval( intr );
				}

				intr.min.val.clone( pos ).vsub( vol );
				intr.max.val.clone( pos ).vadd( vol );

			}

			,getInteraction: function( callback ){

				var self = this;

				if ( !callback ){

					callback = function(){};
				}

				return {

					afterInertia: function( dt, obj, idx, list, par ){

						self.updateInterval( obj );

						if ( idx === list.length - 1 ){

							self.broadPhase();

							for ( var i = 0, cs = self.candidates, l = cs.length; i < l; i++ ){

								callback( dt, cs[i], i, cs )
							}
						}
					}
				};
			}
		}, 'SweepPrune');

		return SweepPrune;
	}
);