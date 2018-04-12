import template from '../view-vaccine-configuration.html';

let viewVaccineConfigurationComponent = {
    restrict: 'E',
    bindings: {},
    controller: Controller,
    controllerAs: 'vm',
    template: template
};

Controller.$inject = ['ImmunizationService', 'Utils', '$state', '$stateParams'];

function Controller(ImmunizationService, Utils, $state, $stateParams) {
    let vm = this;

    vm.errors = [];

    // Do work
    vm.times = Utils.getTimes();

    vm.units = Utils.getTimeIntervalUnits();

    let numberMaps = Utils.getOrdinalMap();

    vm.editConfiguration = function() {
        $state.go('editVaccineConfiguration', {
            vaccineConfigurationUuid: vm.referenceConfiguration.uuid,
            vaccineConfiguration: vm.referenceConfiguration
        });
    };

    if($stateParams.vaccineConfiguration && typeof $stateParams.vaccineConfiguration === 'object') {
         __copyAndMassageConfigurationForView($stateParams.vaccineConfiguration);
    }
    else {
        // We will have to fetch or throw error.
        if(angular.isUndefined($stateParams.vaccineConfigurationUuid)) {
            throw new Error('Cannot instantiate component without a vaccine configuration to view.');
        }

        ImmunizationService.getVaccineConfiguration($stateParams.vaccineConfigurationUuid).then(vaccineConfiguration => {
            vm.errors = [];
             __copyAndMassageConfigurationForView(vaccineConfiguration);
        }).catch(err => {
            vm.errors.push(err);
            console.log(err);
        });
    }

    function __copyAndMassageConfigurationForView(vaccineConfiguration) {
        vm.referenceConfiguration = vaccineConfiguration;
        vm.viewModelConfiguration = angular.copy(vaccineConfiguration);
        let numberOfTimes = vm.times.find(time => time.value === vaccineConfiguration.numberOfTimes);
        vm.viewModelConfiguration.numberOfTimes = numberOfTimes;

        if(Array.isArray(vm.viewModelConfiguration.intervals) && vm.viewModelConfiguration.intervals.length > 0) {
            vm.viewModelConfiguration.intervals.forEach(interval => {
                interval.from = numberMaps[interval.rank1];
                interval.to = numberMaps[interval.rank2];
            });
        }
    }
    
}

export default viewVaccineConfigurationComponent;
