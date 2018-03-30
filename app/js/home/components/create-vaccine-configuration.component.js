import template from '../create-vaccine-configuration.html';

let createVaccineConfigurationComponent = {
    restrict: 'E',
    bindings: {},
    controller: Controller,
    controllerAs: 'vm',
    template: template
};

Controller.$inject = ['ImmunizationService', 'Utils', '$state'];

function Controller(ImmunizationService, Utils, $state) {
    let vm = this;
    vm.newConfiguration = {};
    vm.saveCancelButtonsDisabled = false;
    vm.required = true; //if truthy, input box will be required
    vm.isConceptCorrect;	//flag, if current query matches any concept name
    vm.updateConcept = updateConcept;
    vm.updateIntervalsSection = updateIntervalsSection;
    vm.saveConfiguration = saveConfiguration;

    //concept is object with property "display", which is passed to component at activation (make it empty if there has to be no initial state)
    vm.newConfiguration.concept = {
        display: ''
    };

    vm.times = Utils.getTimes();

    vm.units = Utils.getTimeIntervalUnits();

    vm.numberMaps = Utils.getOrdinalMap();

    function updateIntervalsSection() {
        vm.intervalBlocks = [];
        delete vm.newConfiguration.intervals;
        if(vm.newConfiguration.numberOfTimes.value > 1) {
            // Add the intervals array in the new configuration
            vm.newConfiguration.intervals = [];
            for(let i = 1; i < vm.newConfiguration.numberOfTimes.value; i++) {
                vm.newConfiguration.intervals[i-1] = {
                    rank1: i,
                    rank2: i+1
                };
                vm.intervalBlocks.push({
                    from: vm.numberMaps[i],
                    to: vm.numberMaps[i+1]
                });
            }
        }
    }

    //function, which will be invoked at any change of component model
    function updateConcept(isCorrect, concept) {
        vm.isConceptCorrect = isCorrect;
        vm.newConfiguration.concept = concept;
    };

    function saveConfiguration() {
        // Busy
        vm.saveCancelButtonsDisabled = true;
        let payload = __createPayload(vm.newConfiguration);
        ImmunizationService.postVaccineConfiguration(payload).then(response => {
            vm.saveCancelButtonsDisabled = false;
            console.log('data posted with response', response);
            $state.go('home');
        }).catch(err => {
            vm.saveCancelButtonsDisabled = false;
            console.log('An error occured', err);
        });
    }

    function __createPayload(newConfigurationData) {
        return {
            name: newConfigurationData.name,
            description: newConfigurationData.description,
            concept: newConfigurationData.concept.uuid,
            numberOfTimes: newConfigurationData.numberOfTimes.value || 1,
            intervals: newConfigurationData.intervals,
        };
    }
}

export default createVaccineConfigurationComponent;
