'use strict';

import '../app/js/service/service.module';

describe('Vaccine Service Unit Tests', () => {
    let $httpBackend, ImmunizationService;
    const baseUrl = 'http://testing.test/';

    beforeEach(angular.mock.module('service.module'));

    beforeEach(inject($injector => {
        $httpBackend = $injector.get('$httpBackend');
        ImmunizationService = $injector.get('ImmunizationService');
    }));

    it('getVaccineConfigurations() Should make the correct rest call', () => {
        $httpBackend.whenGET('/ws/rest/v1/immunizationapi/vaccineconfiguration').respond({});
        $httpBackend.expectGET('/ws/rest/v1/immunizationapi/vaccineconfiguration');
        ImmunizationService.getVaccineConfigurations();
        $httpBackend.flush();
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
})