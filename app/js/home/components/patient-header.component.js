import template from '../patient-header.html';

let patientHeaderComponent = {
    restrict: 'E',
    bindings: {
        patientUuid: '<'
    },
    template: template,
    controller: Controller,
    controllerAs: 'vm'
};

Controller.$inject = [ 'openmrsRest', '$location' ];

function Controller(openmrsRest, $location) {
    let vm = this;

    vm.patient = {};
    vm.display = {};

    (function loadPatient() {
        openmrsRest.getFull('patient', { uuid: vm.patientUuid }).then(patient => {
            vm.patient = patient;
            if(vm.patient.person.gender) {
                vm.display.gender = 'f' || 'F' ? 'Female' : 'Male';
            }
            vm.display.identifier = _findPreferredIdentifier(vm.patient.identifiers);
        });
    })();

    // Bind click event to name (It doesn't work)
    let elements = document.getElementsByClassName('clickable-name');
    Array.from(elements).forEach(element => {
        element.addEventListener('click', () => {
            let contextPath = '/' + window.location.href.split('/')[3];
            let patientDashUrl = window.location.protocol + '//' +  window.location.host + contextPath
                                + '/coreapps/clinicianfacing/patient.page?patientId=' + vm.patientUuid;
            window.location.href = patientDashUrl;
        });
    });

    function _findPreferredIdentifier(identifiers) {
        if(!Array.isArray(identifiers) || identifiers.length == 0) {
          console.debug('No identifiers passed');
          return {};
        }

        let filtered = identifiers.filter(identifier => identifier.preferred);

        // If none is preferred just get the first one.
        if(filtered.length == 0) return identifiers[0];
        return filtered[0];
    }
}

export default patientHeaderComponent;