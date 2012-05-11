define({
    
    interactions: {

        // strength of gravity
        NewtonianGravity: function( strength ){

            var i, l, other, pos, otherpos, x, y, z, lensq, len, g;

            return {

                soft: function( delta, obj, idx, list ){

                    for(i = idx+1, l = list.length; i < l; i++){
                        
                        pos = obj.position();
                        other = list[ i ];
                        otherpos = other.position();
                        x = otherpos.x - pos.x;
                        y = otherpos.y - pos.y;
                        z = otherpos.z - pos.z;
                        lensq = x*x + y*y + z*z;
                        len = Math.sqrt(lensq);
                        g = strength/(lensq*len);

                        obj.accelerate( x=x*g, y=y*g, z=z*g );
                        other.accelerate( -x, -y, -z );
                    }
                }
            };
        }

        // TODO: fix
        ,Friction: function( strength ){

            var v, f;

            strength = Math.tan(strength*Math.PI/4);

            return {

                soft: function( delta, obj, idx, list ){

                    v = obj.velocity();
                    f = strength/Math.sqrt( v.x*v.x + v.y*v.y + v.z*v.z );
                    
                    // normalize to get direction
                    // apply constant force in opposite direction
                    obj.accelerate( -v.x*f, -v.y*f, -v.z*f );
                }
            };
        }
    }
});