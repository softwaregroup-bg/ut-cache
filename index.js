module.exports = () => function utCache() {
    return {
        adapter: () => [
            function cache() {
                return class cache extends require('ut-port-cache')(...arguments) {};
            }
        ]
    };
};
