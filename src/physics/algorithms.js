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

        ,Friction: function( strength ){

            var p, l, x, y, z;

            // keep it between 1 and 0
            strength = Math.max(Math.min(strength, 1), 0);

            return {

                soft: function( delta, obj, idx, list ){

                    p = obj.position();

                    x = p.x - p.px;
                    y = p.y - p.py;
                    z = p.z - p.pz;
                    l = Math.sqrt(x*x+y*y+z*z);

                    // move previous position closer to slow it down proportionally
                    // to the strength
                    p.px += strength*x/l;
                    p.py += strength*y/l;
                    p.pz += strength*z/l;

                    obj.position( p );
                }
            };
        }
    }
});