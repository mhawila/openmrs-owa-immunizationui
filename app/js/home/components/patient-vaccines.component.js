import template from '../patient-vaccines.html';
import moment from 'moment';

let patientVaccinesComponent = {
    restrict: 'E',
    bindings: {},
    controller: Controller,
    controllerAs: 'vm',
    template: template
};

Controller.$inject = [ 'ImmunizationService', 'openmrsRest', '$stateParams', 'Utils' ]
function Controller(ImmunizationService, openmrsRest, $stateParams, Utils) {
    let vm = this;

    vm.errors = [];
    vm.administeredVaccines = {};

    let ordinals = Utils.getOrdinalMap();

    //TODO : Remove only for debugging
    console.log('Passed patient uuid', $stateParams.patientUuid);

    (function fetchPatientWithAssociatedVaccineRecords() {
        if(angular.isUndefined($stateParams.patientUuid)) {
            console.error('Component requires a patient UUID, none has been passed');
            return;
        }

        Promise.all([
            openmrsRest.getFull('patient', { uuid: $stateParams.patientUuid }),
            ImmunizationService.getVaccineConfigurations({ v: 'custom:(uuid,name,numberOfTimes,ageFirstTimeRequired,ageUnit,intervals)' }),
            ImmunizationService.getAdministeredVaccines({ patient: $stateParams.patientUuid }),
        ]).then(responses => {
            vm.patient = responses[0];
            vm.configurations = responses[1];
            let administeredGroups = __groupAdministeredVaccines(responses[2]);

            vm.formatted = __formatOutput(vm.patient.person, vm.configurations, administeredGroups);

            //TODO: Remove this later, only for debugging
            console.log(JSON.stringify(vm.formatted, null, 2));
        }).catch(err => {
            console.error(err);
            vm.errors.push(err);
        });
    })();

    function __formatOutput(person, configurations, administeredGroups) {
        let now = moment();
        return configurations.map(config => {
            let vaccineInstances = [];
            let administered = administeredGroups[config.uuid] || [];
            // First instance of vaccine to display.
            let instance = {
                supposedDate: moment(person.birthdate).add(config.ageFirstTimeRequired, config.ageUnit),
                dateGiven: administered[0] ? moment(administered[0].obs.value) : null,
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

            if(config.numberOfTimes >= administered.length) {
                for(let i = 1; i < config.numberOfTimes ; ++i) {
                    instance = {
                        dose: ordinals[i + 1],
                    };
                    if(config.intervals[i-1]) {
                        if(vaccineInstances[i-1].dateGiven) {
                            instance.supposedDate = vaccineInstances[i-1].dateGiven.clone()
                                .add(config.intervals[i-1].timeValue, config.intervals[i-1].timeUnit);
                        }
                        else if(vaccineInstances[i-1].supposedDate) {
                            instance.supposedDate = vaccineInstances[i-1].supposedDate.clone()
                                .add(config.intervals[i-1].timeValue, config.intervals[i-1].timeUnit);
                        }
                        else {
                            instance.supposedDate = null;
                        }
                    }
                    else {
                        instance.supposedDate = null;
                    }

                    // Now date given
                    instance.dateGiven = administered[i] ? moment(administered[i].obs.value) : null;
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
                for(; i<config.numberOfTimes; ++i) {

                }
            }

            // Append to config.
            config.instances = vaccineInstances;
            return config;
        });
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

    // function __makeVaccineInstanceDetails(person, )
}

export default patientVaccinesComponent;