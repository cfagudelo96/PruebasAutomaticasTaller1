'use strict';

const Gatherer = require('lighthouse').Gatherer;

class TimeToApi extends Gatherer {
    afterPass(options) {
        const driver = options.driver;
        return driver.evaluateAsync('window.apiLoadTime')
            .then(apiLoadTime => {
                if (!apiLoadTime) {
                    throw new Error('Unable to find api load metrics in page');
                }
                return apiLoadTime;
            });
    }
}

module.exports = TimeToApi;
