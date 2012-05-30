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

		// return hash for a pair of ids
		function pairHash( id1, id2 ){

			if ( id1 === id2 ){

				return null;
			}

			// valid for values < 2^16
			return id1 > id2? 
				(id1 << 16) | (id2 & 0xFFFF) : 
				(id2 << 16) | (id1 & 0xFFFF)
				;
		}

		var SweepPrune = Class({

			// constructor
			SweepPrune: function(){

				this.uid = 1;

				this.trackedObjects = [];
				this.intervalLists = {}; // stores lists of aabb projection intervals to be sorted
				this.pairs = []; // pairs selected as candidate collisions by broad phase
				
				// init intervalLists
				for ( var xyz in dof ){

					this.intervalLists[ xyz ] = [];
				}
			}

			,broadPhase: function(){

				this.updateIntervals();
				this.sortIntervalLists();
				this.checkOverlaps();
			}

			,narrowPhase: function( callback ) {

				var list = this.candidates
					,i
					,l = list.length
					;

				for ( i = 0; i < l; i++ ){

					callback( list[i], i, list )
				}
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

			,getPair: function(tr1, tr2, doCreate){

				var	hash = pairHash( tr1.id, tr2.id );
				var c = this.pairs[ hash ];

				if ( !c ){

					if ( !doCreate )
						return null;

					c = this.pairs[ hash ] = {
						one: tr1.obj,
						two: tr2.obj,
						flag: 0
					}
				}

				return c;
			}

			,checkOverlaps: function(){

				var isX
					,hash
					,tracker
					,other
					,item
					,list
					,len
					,i
					,j
					,c
					,collisionFlag = ( dof.z || dof.y || dof.x )
					,encounters = []
					,set = this.candidates = []
					;

				for ( var xyz in dof ){

					isX = (xyz === 'x');
					list = this.intervalLists[ xyz ];
					i = -1;
					len = list.length;

					while( (++i) < len ){
						
						item = list[ i ];
						tracker = item.tracker;

						if ( item.type ){

							// is a max

							j = encounters.length;

							while( (--j) >= 0 ){

								other = encounters[j];

								if ( other === tracker ){

									encounters.splice(j, 1);
									continue;
								}

								c = this.getPair( tracker, other, isX );

								if ( c ){
									
									c.flag = isX? 1 : c.flag + 1;

									if ( c.flag === collisionFlag ){

										set.push( c );
									}
								}
							}

						} else {

							// is a min

							encounters.push( tracker );
						}
					}
				}
			}

			,updateIntervals: function(){

				var tr
					,intr
					,pos
					,vol
					,list = this.trackedObjects
					,i = list.length
					;

				while( (--i) >= 0 ){

					tr = list[ i ];
					intr = tr.interval;
					pos = tr.obj.position();
					vol = tr.obj.AABB();

					intr.min.val.clone( pos ).vsub( vol );
					intr.max.val.clone( pos ).vadd( vol );

				}
			}

			// add object to list of those tracked by sweep and prune
			,trackObject: function( obj ){

				var tr = obj.data('sp-trackers');

				if ( tr && tr.indexOf( this ) !== -1 ) {
					
					return;
				}

				if ( !tr ){

					tr = [];
					obj.data( 'sp-trackers', tr );
				}

				// object remembers it is tracked by this
				tr.push( this );

				var tracker = {

					id: this.uid++

					,obj: obj
				};

				var intr = {

					min: {
						type: 0, //min
						val: new Vector(),
						tracker: tracker
					},

					max: {
						type: 1, //max
						val: new Vector(),
						tracker: tracker
					}
				};

				tracker.interval = intr;

				this.trackedObjects.push( tracker );
				
				for ( var xyz in dof ){

					this.intervalLists[ xyz ].push( intr.min, intr.max );
				}
			}

			,getInteraction: function( callback ){

				var self = this;

				if ( !callback ){

					callback = function(){};
				}

				return {

					afterInertia: function( dt, obj, idx, list, par ){

						self.trackObject( obj );

						if ( idx === list.length - 1 ){

							self.broadPhase();
							self.narrowPhase( function(pair, idx, list){
								callback( dt, pair, idx, list );
							});
						}
					}
				};
			}
		}, 'SweepPrune');

		return SweepPrune;
	}
);