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

        // starting with a point... create a chain
        pQuery.fn.chain = function( len ){

            var target = 40;

            if ( len === undefined ) return this;
            if ( len <= 0 ){

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

            return this.add( pt ).chain( len - 1 );
        };
    
        function Simulation( mediator, data ){

            if ( !( this instanceof Simulation ) ) return new Simulation( mediator, ctx );

            var self = this;

            this.mediator = mediator;
            this.layer = data.layer;
            this.group = new Kinetic.Group();
            this.layer.add(this.group);

            this.bounds = {

                width: data.layer.getContext().canvas.width,
                height: data.layer.getContext().canvas.height
            };

            this.initWorld();
            this.initBodies();
            this.layer.draw();

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

                var group = this.group;

                // create some spheres
                var chains = [];
                var numChains = 20;
                var dx = this.bounds.width/numChains;
                var view;
                var chain;
                
                while(numChains--){

                    var points = [];

                    chains.push(
                        chain = pQuery('<point>')
                            .position(numChains*dx+dx/2, 20)
                            .velocity(0, 0)
                            .chain(10)
                            .each(function(){
                                points.push(this.position());
                            })
                            .appendTo(this.world)
                    );

                    view = new Kinetic.Line({
                        x: 0,
                        y: 0,
                        stroke: 'white',
                        strokeWidth: 1,
                        lineCap: 'round',
                        lineJoin: 'round',
                        points: points
                    });
                    
                    chain.data('view', view);
                    group.add( view );
                }

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
                    var points = []
                        ,view = bodies[i].data('view')
                        ;

                    bodies[i].each(function(){

                        var link = this;
                        var pos = link.position();
                        points.push(pos);

                    });

                    if (view){

                        view.setPoints(points);
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