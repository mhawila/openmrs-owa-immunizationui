import template from '../edit-vaccine-configuration.html';

let editVaccineConfigurationComponent = {
    restrict: 'E',
    bindings: {},
    controller: Controller,
    controllerAs: 'vm',
    template: template
};

Controller.$inject = ['ImmunizationService', 'Utils', '$state', '$stateParams'];

function Controller(ImmunizationService, Utils, $state, $stateParams) {
    let vm = this;
    let previousNumberOfTimes = 1;
    vm.editCancelButtonsDisabled = false;
    vm.configurationToEdit = {};
    vm.errors = [];
    vm.updateButtonValue = 'Update';

    // exposed functions (i.e. API)
    vm.updateConcept = updateConcept;
    vm.manipulateIntervalSection = manipulateIntervalSection;
    vm.updateConfiguration = updateConfiguration;
    vm.cancel = cancel;
    vm.buttonValue = buttonValue;
    vm.unretire = unretire;

    // Do work
    vm.times = Utils.getTimes();

    vm.units = Utils.getTimeIntervalUnits();

    let numberMaps = Utils.getOrdinalMap();

    if($stateParams.vaccineConfiguration && typeof $stateParams.vaccineConfiguration === 'object') {
         __prepareEnvironmentForEditingView($stateParams.vaccineConfiguration);
    }
    else {
        // We will have to fetch or throw error.
        if(angular.isUndefined($stateParams.vaccineConfigurationUuid)) {
            throw new Error('Cannot instantiate component without a vaccine configuration to edit.');
        }

        ImmunizationService.getVaccineConfiguration($stateParams.vaccineConfigurationUuid).then(vaccineConfiguration => {
             __prepareEnvironmentForEditingView(vaccineConfiguration);
        });
    }

    function updateConcept(isCorrect, concept) {
        vm.isConceptCorrect = isCorrect;
        vm.newConfiguration.concept = concept;
    };

    function manipulateIntervalSection() {
        if(vm.configurationToEdit.numberOfTimes.value === previousNumberOfTimes) return;

        if(vm.configurationToEdit.numberOfTimes.value < previousNumberOfTimes) {
            if(Array.isArray(vm.configurationToEdit.intervals)) {
                vm.configurationToEdit.intervals.splice(vm.configurationToEdit.numberOfTimes.value - 1)
            }
        }
        else if(vm.configurationToEdit.numberOfTimes.value > previousNumberOfTimes) {
            vm.configurationToEdit.intervals = vm.configurationToEdit.intervals || [];
            for(let i = previousNumberOfTimes; i < vm.configurationToEdit.numberOfTimes.value; ++i) {
                let rank1 = i;
                let rank2 = i + 1;
                vm.configurationToEdit.intervals.push({
                    rank1: rank1,
                    rank2: rank2,
                    from: numberMaps[rank1],
                    to: numberMaps[rank2]
                });
            }
        }

        // Tricking angular into thinking that the array has changed. (Sucks big time!) - Turns out I don't need it.
        // It is here to remind me the amount of trouble I went through because of this.
        // vm.configurationToEdit.intervals.unshift(Object.assign({}, vm.configurationToEdit.intervals.shift()));
        previousNumberOfTimes = vm.configurationToEdit.numberOfTimes.value;
    }

    function updateConfiguration() {
        vm.editCancelButtonsDisabled = true;
        if(vm.configurationToEdit.retired) {
            ImmunizationService.retireVaccineConfiguration(vm.configurationToEdit.uuid).then(response => {
                vm.editCancelButtonsDisabled = false;
                vm.referenceConfiguration.retired = true;
                $state.go('viewVaccineConfiguration', {
                    vaccineConfigurationUuid: vm.configurationToEdit.uuid,
                    vaccineConfiguration: vm.referenceConfiguration
                });
            }).catch(err => {
                vm.editCancelButtonsDisabled = false;
                vm.errors.push(err);
            });
        }
        else {
            let updatedConfiguration = __createPayload(vm.configurationToEdit);
            ImmunizationService.updateVaccineConfiguration(vm.referenceConfiguration.uuid, updatedConfiguration, { v: 'full'})
                .then(response => {
                    vm.editCancelButtonsDisabled = false;
                    vm.errors = [];
                    $state.go('viewVaccineConfiguration', {
                        vaccineConfigurationUuid: response.uuid,
                        vaccineConfiguration: response
                    });
                })
                .catch(err => {
                    vm.editCancelButtonsDisabled = false;
                    vm.errors.push(err);
                    console.log(err);
                });
        }
    }

    function cancel() {
        // TODO: Change to previous state (i.e where we transformed from to this place).
        $state.go('home');
    }

    function buttonValue() {
        if(vm.configurationToEdit.retired) {
            vm.updateButtonValue = 'Retire';
        }
        else {
            vm.updateButtonValue = 'Update';
        }

    }

    // TODO: Implement this function to actually retire the resource in the backend.
    function unretire() {
        alert('Not implemented currently, stay tuned');
    }

    function __prepareEnvironmentForEditingView(vaccineConfiguration) {
        previousNumberOfTimes = vaccineConfiguration.numberOfTimes;
        vm.referenceConfiguration = vaccineConfiguration;
        vm.configurationToEdit = angular.copy(vaccineConfiguration);
        let numberOfTimes = vm.times.find(time => time.value === vaccineConfiguration.numberOfTimes);
        vm.configurationToEdit.numberOfTimes = numberOfTimes;

        if(Array.isArray(vm.configurationToEdit.intervals) && vm.configurationToEdit.intervals.length > 0) {
            vm.configurationToEdit.intervals.forEach(interval => {
                interval.from = numberMaps[interval.rank1];
                interval.to = numberMaps[interval.rank2];
                interval.timeUnit = interval.timeUnit.toLowerCase();
            });
        }
    }

    function __createPayload(viewModelConfiguration) {
        let payloadIntervals = null;
        if(Array.isArray(viewModelConfiguration.intervals) && viewModelConfiguration.intervals.length > 0) {
            payloadIntervals = viewModelConfiguration.intervals.map(interval => {
                return {
                    timeValue: interval.timeValue,
                    timeUnit: interval.timeUnit,
                    rank1: interval.rank1,
                    rank2: interval.rank2
                };
            });
        }

        let payload = {};
        if(payloadIntervals !== null) {
            payload.intervals = payloadIntervals;
        }

        return Object.assign(payload, {
            name: viewModelConfiguration.name,
            description: viewModelConfiguration.description,
            concept: viewModelConfiguration.concept.uuid,
            numberOfTimes: viewModelConfiguration.numberOfTimes.value || 1,
        });
    }
}

export default editVaccineConfigurationComponent;
