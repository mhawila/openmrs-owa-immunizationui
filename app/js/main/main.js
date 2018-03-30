import angular from 'angular';
import uiRouter from 'angular-ui-router';
import mainComponent from './main.component.js';
import Home from '../home/home';
import '@openmrs/openmrs-contrib-uicommons';

let ImmunizationuiModule = angular.module('Immunizationui', [ uiRouter, Home.name, 'openmrs-contrib-uicommons'
    ])
    .component('main', mainComponent);

export default ImmunizationuiModule;
