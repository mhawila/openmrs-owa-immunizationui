'use strict';

import '../app/js/home/filters/filters.module';
import moment from 'moment';

describe('Moment Date Filter Unit Tests', () => {
    let momentFilter;

    beforeEach(angular.mock.module('filters.module'));

    beforeEach(inject($injector => {
        momentFilter = $injector.get('momentFilter');
    }));

    it('should return the correct date string', () => {
        let expected = '2018-04-20';
        let momentDate = moment(expected);
        expect(momentFilter(momentDate)).toEqual(expected);
        expect(momentFilter(momentDate, 'dddd MMM Do YY')).toEqual('Friday Apr 20th 18');
    });
});