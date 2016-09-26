var util = require('util');
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN;

module.exports = function(bus) {
    function BusDown(location) {
        if (!(this instanceof BusDown)) {
            return new BusDown(location);
        }
        this.busput = bus.importMethod(location + '.put');
        this.busget = bus.importMethod(location + '.get');
        this.busdel = bus.importMethod(location + '.del');
        this.busbatch = bus.importMethod(location + '.batch');
        AbstractLevelDOWN.call(this, location);
    }

    util.inherits(BusDown, AbstractLevelDOWN);

    BusDown.prototype._put = function busPut(key, value, options, callback) {
        this.busput({key, value, options})
            .then(function(res) { callback(null, res); })
            .catch(function(err) { callback(err); });
    };

    BusDown.prototype._get = function busGet(key, options, callback) {
        this.busget({key, options})
            .then(function(res) {
                callback(null, res);
            })
            .catch(function(err) { callback(err); });
    };

    BusDown.prototype._del = function busDel(key, options, callback) {
        this.busdel({key, options})
            .then(function(res) { callback(null, res); })
            .catch(function(err) { callback(err); });
    };

    BusDown.prototype._batch = function busPut(operations, options, callback) {
        this.busbatch({operations, options})
            .then(function(res) { callback(null, res); })
            .catch(function(err) { callback(err); });
    };

    return BusDown;
};
