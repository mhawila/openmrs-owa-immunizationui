import template from '../patient-vaccines.html';
import moment from 'moment';
import Pikaday from 'pikaday';

let patientVaccinesComponent = {
    restrict: 'E',
    bindings: {},
    controller: Controller,
    controllerAs: 'vm',
    template: template
};

Controller.$inject = [ 'ImmunizationService', 'openmrsRest', '$stateParams', 'Utils' ]
function Controller(ImmunizationService, openmrsRest, $stateParams, Utils) {
    const CONFIG_REP = 'custom:(uuid,name,numberOfTimes,ageFirstTimeRequired,ageUnit,intervals)';

    // TODO: Replace this UUID constant with global property or something of that nature.
    const VACCINATION_DATE_CONCEPT = 'd2fb6e44-d679-43ad-b5ac-183222d321df';
    let vm = this;

    vm.saveCancelButtonsDisabled = false;
    vm.newVaccinationRecord = {};
    vm.errors = [];
    vm.administeredVaccines = {};
    vm.links = {
        'Patient Vaccinations': '/vaccines/' + $stateParams.patientUuid,
    };

    let picker = __createDatePicker();

    // Functions
    vm.openRecordDialog = function openRecordDialog(config, form) {
        form.$setDirty(false);
        form.$setPristine();
        form.$setUntouched();
        vm.saveCancelButtonsDisabled = false;
        vm.postVaccineSuccess = false;
        vm.newVaccinationRecord.configuration = config;
        vm.newVaccinationRecord.dateGiven = null;
        document.getElementById('new-vaccination-dialog').click();
    };

    vm.saveVaccinationRecord = function saveVaccinationRecord() {
        vm.saveCancelButtonsDisabled = true;
        vm.postVaccineSuccess = false;
        // Create payload
        let payload = {
            vaccineConfiguration: vm.newVaccinationRecord.configuration.uuid,
            obs: {
                person: vm.patient.uuid,
                concept: VACCINATION_DATE_CONCEPT,
                value: vm.newVaccinationRecord.dateGiven
            }
        };

        ImmunizationService.postAdministeredVaccine(payload).then(response => {
            vm.saveCancelButtonsDisabled = false;
            vm.postVaccineSuccess = true;
            if(!Array.isArray(vm.administeredGroups[vm.newVaccinationRecord.configuration.uuid])) {
                vm.administeredGroups[vm.newVaccinationRecord.configuration.uuid] = [];
            }
            vm.administeredGroups[vm.newVaccinationRecord.configuration.uuid].push(response);
            let associatedFormattedIndex = vm.formatted.indexOf(
                vm.formatted.find(one => one.uuid === payload.vaccineConfiguration)
            );
            vm.formatted.splice(associatedFormattedIndex, 1,
                __formatOneOutput(vm.patient.person, vm.newVaccinationRecord.configuration,
                vm.administeredGroups[vm.newVaccinationRecord.configuration.uuid]));
            document.getElementById('new-vaccination-dialog').click();
        }).catch(err => {
            vm.postVaccineSuccess = false;
            vm.errors.push(err);
            document.getElementById('new-vaccination-dialog').click();
            console.error(err);
        });
    };


    let ordinals = Utils.getOrdinalMap();

    (function fetchPatientWithAssociatedVaccineRecords() {
        if(angular.isUndefined($stateParams.patientUuid)) {
            console.error('Component requires a patient UUID, none has been passed');
            return;
        }

        Promise.all([
            openmrsRest.getFull('patient', { uuid: $stateParams.patientUuid }),
            ImmunizationService.getVaccineConfigurations({ v: CONFIG_REP }),
            ImmunizationService.getAdministeredVaccines({ patient: $stateParams.patientUuid }),
        ]).then(responses => {
            vm.patient = responses[0];
            vm.configurations = responses[1];
            vm.administeredGroups = __groupAdministeredVaccines(responses[2]);

            vm.formatted = __formatOutput(vm.patient.person, vm.configurations, vm.administeredGroups);
        }).catch(err => {
            console.error(err);
            vm.errors.push(err);
        });
    })();

    function __formatOutput(person, configurations, administeredGroups) {
        return configurations.map(config => {
            return __formatOneOutput(person, config, administeredGroups[config.uuid] || []);
        });
    }

    function __formatOneOutput(person, configuration, administeredGroup) {
        let now = moment();
        let vaccineInstances = [];
        if(!Array.isArray(administeredGroup)) {
            throw new TypeError('Argument administeredGroup should be an array');
        }
        // First instance of vaccine to display.
        let instance = {
            supposedDate: moment(person.birthdate).add(configuration.ageFirstTimeRequired, configuration.ageUnit),
            dateGiven: administeredGroup[0] ? moment(administeredGroup[0].obs.value) : null,
            dose: ordinals[1]
        };
        instance.administered = instance.dateGiven !== null ? true : false;
        if(instance.supposedDate !== null && instance.supposedDate !== undefined) {
            if(instance.dateGiven == null && instance.supposedDate.isBefore(now)) {
                instance.missed = true;
                instance.pending = false;
            }
            else if(instance.dateGiven == null && instance.supposedDate.isAfter(now)){
                instance.missed = false;
                instance.pending = true;
            }
        }
        vaccineInstances.push(instance);

        if(configuration.numberOfTimes >= administeredGroup.length) {
            for(let i = 1; i < configuration.numberOfTimes ; ++i) {
                instance = {
                    dose: ordinals[i + 1],
                };
                if(configuration.intervals[i-1]) {
                    if(vaccineInstances[i-1].dateGiven) {
                        instance.supposedDate = vaccineInstances[i-1].dateGiven.clone()
                            .add(configuration.intervals[i-1].timeValue, configuration.intervals[i-1].timeUnit);
                    }
                    else if(vaccineInstances[i-1].supposedDate) {
                        instance.supposedDate = vaccineInstances[i-1].supposedDate.clone()
                            .add(configuration.intervals[i-1].timeValue, configuration.intervals[i-1].timeUnit);
                    }
                    else {
                        instance.supposedDate = null;
                    }
                }
                else {
                    instance.supposedDate = null;
                }

                // Now date given
                instance.dateGiven = administeredGroup[i] ? moment(administeredGroup[i].obs.value) : null;
                instance.administered = instance.dateGiven !== null ? true : false;

                if(instance.supposedDate !== null && instance.supposedDate !== undefined) {
                    if(instance.dateGiven == null && instance.supposedDate.isBefore(now)) {
                        instance.missed = true;
                        instance.pending = false;
                    }
                    else if(instance.dateGiven == null && instance.supposedDate.isAfter(now)){
                        instance.missed = false;
                        instance.pending = true;
                    }
                }
                vaccineInstances.push(instance);
            }
        }
        else {
            // there are more administered vaccines than the configured number.
            // TODO: To be implemented soon once the first above works well
            let i = 1;
            for(; i<configuration.numberOfTimes; ++i) {

            }
        }

        // Append to configuration.
        configuration.instances = vaccineInstances;
        return configuration;
    }

    function __groupAdministeredVaccines(administeredArray) {
        let groups = {};
        administeredArray.forEach(administered => {
            if(!Array.isArray(groups[administered.vaccineConfiguration.uuid])) {
                groups[administered.vaccineConfiguration.uuid] = [];
            }
            groups[administered.vaccineConfiguration.uuid].push(administered);
        });

        // Sort
        Object.values(groups).forEach(group => group.sort((v1, v2) => {
            let date1 = moment(v1.obs.value);
            let date2 = moment(v2.obs.value);
            if(date1.isValid() && date2.isValid()) {
                return date1.valueOf() - date2.valueOf();
            }
            else if(date1.isValid()) {
                return -1;
            }
            else if(date2.isValid()) {
                return 1;
            }
            return 0;
        }));

        return groups;
    }

    function __createDatePicker(birthdate) {
        return new Pikaday({
            field: document.getElementById('date-given-picker'),
            maxDate: new Date(),
            // yearRange: [moment(vm.patient.person.birthdate).getDate(), moment().year()],
        });
    }
}

export default patientVaccinesComponent;