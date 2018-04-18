'use strict';
import moment from 'moment';

let filtersModule = angular.module('filters.module', [])
    .filter('moment', momentDate);

function momentDate() {
    return function (momentInstance, format) {
        format = format || 'YYYY-MM-DD';

        if(momentInstance === null || momentInstance === undefined || momentInstance === '') return '';

        if(typeof momentInstance === 'string') momentInstance = moment(momentInstance);
        return momentInstance.format(format);
    }
}

export default filtersModule;