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
			
			,__constructor__: function(){

				this.x = this.y = this.z = 0;
				this.px = this.py = this.pz = 0;
				this.ax = this.ay = this.az = 0;

				Basic.prototype.__extends__.call( this );
			}

			,__extends__: Body

			// used in stepping process
			,resolve: {

				acceleration: function( delta ){

					this.x += this.ax * (delta *= delta);
					this.y += this.ay * delta;
					this.z += this.az * delta;
					this.ax = this.ay = this.az = 0;
				}

				,inertia: function( delta ){

					var x = this.x*2 - this.px
						,y = this.y*2 - this.py
						,z = this.z*2 - this.pz
						;

					this.px = this.x;
					this.py = this.y;
					this.pz = this.z;
					this.x = x;
					this.y = y;
					this.z = z;
				}

			}

		});

		return Basic;
	}
);