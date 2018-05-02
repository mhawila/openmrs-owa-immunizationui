'use strict';

let module = angular.module('service.module', ['ngResource'])
    .constant('VACCINE_GLOBAL_PROPERTIES', {
        conceptSet: 'immunizationapi.vaccine.conceptSet',
        vaccineDateConcept: 'immunizationapi.vaccine.dateConcept',
    })
    .factory('Utils', function ($location, $resource, VACCINE_GLOBAL_PROPERTIES) {
        const contextPath = '/' + $location.absUrl().split('/')[3];
        return {
            getOpenmrsContextPath: () => {
                return contextPath;
            },

            getTimes: () => {
                return [{
                    name: "Once",
                    value: 1
                }, {
                    name: "Twice",
                    value: 2
                }, {
                    name: "Thrice",
                    value: 3
                }, {
                    name: "Four Times",
                    value: 4
                }, {
                    name: "Five Times",
                    value: 5
                }, {
                    name: "Six Times",
                    value: 6
                }];
            },

            getTimeIntervalUnits: () => {
                return ['years', 'months', 'weeks', 'days'];
            },

            getOrdinalMap: () => {
                return {
                    1: 'first',
                    2: 'second',
                    3: 'third',
                    4: 'fourth',
                    5: 'fifth',
                    6: 'sixth'
                };
            },

            getVaccineConceptSet: () => {
                // for empty context path
                let basePath = contextPath === '/' ? '' : contextPath;
                return $resource(basePath + '/ws/rest/v1/immunizationapi/globalproperty', {
                    property: VACCINE_GLOBAL_PROPERTIES.conceptSet
                }).get().$promise;
            },

            getVaccineDateConcept: () => {
                // for empty context path
                let basePath = contextPath === '/' ? '' : contextPath;
                return $resource(basePath + '/ws/rest/v1/immunizationapi/globalproperty', {
                    property: VACCINE_GLOBAL_PROPERTIES.vaccineDateConcept,
                }).get().$promise;
            }
        };
    })
    .factory('VaccineConfigurationResource', function ($resource, Utils) {
        let path = Utils.getOpenmrsContextPath();
        return $resource(path + "/ws/rest/v1/immunizationapi/vaccineconfiguration/:uuid", {
            uuid: '@uuid'
        }, {
            query: {method: 'GET', isArray: false} // OpenMRS RESTWS returns { "results": [] }
        });
    })
    .factory('AdministeredVaccineResource', function ($resource, Utils) {
        let path = Utils.getOpenmrsContextPath();
        return $resource(path + "/ws/rest/v1/immunizationapi/administeredvaccine/:uuid", {
            uuid: '@uuid'
        }, {
            query: {method: 'GET', isArray: false} // OpenMRS RESTWS returns { "results": [] }
        });
    })
    .factory('ImmunizationService', function (VaccineConfigurationResource, AdministeredVaccineResource) {
        return {
            getVaccineConfigurations: function (params) {
                return VaccineConfigurationResource.query(params).$promise.then(function (res) {
                    return res.results;
                });
            },

            getVaccineConfiguration: (uuid, params) => {
                if(angular.isUndefined(params)) params = { v: 'full' };
                params = Object.assign(params, { uuid: uuid});
                return VaccineConfigurationResource.query(params).$promise;
            },

            postVaccineConfiguration: function (vaccineConfiguration) {
                return VaccineConfigurationResource.save(vaccineConfiguration).$promise;
            },

            updateVaccineConfiguration: (uuid, vaccineConfiguration, params) => {
                let typeError = new TypeError('Pass the correct arguments');
                if(angular.isUndefined(uuid) || typeof uuid !== 'string') {
                    return Promise.reject(typeError);
                }
                if(angular.isUndefined(vaccineConfiguration) || typeof vaccineConfiguration !== 'object') {
                    return Promise.reject(typeError)
                }
                if(angular.isDefined(params)) {
                    params.uuid = uuid;
                }
                else {
                    params = { uuid: uuid };
                }
                return VaccineConfigurationResource.save(params, vaccineConfiguration).$promise;
            },

            retireVaccineConfiguration: (uuid) => {
                return VaccineConfigurationResource.delete({uuid: uuid}).$promise;
            },

            getAdministeredVaccine: (uuid, params) => {
                if(uuid === undefined || uuid === null || typeof uuid !== 'string') {
                    return Promise.reject(new Error('uuid must be passed for this method'));
                }
                if(angular.isUndefined(params)) params = { v: 'full' };
                if(angular.isUndefined(params.v)) params.v = 'full';
                params = Object.assign(params, { uuid: uuid});
                return AdministeredVaccineResource.query(params).$promise;
            },

            getAdministeredVaccines: (params) => {
                if(angular.isUndefined(params)) params = { v: 'full' };
                if(angular.isUndefined(params.v)) params.v = 'full';

                return AdministeredVaccineResource.query(params).$promise.then(response => {
                    if(response.results) {
                        return response.results;
                    }
                    else {
                        return response;
                    }
                });
            },

            postAdministeredVaccine: (payload) => {
                return AdministeredVaccineResource.save(payload).$promise;
            }
        }
    });

export default module;