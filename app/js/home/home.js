import angular from 'angular';
import uiRouter from 'angular-ui-router';
import '../service/service.module';
import breadcrumbsComponent from './components/breadcrumbs.component.js';
import breadcrumbsVcCreateComponent from './components/breadcrumbsVCCreate.component';
import breadcrumbsVcViewComponent from './components/breadcrumbsVCView.component';
import breadcrumbsVcManageComponent from './components/breadcrumbsVcManage.component';
import breadcrumbsVcEditComponent from './components/breadcrumbsVCEdit.component';
import translateComponent from './components/translate.component.js';
import headerComponent from './components/header.component.js';
import manageVaccineConfiguration from './components/manage-vaccine-configuration.component.js';
import createVaccineConfiguration from './components/create-vaccine-configuration.component';
import editVaccineConfiguration from './components/edit-vaccine-configuration.component';
import viewVaccineConfiguration from './components/view-vaccine-configuration.component';
import '@openmrs/openmrs-contrib-uicommons';
import 'angular-ui-bootstrap';

let homeModule = angular.module('home', [ uiRouter, 'openmrs-contrib-uicommons',
    'openmrs-contrib-uicommons.concept-autoComplete', 'ui.bootstrap', 'service.module'])
    .config(($stateProvider, $urlRouterProvider, $compileProvider) => {
        "ngInject";
        $compileProvider.preAssignBindingsEnabled(true);
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('home', {
            url: '/',
            template: '<manage-vaccine-configuration></manage-vaccine-configuration>'
        })

        .state('createVaccineConfiguration', {
            url: '/vaccineconfiguration/create',
            template: '<create-vaccine-configuration></create-vaccine-configuration>'
        })

        .state('viewVaccineConfiguration', {
            url: '/vaccineconfiguration/view/:vaccineConfigurationUuid',
            params: {
                vaccineConfiguration: null
            },
            template: '<view-vaccine-configuration></view-vaccine-configuration>'
        })

        .state('editVaccineConfiguration', {
            url: '/vaccineconfiguration/edit/:vaccineConfigurationUuid',
            params: {
                vaccineConfiguration: null,
            },
            template: '<edit-vaccine-configuration></edit-vaccine-configuration>',
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
    .component('breadcrumbsVcViewComponent', breadcrumbsVcViewComponent)
    .component('breadcrumbsVcEditComponent', breadcrumbsVcEditComponent)
    .component('breadcrumbsVcManageComponent', breadcrumbsVcManageComponent)
    .component('translateComponent', translateComponent)
    .component('headerComponent', headerComponent)
    .component('manageVaccineConfiguration', manageVaccineConfiguration)
    .component('createVaccineConfiguration', createVaccineConfiguration)
    .component('viewVaccineConfiguration', viewVaccineConfiguration)
    .component('editVaccineConfiguration', editVaccineConfiguration);

export default homeModule;
