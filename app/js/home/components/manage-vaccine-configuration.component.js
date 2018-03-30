import template from '../manage-vaccine-configuration.html';
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
    vm.errors = [];

    vm.createConfiguration = function() {
        $state.go('createVaccineConfiguration');
    };

    vm.editConfiguration = function(vaccineConfiguration) {
        $state.go('editVaccineConfiguration', {
            vaccineConfigurationUuid: vaccineConfiguration.uuid,
            vaccineConfiguration: vaccineConfiguration
        });
    };

    vm.viewConfiguration = function(vaccineConfiguration) {
        $state.go('viewVaccineConfiguration', {
            vaccineConfigurationUuid: vaccineConfiguration.uuid,
            vaccineConfiguration: vaccineConfiguration
        });
    };

    _fetchVaccineConfigurations();
    // fetch vaccine configuration when this controller is instantiated.
    function _fetchVaccineConfigurations() {
        ImmunizationService.getVaccineConfigurations({v: 'full'}).then(data => {
            // Technical debt: Clear errors for now, for simplicity
            vm.errors = [];
            vm.vaccineConfigurations = data;
        })
        .catch(err => {
            vm.errors.push(err);
            console.error(err);
        });
    }
}

export default vaccineConfigurationComponent;
