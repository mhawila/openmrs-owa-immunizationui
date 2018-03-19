import angular from 'angular';
import uiRouter from 'angular-ui-router';
import '../service/service.module';
import breadcrumbsComponent from './components/breadcrumbs.component.js';
import breadcrumbsPatientCreateComponent from './components/breadcrumbsPatientCreate.component';
import translateComponent from './components/translate.component.js';
import headerComponent from './components/header.component.js';
import vaccineConfigurationManagement from './components/vaccine-configuration-management.component.js';
import 'openmrs-contrib-uicommons';

let homeModule = angular.module('home', [ uiRouter, 'openmrs-contrib-uicommons', 'service.module'])
    .config(($stateProvider, $urlRouterProvider) => {
        "ngInject";
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('home', {
            url: '/',
            template: require('./home.html')
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
    .component('breadcrumbsPatientCreateComponent', breadcrumbsPatientCreateComponent)
    .component('translateComponent', translateComponent)
    .component('headerComponent', headerComponent)
    .component('vaccineConfigurationManagement', vaccineConfigurationManagement);

export default homeModule;
