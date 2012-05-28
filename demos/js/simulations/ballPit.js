define(
    [
        '../../../src/pquery'
    ], 
    function(
        pQuery
    ){
        // new world to work with
        pQuery = pQuery.sub();
    
        function Simulation( mediator, canvas ){

            if ( !( this instanceof Simulation ) ) return new Simulation( mediator, ctx );

            var self = this;

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
                    .interact('beforeAccel', '.gravity', function( dt, obj ){

                        // earth gravity
                        obj.accelerate(0, 0.0005);

                    })
                    .interact( pQuery.interactions.SphereCollide( 0.1 ), '.rigid' )
                    .interact( pQuery.interactions.ConstrainWithin( world, 0.3 ), '*' )
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

                // helper to create and return a circle in canvas
                function canvasCircle(x, y, r){

                    var c = new Shape();
                    c.x = x;
                    c.y = y;
                    c.graphics.beginFill(Graphics.getRGB(255,200,200,1));
                    c.graphics.drawCircle(0,0,r);
                    stage.addChild(c);

                    return c;
                }

                var spheres = pQuery(null);

                // create some spheres
                while(spheres.length < 100){

                    var x = Math.random() * (500-50) + 25
                        ,y = Math.random() * (500-50) + 25
                        ,r = Math.random() * 20 + 5
                        ;

                    var collides = false;
                    for(var i = 0, l = spheres.length; i < l; i++){
                            var other = spheres[i];
                            var pos = pQuery.Vector(x,y);
                            pos.vsub(other.position());
                            
                            if(pos.norm() < other.dimensions().radius + r){
                                    collides = true;
                                    break;
                            }
                    }

                    if(!collides){
                        spheres = spheres.add(
                            pQuery( '<sphere>' )
                                .data( 'view', canvasCircle(x,y,r) )
                                .dimensions( r )
                                .position( x, y )
                                .velocity( 0, 0 )
                                .addClass( 'gravity rigid' )
                        );
                    }
                }

                // other fun things
                // spheres.interact( pQuery.interactions.NewtonianGravity( 1 ) );
                // spheres.interact( pQuery.interactions.Drag( 1/10000 ) );

                // put spheres into world
                this.bodies = spheres.appendTo(this.world);
            }

            ,updateViews: function(){

                var bodies = this.bodies
                    ,obj
                    ,pos
                    ,view
                    ;

                for ( var i = 0, l = bodies.length; i < l; ++i ){
                    
                    obj = bodies[i];
                    view = obj.data('view');

                    if (view){

                        pos = obj.position();
                        view.x = pos.x;
                        view.y = pos.y;

                    }
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