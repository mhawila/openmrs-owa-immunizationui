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

Controller.$inject = [ 'ImmunizationService', 'openmrsRest', '$stateParams', 'Utils', 'VACCINE_GLOBAL_PROPERTIES' ]
function Controller(ImmunizationService, openmrsRest, $stateParams, Utils, VGP) {
    const CONFIG_REP = 'custom:(uuid,name,numberOfTimes,ageFirstTimeRequired,ageUnit,intervals)';

    let vm = this;

    vm.vaccineDateConceptUuid = null;
    vm.saveCancelButtonsDisabled = false;
    vm.newVaccinationRecord = {
        provider: { display: '' }
    };
    vm.errors = [];
    vm.vaccineEncounterErrors = [];
    vm.administeredVaccines = {};
    vm.links = {
        'Patient Vaccinations': '/vaccines/' + $stateParams.patientUuid,
    };

    let picker = _createDatePicker();

    vm.onProviderUpdate = function(isCorrect, provider) {
        vm.isConceptCorrect = isCorrect;
        vm.newVaccinationRecord.provider = provider;
    };

    // Functions
    vm.openRecordDialog = function openRecordDialog(config, form) {
        form.$setDirty(false);
        form.$setPristine();
        form.$setUntouched();
        vm.saveCancelButtonsDisabled = false;
        vm.postVaccineSuccess = false;
        vm.newVaccinationRecord.configuration = config;
        vm.newVaccinationRecord.dateGiven = null;
        vm.providerRequired = true;
        document.getElementById('new-vaccination-dialog').click();
    };

    vm.saveVaccinationRecord = function saveVaccinationRecord() {
        if(!vm.vaccineDateConceptUuid) {
            // We don't know the concept uuid for the vaccination date, can't do anything.
            vm.errors.push('Cannot create a record without associated vaccine date concept, please set ' + VGP.vaccineDateConcept + ' global property value');
            return;
        }
        if(!vm.newVaccinationRecord.provider) {
            vm.errors.push('Cannot save a new vaccination without provider!');
            return;
        }

        vm.saveCancelButtonsDisabled = true;
        vm.postVaccineSuccess = false;
        // Create payload
        let payload = {
            vaccineConfiguration: vm.newVaccinationRecord.configuration.uuid,
            obs: {
                person: vm.patient.uuid,
                concept: vm.vaccineDateConceptUuid,
                value: vm.newVaccinationRecord.dateGiven
            }
        };

        let __createEncounter = (obs) => {
            // Try to get existing active visit if any
            return _getExistingActiveVisit(vm.patient.uuid, obs.value).then(visit => {
                if(_isOkToCreateEncounter()) {
                    // Create encounter payload
                    let encounterPayload = {
                        patient: vm.patient.uuid,
                        encounterType: vm.vaccineEncounterTypeUuid,
                        encounterDatetime: obs.obsDatetime,
                        obs: [ obs.uuid ],
                        encounterProviders: [{
                            provider: vm.newVaccinationRecord.provider.uuid,
                            encounterRole: vm.vaccineEncounterRoleUuid
                        }]
                    };

                    if(visit) {
                        encounterPayload.visit = visit.uuid;

                        if(visit.location) {
                            encounterPayload.location = visit.location.uuid;
                        }
                    }

                    return openmrsRest.create('encounter',encounterPayload);
                }
            });
        };

        ImmunizationService.postAdministeredVaccine(payload).then(response => {
            if(!Array.isArray(vm.administeredGroups[vm.newVaccinationRecord.configuration.uuid])) {
                vm.administeredGroups[vm.newVaccinationRecord.configuration.uuid] = [];
            }
            vm.administeredGroups[vm.newVaccinationRecord.configuration.uuid].push(response);
            let associatedFormattedIndex = vm.formatted.indexOf(
                vm.formatted.find(one => one.uuid === payload.vaccineConfiguration)
            );
            vm.formatted.splice(associatedFormattedIndex, 1,
                _formatOneOutput(vm.patient.person, vm.newVaccinationRecord.configuration,
                    vm.administeredGroups[vm.newVaccinationRecord.configuration.uuid]));
            // Post associated encounter if any
            __createEncounter(response.obs).then(encounterResponse => {
                vm.saveCancelButtonsDisabled = false;
                vm.postVaccineSuccess = true;
                document.getElementById('new-vaccination-dialog').click();
            }).catch(err => {
                vm.postVaccineSuccess = false;
                vm.errors.push(err);
                document.getElementById('new-vaccination-dialog').click();
                console.error(err);
            });
        }).catch(err => {
            vm.postVaccineSuccess = false;
            vm.errors.push(err);
            document.getElementById('new-vaccination-dialog').click();
            console.error(err);
        });
    };


    let ordinals = Utils.getOrdinalMap();

    // Load necessary items asynchronously. (Hopefully when the user finally uses one of this it will be there.
    (function loadNecessaryItems() {
        Promise.all([
            Utils.getVaccineDateConcept(),
            Utils.getGlobalPropertyValue(VGP.vaccineEncounterType),
            Utils.getGlobalPropertyValue(VGP.vaccineEncounterRole),
            _getProviderForAuthenticatedUser(),
        ]).then(values => {
            vm.vaccineDateConceptUuid = values[0].value;
            vm.vaccineEncounterTypeUuid = values[1].value;
            vm.vaccineEncounterRoleUuid = values[2].value;
            vm.newVaccinationRecord.provider = values[3];
        }).catch(err => {
            console.error(err);
        });
    })();

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
            vm.administeredGroups = _groupAdministeredVaccines(responses[2]);

            vm.formatted = _formatOutput(vm.patient.person, vm.configurations, vm.administeredGroups);
        }).catch(err => {
            console.error(err);
            vm.errors.push(err);
        });
    })();

    function _formatOutput(person, configurations, administeredGroups) {
        return configurations.map(config => {
            return _formatOneOutput(person, config, administeredGroups[config.uuid] || []);
        });
    }

    function _formatOneOutput(person, configuration, administeredGroup) {
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

    function _groupAdministeredVaccines(administeredArray) {
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

    function _createDatePicker(birthdate) {
        return new Pikaday({
            field: document.getElementById('date-given-picker'),
            maxDate: new Date(),
            // yearRange: [moment(vm.patient.person.birthdate).getDate(), moment().year()],
        });
    }

    // Function to load Patient's visits if any.
    function _getExistingActiveVisit(patientUuid, desiredDate) {
        let simpleVisitRep = 'custom:(uuid,patient:(uuid,uuid),' +
            'visitType:(uuid,name),location:ref,startDatetime,' +
            'stopDatetime)';
        let params = {
            patient: patientUuid,
            v: simpleVisitRep
        };

        return openmrsRest.get('visit', params).then(response => {
            let desiredMoment = desiredDate ? moment(desiredDate) : moment();

            let visits = response.results;

            visits = visits.filter(visit => {
                let timeDifference = desiredMoment.diff(moment(visit.startDatetime), 'days');
                return  timeDifference >= -1 && timeDifference <= 0;
            }).sort((v1, v2) => {
                let v1Moment = moment(v1.startDatetime);
                let v2Moment = moment(v2.startDatetime);
                if(v1Moment.isAfter(v2Moment)) return -1;
                return 1;
            });

            if(visits.length > 0) {
                return visits[0];
            }

            return null;
        });
    }

    function _getProviderForAuthenticatedUser() {
        return openmrsRest.get('session').then(response => {
            if(response.authenticated) {
                return openmrsRest.getFull('provider', { q: response.user.person.display }).then(response => {
                    if(response.results.length > 0) return response.results[0];
                    return null;
                });
            }
            return null;
        });
    }

    function _isOkToCreateEncounter() {
        vm.vaccineEncounterErrors = [];
        if(!vm.vaccineEncounterRoleUuid) {
            vm.vaccineEncounterErrors
                .push('Can not create encounter without role, please set ' + VGP.vaccineEncounterRole + ' global property if not set');
        }

        if(!vm.vaccineEncounterTypeUuid) {
            vm.vaccineEncounterErrors
                .push('Can not create encounter without encounter type, please set ' + VGP.vaccineEncounterType + ' global property if not set');
        }
        return vm.vaccineEncounterErrors.length === 0;
    }
}

export default patientVaccinesComponent;