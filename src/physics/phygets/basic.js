define(
	[
		'util/class',
		'physics/body'
	],
	function(
		Class,
		Body
	){

		var Basic = Class({
				
			_type: 'basic'

			,_events: Body.prototype._events.concat(['physics.modified'])
			
			,__constructor__: function(){

				this.x = this.y = this.z = 0;
				this.midx = this.midy = this.midz = 0;
				this.px = this.py = this.pz = 0;
				//this.vx = this.vy = this.vz = 0;
				this.ax = this.ay = this.az = 0;

				Basic.prototype.__extends__.call( this );
			}

			,__extends__: Body

			// used in stepping process
			,resolveAcceleration: function( delta ){

				this.midx = this.x;
				this.midy = this.y;
				this.midz = this.z;

				// verlet
				this.x += this.ax * (delta*=delta);
				this.y += this.ay * delta;
				this.z += this.az * delta;
				
				//euler
				/*this.vx += this.ax*delta;
				this.vy += this.ay*delta;
				this.vz += this.az*delta;*/

				this.ax = this.ay = this.az = 0;
			}

			,resolveInertia: function( delta ){

				// Verlet
				var x = this.midx*2 - this.px
					,y = this.midy*2 - this.py
					,z = this.midz*2 - this.pz
					;

				this.px = this.midx;
				this.py = this.midy;
				this.pz = this.midz;

				// this step alows modifications to x,y,z to apply constraints
				this.x = x - (this.midx - this.x);
				this.y = y - (this.midy - this.y);
				this.z = z - (this.midz - this.z);

				//euler
				/*this.x += this.vx*delta;
				this.y += this.vy*delta;
				this.z += this.vz*delta;*/

			}

			,position: function( pos ){

				var type
					;

				if ( arguments.length > 0 ){

					type = typeof pos;

					if ( type === 'object' ){

						this.x = pos.x || this.x;
						this.y = pos.y || this.y;
						this.z = pos.z || this.z;

						this._fire( 'physics.modified', [ [this], this, 'position' ] );

					} else {

						this.x = pos || this.x;
						this.y = arguments[1] || this.y;
						this.z = arguments[2] || this.z;

						this._fire( 'physics.modified', [ [this], this, 'position' ] );
					}
				}

				return {
					x: this.x,
					y: this.y,
					z: this.z
				};
			}

			,velocity: function( vel ){

				var type
					;

				if ( arguments.length > 0 ){

					type = typeof vel;

					if ( type === 'object' ){

						this.px = this.x - (vel.x || 0);
						this.py = this.y - (vel.y || 0);
						this.pz = this.z - (vel.z || 0);

						this._fire( 'physics.modified', [ [this], this, 'velocity' ] );

					} else {

						this.px = this.x - (vel || 0);
						this.py = this.y - (arguments[1] || 0);
						this.pz = this.z - (arguments[2] || 0);

						this._fire( 'physics.modified', [ [this], this, 'velocity' ] );
					}
				}

				return {
					x: this.x - this.px,
					y: this.y - this.py,
					z: this.z - this.pz
				};	
			}

			,accelerate: function( accel ){

				var type
					;

				if ( arguments.length > 0 ){

					type = typeof accel;

					if ( type === 'object' ){

						accel.x && this.ax += accel.x;
						accel.y && this.ay += accel.y;
						accel.z && this.az += accel.z;

						this._fire( 'physics.modified', [ [this], this, 'acceleration' ] );

					} else {

						if ( accel ) this.ax += accel;
						if ( arguments[1] ) this.ay += arguments[1]
						if ( arguments[2] ) this.az += arguments[2]

						this._fire( 'physics.modified', [ [this], this, 'acceleration' ] );
					}
				}

				return this;
			}

		});

		return Basic;
	}
);