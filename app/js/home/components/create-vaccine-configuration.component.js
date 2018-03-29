import template from '../create-vaccine-configuration.html';

let createVaccineConfigurationComponent = {
    restrict: 'E',
    bindings: {},
    controller: Controller,
    controllerAs: 'vm',
    template: template
};

Controller.$inject = ['ImmunizationService'];

function Controller(ImmunizationService) {
    let vm = this;
    vm.newConfiguration = {};

    vm.required = true; //if truthy, input box will be required
    vm.isConceptCorrect;	//flag, if current query matches any concept name
    vm.updateConcept = updateConcept;
    //item is object with property "display", which is passed to component at activation (make it empty if there has to be no initial state)
    vm.item = {};

    //function, which will be invoked at any change of component model, in this example it
    function updateConcept(isCorrect, concept) {
        vm.isConceptCorrect = isCorrect;
        vm.item = concept;
    };

}

export default createVaccineConfigurationComponent;
