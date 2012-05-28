define(
    [
        '../../../src/pquery'
    ], 
    function(
        pQuery
    ){
        // new world to work with
        pQuery = pQuery.sub();

        // starting with a point... create a chain
        pQuery.fn.chain = function( len ){

            var target = 40;

            if ( len === undefined ) return this;
            if ( len <= 0 ){

                var c = new Shape();
                c.x = this.position().x;
                c.y = this.position().y;
                c.graphics.beginFill(Graphics.getRGB(255,233,233,1));
                c.graphics.drawCircle(0,0,4);
                this[0].data('view', c);

                var p1 = pQuery.Vector();
                var p2 = pQuery.Vector();
                var diff = pQuery.Vector();

                this.addClass('chain');
                this[0].removeClass('chain');

                return this.interact('afterInertia', function( dt, p, idx, pts ){

                    if( idx ){

                        var l;
                        var prev = pts[idx-1];
                        p1.clone( p.position() );
                        p2.clone( prev.position() );

                        l = diff.clone(p2).vsub(p1).norm();
                        diff.mult( (l - target)/(2.1*l) );
                        
                        // only correct if prev is not first point
                        if ( idx !== 1 ){
                            p2.vsub( diff );
                            prev.position( p2 );
                        }

                        p1.vadd( diff );
                        p.position( p1 );

                    }

                });
            }

            var pt = pQuery('<point>');
            var pos = this.position();
            var x = pos.x + Math.random()*5
            pt.position( x , pos.y ).velocity(0, 0);

            var c = new Shape();
            c.x = x;
            c.y = pos.y;
            c.graphics.beginFill(Graphics.getRGB(255,233,233,1));
            c.graphics.drawCircle(0,0,4);
            pt.data('view', c);
            
            return this.add( pt ).chain( len - 1 );
        };
    
        function Simulation( mediator, canvas ){

            if ( !( this instanceof Simulation ) ) return new Simulation( mediator, ctx );

            var self = this;
            this.ctx = canvas.getContext('2d');

            this.mediator = mediator;
            this.stage = new Stage( canvas );

            this.bounds = new Rectangle();
            this.bounds.width = canvas.width;
            this.bounds.height = canvas.height;

            this.initWorld();
            this.initBodies();

            // start the timer (in case it hasn't started already)
            pQuery.ticker.start();
        }

        Simulation.prototype = {

            initWorld: function(){

                var self = this
                    ,world
                    ;

                // cache the world
                // set bounds
                world = this.world = pQuery('world');

                world
                    .dimensions( this.bounds.width, this.bounds.height )
                    .on('step', function(){

                        self.updateViews();
                        self.stage.update();
                    })
                    // define some interactions
                    .interact('beforeAccel', '.chain', function( dt, obj ){

                        // earth gravity
                        obj.accelerate(0, 0.0005);

                    })
                    ;

                world.pause();

                // subscribe to the timer
                pQuery.ticker.subscribe(function(time, dt){

                    world.step(time);

                });

                // set timestep size
                world.timeStep( 16 );

            }

            ,initBodies: function(){

                var stage = this.stage;

                // create some spheres
                var chains = [];
                var numChains = 30;
                var dx = this.bounds.width/numChains;

                while(numChains--)
                    chains.push(
                        pQuery('<point>')
                            .position(numChains*dx+dx/2, 20)
                            .velocity(0, 0)
                            .chain(10)
                            .each(function(){

                                var c = this.data('view');
                                stage.addChild(c);
                            })
                            .appendTo(this.world)
                    );

                this.bodies = chains;
            }

            ,updateViews: function(){

                var bodies = this.bodies
                    ,self = this
                    ,obj
                    ,pos
                    ,view
                    ;

                for ( var i = 0, l = bodies.length; i < l; ++i ){
                    
                    // connect the dots
                    var last = null;

                    bodies[i].each(function(){

                        var link = this;
                        var pos = link.position();
                        var view = link.data('view');

                        if ( view ){

                            view.x = pos.x;
                            view.y = pos.y;

                            if (last){

                                last = view.globalToLocal(last.x, last.y);

                                view.graphics
                                    .clear()
                                    .beginStroke("rgba(255,255,255,1)")
                                    .moveTo(0, 0)
                                    .lineTo(last.x, last.y)
                                    .endStroke()
                                    .draw(self.ctx);
                            }
                        }

                        last = pos;

                    });
                }
            }

            ,start: function(){

                this.world.unpause();
            }

            ,stop: function(){

                this.world.pause();
            }
        };

        return Simulation;

    }
);