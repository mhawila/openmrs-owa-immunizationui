import template from '../vaccine-configuration-management.html';
import 'angular-ui-router';

let vaccineConfigurationComponent = {
  restrict: 'E',
  bindings: {},
  controller: VaccineConfigurationController,
  template: template
};

VaccineConfigurationController.$inject = ['ImmunizationService', '$state' ];

function VaccineConfigurationController(ImmunizationService, $state) {
    let vm = this;
    vm.vaccineConfigurations = [];

    vm.createConfiguration = function() {
        $state.go('createVaccineConfiguration');
    };

    _fetchVaccineConfigurations();
    // fetch vaccine configuration when this controller is instantiated.
    function _fetchVaccineConfigurations() {
        ImmunizationService.getVaccineConfigurations({v: 'full'}).then(data => {
            vm.vaccineConfigurations = data;
        })
        .catch(err => {
            console.error(err);
        });
    }
}

export default vaccineConfigurationComponent;
