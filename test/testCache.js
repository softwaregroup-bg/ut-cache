/* eslint no-console:0 */
var cache = require('..');
cache.init({
    config: {
        cache: {
            location: 'test.db',
            storage: 'memory',
            defaultTTL: 1,
            checkFrequency: 100
        }
    }
});

var x = cache.collection('x');
x.set('x', true).then(function(res) {
    console.log('Persisted should be true: ' + res);
    setTimeout(function() {
        x.get('x').then(function(res) {
            console.log('Persisted should be true after 100 ms: ' + res);
            if (!(res === true)) {
                throw new Error('Failed');
            }
        }).done();
    }, 100);
    setTimeout(function() {
        x.get('x').then(function(res) {
            console.log('Persisted should be null after 1100 ms: ' + res);
            if (!(res === null)) {
                throw new Error('Failed');
            }
        }).done();
    }, 1100);
});
