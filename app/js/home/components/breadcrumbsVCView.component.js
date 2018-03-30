let breadcrumbsVcViewComponent = {
    restrict: 'E',
    bindings: {},
    template: `<div>
                    <openmrs-breadcrumbs links="vm.links"></openmrs-breadcrumbs>
               </div>`,
    controller: Controller,
    controllerAs: 'vm'
};

function Controller() {
    let vm = this;
    vm.links = {};
    vm.links["Manage Vaccine Configuration"] = "";
    vm.links["View"] = "view";
}

export default breadcrumbsVcViewComponent;