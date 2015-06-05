var levelup = require('levelup');
var leveldown = require('leveldown');
var memdown = require('memdown');
var subLevel = require('level-sublevel');
var ttl = require('level-ttl');
var when = require('when');
var _ = require('lodash');
var cache;
var collections = [];

function getCollection(collection) {
    if (!collections[collection]) {
        var db = cache.sublevel(collection);
        collections[collection] = {
            get: function(key) {
                return when.promise(function(resolve, reject) {
                    if (key) {
                        db.get(key, function(err, value) {
                            if (err) {
                                reject(err);
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
                        .on('close', function() {
                            console.log('ut-cache read stream closed');
                        })
                        .on('end', function() {
                            resolve(data);
                        });
                    }
                });
            },
            set: function(key, value, ttl) {
                return when.promise(function(resolve, reject) {
                    db.put(key, value, function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(value);
                        }
                    });
                });
            },
            del: function(key) {
                return when.promise(function(resolve, reject) {
                    db.del(key, function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    });
                });
            }
        }
    };
    return collections[collection];
}

module.exports = {
    init: function(bus) {
        var config = _.defaults(bus.config.cache || {}, {
            'location': '/cache',
            'storage': 'memory',
            'encoding': 'json',
            'checkFrequency': 1000,
            'defaultTTL': 3600
        });
        if (config.storage === 'memory') {
            cache = subLevel(levelup(config.location, {
                db: memdown,
                valueEncoding: config.encoding
            }));
        } else if (config.storage === 'disk') {
            cache = subLevel(levelup(config.location, {
                db: leveldown,
                valueEncoding: config.encoding
            }));
        }
        ttl(cache, {
            checkFrequency: config.checkFrequency,
            defaultTTL: config.defaultTTL * 1000
        });
    },
    collection: function(collection) {
        return getCollection(collection);
    }
};
