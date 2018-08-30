'use strict';

const Audit = require('lighthouse').Audit;

const MAX_CARD_TIME = 2000;

class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'card-audit',
            title: 'Schedule loaded',
            failureTitle: 'Schedule slow to load',
            description: 'Schedule card initialized and ready',

            requiredArtifacts: ['TimeToCard']
        };
    }

    static audit(artifacts) {
        const loadedTime = artifacts.TimeToCard;

        const belowThreshold = loadedTime <= MAX_CARD_TIME;

        return {
            rawValue: loadedTime,
            score: Number(belowThreshold)
        };
    }
}

module.exports = LoadAudit;
