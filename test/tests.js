define(
	function(){

		function run(pQuery){

			var s1 = pQuery('<sphere>');
			var box = pQuery('<box>');
			var s2 = pQuery('<sphere>');
			var w = pQuery('world');

			test('World setup', function(){

				ok(pQuery('sphere').length === 0, 'No spheres yet');
				ok(pQuery('*').length === 0, 'Nothing in world');
				ok(window.pQuery === undefined, 'No global pQuery reference');
				
			});

			module('Adding elements');

			test('Add Elements', function(){

				s1.append(box.append(s2));

				deepEqual(s2[0].parent(), box[0], 'box holds second sphere');
				deepEqual(box[0].parent(), s1[0], 'first sphere holds box');

				w.append(s1);

			});

			module('Finding Elements');

			test('Selectors', function(){

				var expected = {

					'sphere': 2,

					'sphere sphere': 1,
					'sphere > sphere': 0,
					'> sphere': 1,
					'* sphere': 1,
					'* > sphere': 1,

					'sphere box': 1,
					'> sphere box': 1,
					'sphere > box': 1,
					'box > sphere': 1,
					'* box': 1,

					'sphere *': 2,
					'*': 3,

					'sphere, box': 3,
					'sphere, sphere': 2,
					'box, box': 1,

					'box world': 0

				};

				for ( var i in expected ){
					
					equal(pQuery(i).length, expected[i], i);
					equal(pQuery('world '+i).length, expected[i], 'world '+i);

				}

			});

			test('Selectors with context', function(){

				var expected = {

					'sphere': 1,

					'sphere sphere': 0,
					'sphere > sphere': 0,
					'> sphere': 0,
					'* sphere': 1,
					'* > sphere': 1,

					'box': 1,
					'> box': 1,
					'> sphere box': 0,
					'sphere > box': 0,
					'box > sphere': 1,
					'* box': 0,

					'sphere *': 0,
					'*': 2,

					'sphere, box': 2,
					'sphere, sphere': 1,
					'box, box': 1,

					'world box': 0,
					'world sphere': 0,
					'world world': 0,
					'world': 0

				};

				for ( var i in expected ){
					
					equal(s1.find(i).length, expected[i], 's1.find("'+i+'");');
					
				}

			});
		}

		return {
			run: run
		};
	}
);