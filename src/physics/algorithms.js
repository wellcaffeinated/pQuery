/*
 * pQuery physics library v@VERSION
 * https://github.com/wellcaffeinated/pQuery
 * 
 * Copyright 2012, Jasper Palfree
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
define(
    [
        '../util/tools',
        '../math/vector'
    ],
    function(
        Tools,
        Vector
    ){

        return {
            interactions: {

                // strength of gravity
                NewtonianGravity: function( strength ){

                    var i, l, other, pos, otherpos = new Vector(), lensq, g;

                    return {

                        beforeAccel: function( dt, obj, idx, list ){

                            for(i = idx+1, l = list.length; i < l; i++){
                                
                                pos = obj.position();
                                other = list[ i ];
                                otherpos.clone(other.position());
                                otherpos.vsub( pos );

                                lensq = otherpos.normSq();
                                g = strength/lensq;

                                obj.accelerate( otherpos.normalize().mult( g ) );
                                other.accelerate( otherpos.negate() );
                            }
                        }
                    };
                }

                ,Drag: function( strength ){

                    var v = new Vector(), l, x, y, z;

                    // keep it between 1 and 0
                    strength = Math.max(Math.min(strength, 1), 0);

                    return {

                        beforeAccel: function( dt, obj, idx, list ){

                            v.clone( obj.velocity() );

                            // decrease velocity instead of applying acceleration
                            v.mult( 1 - strength );

                            obj.velocity( v );
                        }
                    };
                }

                ,SphereCollide: function( friction ){

                    var len
                        ,target
                        ,diff = new Vector()
                        ,pos1 = new Vector()
                        ,pos2 = new Vector()
                        ,r
                        ,i
                        ,l
                        ,v1 = new Vector()
                        ,v2 = new Vector()
                        ,other
                        ,factor
                        ,fixed1
                        ,fixed2
                        ,preserveImpulse = false
                        ;

                    friction = Math.max(Math.min( friction , 1 ), 0);

                    function fn( dt, obj, idx, list ){

                        pos1.clone( obj.position() );
                        fixed1 = obj.attr('fixed');
                        r = obj.dimensions().radius;

                        // each other
                        for ( i = idx+1, l = list.length; i < l; i++ ){

                            other = list[i];
                            fixed2 = other.attr('fixed');

                            if (fixed1 && fixed2) continue;

                            diff.clone( pos2.clone( other.position() ) );
                            diff.vsub( pos1 );
                            
                            // sum of radii
                            target = r + other.dimensions().radius;
                            
                            if ( diff.x < target && diff.y < target && (len = diff.norm()) < target ){ 

                                factor = ( fixed1 || fixed2 ? 1 : 0.5 )*(len-target)/len;

                                if ( preserveImpulse ){

                                    v1.clone( obj.velocity() );
                                    v2.clone( other.velocity() );
                                }

                                // move the spheres away from each other
                                // by half the conflicting length
                                // ... if one is fixed... the full length
                                diff.mult(factor);

                                if (!fixed1){
                                    obj.position( pos1.vadd( diff ) );
                                }
                                
                                if (!fixed2){
                                    other.position( pos2.vsub( diff ) );
                                }
                                
                                if ( preserveImpulse ){

                                    diff.normalize();

                                    factor = v2.dot(diff) - v1.dot(diff);

                                    // if objects are moving away from each other or touching... then skip
                                    if ( factor >= 0 ) continue;

                                    // used to find new velocity in direction along intersection axis
                                    // with restitution coefficient handling
                                    // proj v2-v1 onto axis then multiply by coeff of restitution correction
                                    diff.mult( factor * (1 - 0.5*friction) );

                                    if ( fixed2 ){

                                        obj.velocity( v1.vadd( diff.mult(2) ) );
                                        continue;
                                    }

                                    if ( fixed1 ){

                                        other.velocity( v2.vsub( diff.mult(2) ) );
                                        continue;
                                    }

                                    v1.vadd( diff );
                                    v2.vsub( diff );

                                    obj.velocity( v1 );
                                    other.velocity( v2 );

                                    obj.collisionNotify( other );
                                    other.collisionNotify( obj );
                                }
                            }
                        }
                    }

                    return {

                        afterAccel: fn

                        ,afterInertia: function( dt, obj, idx, list ){

                            preserveImpulse = true;
                            fn( dt, obj, idx, list );
                            preserveImpulse = false;
                        }
                    };
                }

                ,ConstrainWithin: function( boundsOrParent, energyLoss ){

                    var pos = new Vector()
                        ,v = new Vector()
                        ,min
                        ,max = new Vector()
                        ,whd
                        ,upper
                        ,lower
                        ,count
                        ,fric
                        ,collide
                        ,preserveImpulse = false
                        ;

                    boundsOrParent = boundsOrParent.pquery? boundsOrParent[0] : boundsOrParent;

                    if ( typeof boundsOrParent.dimensions === 'function' ){

                        if ( typeof boundsOrParent.position === 'function' ){

                            min = boundsOrParent.position();
                        }

                        min = min || {x:0, y:0, z:0};
                        whd = boundsOrParent.dimensions();

                    } else if ( typeof boundsOrParent === 'object' ) {

                        min = boundsOrParent.min;
                        whd = boundsOrParent.max;

                    } else {

                        min = whd = {};
                    }

                    min.x = Tools.isNumericQuick( min.x )? min.x : -1/0;
                    min.y = Tools.isNumericQuick( min.y )? min.y : -1/0;
                    min.z = Tools.isNumericQuick( min.z )? min.z : -1/0;
                    
                    max.x = min.x + whd.x;
                    max.y = min.y + whd.y;
                    max.z = min.z + whd.z;

                    max.x = Tools.isNumericQuick( max.x )? max.x : 1/0;
                    max.y = Tools.isNumericQuick( max.y )? max.y : 1/0;
                    max.z = Tools.isNumericQuick( max.z )? max.z : 1/0;

                    function fn( dt, obj, idx, list, par ){

                        collide = false;

                        pos.clone( obj.position() );
                        whd = obj.dimensions();

                        if ( whd.radius ){

                            whd.x = whd.y = whd.z = whd.radius;

                        } else {

                            whd.x /= 2;
                            whd.y /= 2;
                            whd.z /= 2;
                        }

                        if ( preserveImpulse ){

                            v.clone( obj.velocity() );

                            if ( pos.x > (max.x - whd.x) || pos.x < (min.x + whd.x) ){

                                v.x = (energyLoss-1) * v.x;
                                collide = true;
                            }

                            if ( pos.y > (max.y - whd.y) || pos.y < (min.y + whd.y) ){

                                v.y = (energyLoss-1) * v.y;
                                collide = true;
                            }

                            if ( pos.z > (max.z - whd.z) || pos.z < (min.z + whd.z) ){

                                v.z = (energyLoss-1) * v.z;
                                collide = true;
                            }
                        }

                        pos.clamp({
                            x: min.x + whd.x,
                            y: min.y + whd.y,
                            z: min.z + whd.z
                        },{
                            x: max.x - whd.x,
                            y: max.y - whd.y,
                            z: max.z - whd.z
                        });

                        obj.position( pos );
                        
                        if ( preserveImpulse ){

                            obj.velocity( v );  
                        }

                        if ( collide ){
                            
                            obj.collisionNotify( boundsOrParent );

                            if ( boundsOrParent.collisionNotify )
                                boundsOrParent.collisionNotify( obj );
                        }
                    }

                    return {

                        afterAccel: fn 

                        ,afterInertia: function( dt, obj, idx, list, par ){

                            preserveImpulse = true;
                            fn( dt, obj, idx, list, par );
                            preserveImpulse = false;
                        }
                        
                    };
                }
            }
        };
    }
);