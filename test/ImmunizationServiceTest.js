'use strict';

import '../app/js/service/service.module';
import 'angular-resource';

describe('Vaccine Service Unit Tests', () => {
    let $httpBackend, ImmunizationService;
    const URL = '/ws/rest/v1/immunizationapi/vaccineconfiguration';
    const ADMIN_URL = '/ws/rest/v1/immunizationapi/administeredvaccine';

    beforeEach(angular.mock.module('service.module'));
    beforeEach(() => {
        angular.mock.module({
            'Utils': { getOpenmrsContextPath: () => ''}
        });
    });
    beforeEach(inject($injector => {
        $httpBackend = $injector.get('$httpBackend');
        ImmunizationService = $injector.get('ImmunizationService');
    }));

    it('getVaccineConfigurations() Should make the correct rest call', () => {
        $httpBackend.expectGET(URL).respond({});
        ImmunizationService.getVaccineConfigurations();
        $httpBackend.flush();
    });

    it('postVaccineConfiguration() should post the newly created configuration to the backend', () => {
        let data = {
            name: 'Test Vaccine Config',
            description: 'for testing only',
            concept: 'uuid-of-the-concept',
            numberOfTimes: 2,
            intervals: [{
                timeUnit: "YEARS",
                timeValue: 5,
                rank1: 1,
                rank2: 2
            }]
        };
        $httpBackend.expectPOST(URL, data).respond({});
        ImmunizationService.postVaccineConfiguration(data);
        $httpBackend.flush();

    });

    it('retireVaccineConfiguration() should create the correct request to the backend', () => {
        let uuid = 'to-be-deleted-uuid';
        $httpBackend.expectDELETE(URL + '/' + uuid).respond(204);
        ImmunizationService.retireVaccineConfiguration(uuid);
        $httpBackend.flush();
    });

    it('getAdministeredVaccine() should issue a correct rest request', () => {
        let uuid = 'existing-administered-vaccine-uuid';
        $httpBackend.expectGET(ADMIN_URL + '/' + uuid + '?v=full').respond(200);
        ImmunizationService.getAdministeredVaccine(uuid);
        $httpBackend.flush();
    });

    it('getAdministeredVaccines() should issue a correct rest call', () => {
        let params = { patient: 'patient-on-server' };
        $httpBackend.expectGET(ADMIN_URL + '?patient=' + params.patient + '&v=full').respond(200);
        ImmunizationService.getAdministeredVaccines(params);
        $httpBackend.flush();
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});