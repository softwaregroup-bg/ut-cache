var levelup = require('levelup');
var when = require('when');
var _ = require('lodash');
var cache = {};
var bus = {};

module.exports = {
    init: function() {
        cache = levelup('/memory', { db: require('memdown'), valueEncoding: 'json' });
    },
    get: function(key) {
        return when.promise(function(resolve, reject) {
            cache.get(key, function(err, value) {
                if (err) {
                    reject();
                } else {
                    resolve(value);
                }
            });
        });
    },
    set: function(key, value) {
        return when.promise(function(resolve, reject) {
            this.get(key, function(err, current) {
                if (!err) value = _.assign(current, value);
                cache.put(key, value, function (err) {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        }.bind(this));
    }
}