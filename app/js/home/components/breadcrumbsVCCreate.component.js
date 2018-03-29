
let breadcrumbsVcCreateComponent = {
    restrict: 'E',
    bindings: {},
    template: `<div>
                    <openmrs-breadcrumbs links="vm.links"></openmrs-breadcrumbs>
               </div>`,
    controller: Controller,
    controllerAs: 'vm'
};

class Controller {
    constructor() {
        let vm = this;
        vm.links = {};
        vm.links["Vaccine Configuration"] = "";
        vm.links["Create"] = "create";
    }
}

export default breadcrumbsVcCreateComponent;