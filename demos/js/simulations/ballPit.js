/*!
 * This file is included as part of:
 * pQuery physics library v@VERSION
 * https://github.com/wellcaffeinated/pQuery
 * 
 * Copyright 2012, Jasper Palfree
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 * Date: @DATE
 * @license
 */
define(
    [
        '../../../src/pquery',
        'kinetic'
    ], 
    function(
        pQuery,
        Kinetic
    ){
        // new world to work with
        pQuery = pQuery.sub();
    
        function Simulation( mediator, data ){

            if ( !( this instanceof Simulation ) ) return new Simulation( mediator, ctx );

            var self = this;

            this.mediator = mediator;

            this.layer = data.layer;
            this.bounds = {

                width: data.layer.getContext().canvas.width,
                height: data.layer.getContext().canvas.height
            };
            this.group = data.group;

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
                        self.layer.draw();

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

                var self = this;
                var group = this.group;
                var spheres = pQuery(null);

                // create some spheres
                var shape = new Kinetic.Circle({
                    x: 10,
                    y: 10,
                    radius: 9,
                    fill: "red",
                    stroke: "black",
                    strokeWidth: 1
                });

                group.add(shape);

                shape.toImage({
                    // define the size of the new image object
                    width: 20,
                    height: 20,
                    callback: function(img) {
                        // cache the image as a Kinetic.Image shape
                        
                        while(spheres.length < 100){

                            var x = Math.random() * (500-50) + 25
                                ,y = Math.random() * (500-50) + 25
                                ,r = 10
                                ,image
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

                                image = new Kinetic.Image({
                                    image: img,
                                    x: x,
                                    y: y,
                                    offset: 10
                                });

                                group.add(image);

                                spheres = spheres.add(
                                    pQuery( '<sphere>' )
                                        .data( 'view', image )
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
                        self.bodies = spheres.appendTo(self.world);
                    }
                });

                shape.hide();

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
                        view.setX( pos.x );
                        view.setY( pos.y );

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