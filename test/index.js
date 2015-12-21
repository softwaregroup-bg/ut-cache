// test ttl
var Path = require('path');
var cache = require('..');
cache.init({
    config: {
        cache: {
            location: Path.join(__dirname, 'test.db'),
            defaultTTL: 3,
            checkFrequency: 1000
        }
    }
});

var x = cache.collection('x');
x.set('x', true).then(function(res) {
    console.log('Persisted (should be true): ' + res);
    setTimeout(function() {
        x.get('x').then(function(res) {
            console.log('Persisted (should be true): ' + res);
        });
    }, 1000);
    setTimeout(function() {
        x.get('x').then(function(res) {
            console.log('Persisted (should be null): ' + res);
        });
    }, 6000);
});
