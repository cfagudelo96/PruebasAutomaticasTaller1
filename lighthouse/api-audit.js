'use strict';

const Audit = require('lighthouse').Audit;

const MAX_API_TIME = 3000;

class ApiLoadAudit extends Audit {
    static get meta() {
        return {
            id: 'api-audit',
            title: 'Schedule loaded',
            failureTitle: 'Schedule slow to load',
            description: 'Schedule api initialized and ready',

            requiredArtifacts: ['TimeToApi']
        };
    }

    static audit(artifacts) {
        const loadedTime = artifacts.TimeToApi;

        const belowThreshold = loadedTime <= MAX_API_TIME;

        return {
            rawValue: loadedTime,
            score: belowThreshold
        };
    }
}

module.exports = ApiLoadAudit;
