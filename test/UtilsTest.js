'use strict';

import '../app/js/service/service.module';

describe('Utils Unit Tests', () => {
    let $httpBackend, Utils, VACCINE_GLOBAL_PROPERTIES;
    const URL = '/ws/rest/v1/immunizationapi/globalproperty';

    beforeEach(angular.mock.module('service.module'));

    beforeEach(inject($injector => {
        $httpBackend = $injector.get('$httpBackend');
        Utils = $injector.get('Utils');
        VACCINE_GLOBAL_PROPERTIES = $injector.get('VACCINE_GLOBAL_PROPERTIES');
    }));

    it('getConceptSet() Should make the correct rest call', () => {
        let expectedUrl = URL + '?property=' + VACCINE_GLOBAL_PROPERTIES.conceptSet;
        $httpBackend.expectGET(expectedUrl).respond({});
        Utils.getVaccineConceptSet();
        $httpBackend.flush();
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});