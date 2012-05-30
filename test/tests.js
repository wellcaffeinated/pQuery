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
	function(){

		function run(pQuery){

			var s1 = pQuery('<sphere>');
			var point = pQuery('<point>');
			var s2 = pQuery('<sphere>');
			var w = pQuery('world');

			s1.append(point.append(s2));

			test('World setup', function(){

				ok(pQuery('sphere').length === 0, 'No spheres yet');
				ok(pQuery('*').length === 0, 'Nothing in world');
				ok(window.pQuery === undefined, 'No global pQuery reference');
				
			});

			module('Adding elements');

			test('Add Elements', function(){

				deepEqual(s2[0].parent(), point[0], 'point holds second sphere');
				deepEqual(point[0].parent(), s1[0], 'first sphere holds point');

			});

			module('Finding Elements');

			test('Selectors', function(){

				w.append(s1);

				var expected = {

					'sphere': 2,

					'sphere sphere': 1,
					'sphere > sphere': 0,
					'> sphere': 1,
					'* sphere': 1,
					'* > sphere': 1,

					'sphere point': 1,
					'> sphere point': 1,
					'sphere > point': 1,
					'point > sphere': 1,
					'* point': 1,

					'sphere *': 2,
					'*': 3,

					'sphere, point': 3,
					'sphere, sphere': 2,
					'point, point': 1,

					'point world': 0

				};

				for ( var i in expected ){
					
					equal(pQuery(i).length, expected[i], i);
					equal(pQuery('world '+i).length, expected[i], 'world '+i);

				}

			});

			test('Selectors with context', function(){

				w.append(s1);

				var expected = {

					'sphere': 1,

					'sphere sphere': 0,
					'sphere > sphere': 0,
					'> sphere': 0,
					'* sphere': 1,
					'* > sphere': 1,

					'point': 1,
					'> point': 1,
					'> sphere point': 0,
					'sphere > point': 0,
					'point > sphere': 1,
					'* point': 0,

					'sphere *': 0,
					'*': 2,

					'sphere, point': 2,
					'sphere, sphere': 1,
					'point, point': 1,

					'world point': 0,
					'world sphere': 0,
					'world world': 0,
					'world': 0

				};

				for ( var i in expected ){
					
					equal(s1.find(i).length, expected[i], 's1.find("'+i+'");');
					
				}

			});


			module('Alternate World');

			var pQueryalt = pQuery.sub();
			var s1alt = pQueryalt('<sphere>');
			var pointalt = pQueryalt('<point>');
			var s2alt = pQueryalt('<sphere>');
			var walt = pQueryalt('world');

			s1alt.append(pointalt.append(s2alt));

			test('Selectors', function(){

				walt.append(s1alt);

				var expected = {

					'sphere': 2,

					'sphere sphere': 1,
					'sphere > sphere': 0,
					'> sphere': 1,
					'* sphere': 1,
					'* > sphere': 1,

					'sphere point': 1,
					'> sphere point': 1,
					'sphere > point': 1,
					'point > sphere': 1,
					'* point': 1,

					'sphere *': 2,
					'*': 3,

					'sphere, point': 3,
					'sphere, sphere': 2,
					'point, point': 1,

					'point world': 0

				};

				for ( var i in expected ){
					
					equal(pQueryalt(i).length, expected[i], i);
					equal(pQueryalt('world '+i).length, expected[i], 'world '+i);

				}

			});

			test('Selectors with context', function(){

				walt.append(s1alt);

				var expected = {

					'sphere': 1,

					'sphere sphere': 0,
					'sphere > sphere': 0,
					'> sphere': 0,
					'* sphere': 1,
					'* > sphere': 1,

					'point': 1,
					'> point': 1,
					'> sphere point': 0,
					'sphere > point': 0,
					'point > sphere': 1,
					'* point': 0,

					'sphere *': 0,
					'*': 2,

					'sphere, point': 2,
					'sphere, sphere': 1,
					'point, point': 1,

					'world point': 0,
					'world sphere': 0,
					'world world': 0,
					'world': 0

				};

				for ( var i in expected ){
					
					equal(s1alt.find(i).length, expected[i], 's1.find("'+i+'");');
					
				}

			});


			module('Attributes');

			test('Classes', function(){
				
				w.append(s1);

				pQuery('sphere').addClass('foo');
				ok(s1.hasClass('foo'), 'Class set on first sphere');
				ok(s2.hasClass('foo'), 'Class set on second sphere');
				ok(!point.hasClass('foo'), 'Class not set on point');

				s2.removeClass('foo').addClass('one two');
				ok(!s2.hasClass('foo'), 'Removed class');
				ok(s2.hasClass('one') && s2.hasClass('two'), 'Set multiple classes');

				s1.toggleClass('foo');
				ok(!s1.hasClass('foo'), 'Class toggled');

				s2.toggleClass(true);
				ok(s2.hasClass('one') && s2.hasClass('two'), 'Toggle true ok');
				s2.toggleClass(false);
				ok(!s2.hasClass('one') && !s2.hasClass('two'), 'Toggle false ok');
				s2.toggleClass();
				ok(s2.hasClass('one') && s2.hasClass('two'), 'Toggle all ok');

			});
		}

		return {
			run: run
		};
	}
);