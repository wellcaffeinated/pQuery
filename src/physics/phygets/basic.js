define(
	[
		'../../util/class',
		'../../util/tools',
		'../../math/vector',
		'../body'
	],
	function(
		Class,
		Tools,
		Vector,
		Body
	){
		
		var Basic = Class({
				
			_type: 'basic'

			,_events: Body.prototype._events.concat(['physics.modified'])
			
			,Basic: function(){

				Basic.prototype.__extends__.call( this );

				var _ = this._;

				// position
				_.pos = new Vector();
				// temp position
				_.mid = new Vector();
				// previous position
				_.prev = new Vector();
				// velocity
				_.v = new Vector();
				// acceleration
				_.a = new Vector();
				
			}

			,__extends__: Body

			// used in stepping process
			,resolveAcceleration: function( dt ){

				var _ = this._;

				_.mid.clone(_.pos);

				// verlet
				_.pos.vadd( _.a.mult( dt*dt ) );
				
				_.a.zero();
			}

			,resolveInertia: function( dt ){

				// Verlet
				// this method alows modifications to pos in interim to apply constraints
				var _ = this._;

				_.pos.vadd( _.mid ).vsub( _.prev );

				_.prev.clone( _.mid );
			}

			,position: function( pos ){

				var _ = this._
					,type
					,prev = false
					;

				if ( arguments.length > 0 ){

					type = typeof pos;

					if ( type === 'object' ){

						_.pos.set(
							( pos.x !== undefined )? pos.x : _.pos.x,
							( pos.y !== undefined )? pos.y : _.pos.y,
							( pos.z !== undefined )? pos.z : _.pos.z
						);

						_.prev.set(
							( pos.px !== undefined )? pos.px : _.prev.x,
							( pos.py !== undefined )? pos.py : _.prev.y,
							( pos.pz !== undefined )? pos.pz : _.prev.z
						);

					} else {

						_.pos.set(
							( pos !== undefined )? pos : _.pos.x,
							( arguments[1] !== undefined )? arguments[1] : _.pos.y,
							( arguments[2] !== undefined )? arguments[2] : _.pos.z
						);

					}
				}

				return _.pos.toNative();
			}

			,velocity: function( vel ){

				var _ = this._
					,type
					;

				if ( arguments.length > 0 ){

					type = typeof vel;

					if ( type === 'object' ){

						_.prev.clone(_.pos).vsub(
						    _.v.set(
								( vel.x !== undefined )? vel.x : 0,
								( vel.y !== undefined )? vel.y : 0,
								( vel.z !== undefined )? vel.z : 0
							)
						);

					} else {

						_.prev.clone(_.pos).vsub(
						    _.v.set(
								( vel !== undefined )? vel : 0,
								( arguments[1] !== undefined )? arguments[1] : 0,
								( arguments[2] !== undefined )? arguments[2] : 0
							)
						);

					}

					return _.v.toNative();
				}

				return _.v.clone(_.pos).vsub(_.prev).toNative();	
			}

			,accelerate: function( accel ){

				var _ = this._
					,type
					;

				if ( arguments.length > 0 ){

					type = typeof accel;

					if ( type === 'object' ){

						_.a.add(
							( accel.x !== undefined )? accel.x : 0,
							( accel.y !== undefined )? accel.y : 0,
							( accel.z !== undefined )? accel.z : 0
						);

					} else {

						_.a.add(
							( accel !== undefined )? accel : 0,
							( arguments[1] !== undefined )? arguments[1] : 0,
							( arguments[2] !== undefined )? arguments[2] : 0
						);

					}
				}

				return this;
			}

		}, 'Basic');

		return Basic;
	}
);