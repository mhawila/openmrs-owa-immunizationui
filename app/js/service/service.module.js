'use strict';

let module = angular.module('service.module', [ 'ngResource' ])
    .factory('Utils', function($location) {
        return {
            getOpenmrsContextPath: () => {
                let path = $location.absUrl();
                let indexOfThirdSlash = path.indexOf('/',path.indexOf('/') + 2);
                return path.substring(indexOfThirdSlash, path.indexOf('/', indexOfThirdSlash + 1));
            }
        };
    })
    .factory('VaccineConfigurationResource', function($resource, Utils) {
        let path = Utils.getOpenmrsContextPath();
        return $resource(path + "/ws/rest/v1/immunizationapi/vaccineconfiguration/:uuid", {
            uuid: '@uuid'
        },{
            query: { method:'GET', isArray:false } // OpenMRS RESTWS returns { "results": [] }
        });
    })
    .factory('AdministeredVaccineResource', function($resource, Utils) {
        let path = Utils.getOpenmrsContextPath();
        return $resource(path + "/ws/rest/v1/immunizationapi/administeredvaccine/:uuid", {
            uuid: '@uuid'
        },{
            query: { method:'GET', isArray:false } // OpenMRS RESTWS returns { "results": [] }
        });
    })
    .factory('ImmunizationService', function(VaccineConfigurationResource, AdministeredVaccineResource) {
        return {
            getVaccineConfigurations: function(params) {
                return VaccineConfigurationResource.query(params).$promise.then(function(res) {
                    return res.results;
                });
            },
        }
    });

export default module;