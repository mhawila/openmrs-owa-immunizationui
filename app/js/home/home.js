import angular from 'angular';
import uiRouter from 'angular-ui-router';
import '../service/service.module';
import breadcrumbsComponent from './components/breadcrumbs.component.js';
import breadcrumbsVcCreateComponent from './components/breadcrumbsVCCreate.component';
import translateComponent from './components/translate.component.js';
import headerComponent from './components/header.component.js';
import vaccineConfigurationManagement from './components/vaccine-configuration-management.component.js';
import createVaccineConfiguration from './components/create-vaccine-configuration.component'
import 'openmrs-contrib-uicommons';

let homeModule = angular.module('home', [ uiRouter, 'openmrs-contrib-uicommons',
    'openmrs-contrib-uicommons.concept-autoComplete', 'service.module'])
    .config(($stateProvider, $urlRouterProvider) => {
        "ngInject";
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('home', {
            url: '/',
            template: '<vaccine-configuration-management></vaccine-configuration-management>'
        })

        .state('createVaccineConfiguration', {
            url: '/vaccineconfiguration/create',
            template: '<create-vaccine-configuration></create-vaccine-configuration>'
        });
    })
    .config(['$qProvider', function ($qProvider) {
      $qProvider.errorOnUnhandledRejections(false);
    }])

    // To prevent adding Hash bangs(#!/) instead of simple hash(#/) in Angular >1.5

    .config(['$locationProvider', function($locationProvider) {
      $locationProvider.hashPrefix('');
    }])

    .component('breadcrumbsComponent', breadcrumbsComponent)
    .component('breadcrumbsVcCreateComponent', breadcrumbsVcCreateComponent)
    .component('translateComponent', translateComponent)
    .component('headerComponent', headerComponent)
    .component('vaccineConfigurationManagement', vaccineConfigurationManagement)
    .component('createVaccineConfiguration', createVaccineConfiguration);

export default homeModule;
