'use strict';

module.exports = {
    extends: 'lighthouse:default',

    passes: [{
        passName: 'defaultPass',
        gatherers: [
            'card-gatherer'
        ]
    }],

    audits: [
        'card-audit'
    ],

    categories: {
        ratp_pwa: {
            title: 'Ratp pwa metrics',
            description: 'Metrics for the ratp timetable site',
            auditRefs: [
                {id: 'card-audit', weight: 1}
            ]
        }
    }
};
