'use strict';

let filtersModule = angular.module('filters.module', [])
    .filter('moment', momentDate);

function momentDate() {
    return function (momentInstance, format) {
        format = format || 'YYYY-MM-DD';

        return momentInstance.format(format);
    }
}