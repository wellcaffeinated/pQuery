define(
    [
        './tools'
    ],
    function(
        Tools
    ){

        /*!
         * Based on work by Florian Bosh @pyalot http://codeflow.org
         * From microphysics.js
         * https://github.com/jeromeetienne/microphysics.js
         */

        function Class( obj, name ){

            var constructor = name? obj[name] : obj.__constructor__ || Tools.noop;

            if(obj.__extends__){

                var base = obj.__extends__.prototype;

            } else {

                var base = {};
            }

            constructor.prototype = Tools.extend({}, base, obj);
            return constructor;
        };


        return Class;
    }
);