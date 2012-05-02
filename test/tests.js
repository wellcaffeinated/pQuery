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
				console.log(undefined)
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

				equal(pQuery('sphere').length, 2, 'sphere');

				equal(pQuery('sphere sphere').length, 1, 'sphere sphere');
				equal(pQuery('sphere > sphere').length, 0, 'sphere > sphere');
				equal(pQuery('> sphere').length, 1, '> sphere');
				equal(pQuery('* sphere').length, 1, '* sphere');

				equal(pQuery('sphere box').length, 1, 'sphere box');
				equal(pQuery('> sphere box').length, 1, '> sphere box');
				equal(pQuery('sphere > box').length, 1, 'sphere > box');
				equal(pQuery('box > sphere').length, 1, 'box > sphere');
				equal(pQuery('* box').length, 1, '* box');

				equal(pQuery('sphere *').length, 2, 'sphere *');
				equal(pQuery('*').length, 3, '*');

				equal(pQuery('sphere, box').length, 3, 'sphere, box');
				equal(pQuery('sphere, sphere').length, 2, 'sphere, sphere');
				equal(pQuery('box, box').length, 1, 'box, box');

			});
		}

		return {
			run: run
		};
	}
);