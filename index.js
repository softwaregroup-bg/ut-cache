var levelup = require('levelup');
var subLevel = require('level-sublevel');
var ttl = require('level-ttl');
var defaults = require('lodash.defaults');
var path = require('path');
var cache;
var config;
var collections = [];

function getCollection(collection) {
    if (!collections[collection]) {
        var db = ttl(cache.sublevel(collection), {
            checkFrequency: config.checkFrequency,
            defaultTTL: config.defaultTTL * 1000,
            sub: cache.sublevel('__sub__' + collection)
        });
        collections[collection] = {
            get: function(key) {
                return new Promise(function(resolve, reject) {
                    if (key) {
                        db.get(key, function(err, value) {
                            if (err) {
                                if (err.notFound) {
                                    resolve(null);
                                } else {
                                    reject(err);
                                }
                            } else {
                                resolve(value);
                            }
                        });
                    } else { // get all records
                        var data = [];
                        db.createReadStream()
                        .on('data', function(record) {
                            data.push({key: record.key, value: record.value});
                        })
                        .on('error', function(err) {
                            reject(err);
                        })
                        .on('end', function() {
                            resolve(data);
                        });
                    }
                });
            },
            set: function(key, value, ttl) {
                return new Promise(function(resolve, reject) {
                    db.put(key, value, {ttl: ((ttl || config.defaultTTL) * 1000)}, function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(value);
                        }
                    });
                });
            },
            del: function(key) {
                return new Promise(function(resolve, reject) {
                    db.del(key, function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    });
                });
            }
        };
    }
    return collections[collection];
}

module.exports = {
    init: function(bus) {
        config = defaults(
            {
                'location': path.join(bus.config.workDir || '', 'ut-cache')
            },
            bus.config.cache || {},
            {
                'storage': 'memory',
                'encoding': 'json',
                'checkFrequency': 1000,
                'defaultTTL': 3600
            }
        );
        if (config.storage === 'memory') {
            cache = subLevel(levelup(config.location, {
                db: require('memdown'),
                valueEncoding: config.encoding
            }));
        } else if (config.storage === 'disk') {
            cache = subLevel(levelup(config.location, {
                db: require('leveldown'),
                valueEncoding: config.encoding
            }));
        }
    },
    collection: function(collection) {
        return getCollection(collection);
    }
};
