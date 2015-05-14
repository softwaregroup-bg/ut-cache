var levelup = require('levelup');
var ttl = require('level-ttl');
var when = require('when');
var cache = {};
var bus = {};

module.exports = {
    init: function(c) {
        var config = c || {
            connectionString: '/memory',
            storage: 'memdown',
            'encoding': 'json',
            'checkFrequency': 1000,
            'defaultTTL': 3600
        };
        if (config.storage == 'memdown') {
            cache = levelup(config.connectionString, {
                db: require('memdown'),
                valueEncoding: config.encoding
            });
        } else {
            // TODO Error handling + Other cache storages
        }
        ttl(cache, {
            checkFrequency: config.checkFrequency,
            defaultTTL: config.defaultTTL * 1000
        });
    },
    get: function(key) {
        return when.promise(function(resolve, reject) {
            cache.get(key, function(err, value) {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    },
    set: function(key, value, ttl) {
        return when.promise(function(resolve, reject) {
            cache.put(key, value, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        }.bind(this));
    }
}