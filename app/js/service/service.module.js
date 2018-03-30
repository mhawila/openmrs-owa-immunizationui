'use strict';
// This import is mainly to make the tests work. (I have no idea why it does not work without this line even though,
// it works when deployed in production or dev build!)
import 'angular-resource';

let module;
module = angular.module('service.module', ['ngResource'])
    .factory('Utils', function ($location) {
        return {
            getOpenmrsContextPath: () => {
                return '/' + $location.absUrl().split('/')[3];
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
            }
        }
    });

export default module;