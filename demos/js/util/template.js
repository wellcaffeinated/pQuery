define(function(){
	
	/**
	 * Very simple find/replace template.
	 *
	 * Optional filter function that is used on tags with three curlies. Ex: `{{{this_param_will_be_filtered}}}`
	 * 
	 * @function {mixin} Application.template
	 * @param {string} t templateable string
	 * @param {object} d data object
	 * @... {string} yourKey containing value to replace
	 * @param {function(value)} filter a filter function that is passed members of `d` that are templated by triple curlys
	 * @return {string} string with templates filled
	 * @author [Jasper Palfree](http://wellcaffeinated.net)
	 * @license [GPLv3](http://www.gnu.org/licenses/)
	 * @example
	 * This will return the text: `this is a template!`
	 *
	 *  #!javascript
	 *  template("this is a {{what}}", {what: "template!"});
	 *  
	 * @example
	 * This will return the text: `this is a template!`
	 *
	 *  #!javascript
	 *  template("this is a {{nested.what}}", {nested: {what:'template!'} });
	 */
	function template(t, d, filter){
	    var data = d;
	    var ret = t;
	 
	    var segments = ret.match(/\{?\{\{[a-zA-Z$_][a-zA-Z0-9_.$]*\}\}\}?/g);
	    for(var x=0, len = segments.length; x < len; x++){
	                    var tags = segments[x].replace(/[\{\}]*/g,'').split('.');
	        var id = tags.shift();
	                    var repl = (tags.length > 0)? arguments.callee('{{'+tags.join('.')+'}}',data[id],filter) : ''+data[id];
	        if(segments[x].match(/^\{\{\{/) && typeof filter === 'function'){
	            repl = filter(repl);
	        }
	        ret = ret.replace(segments[x], repl);
	    }
	 
	    return ret;
	};

	return template;
})