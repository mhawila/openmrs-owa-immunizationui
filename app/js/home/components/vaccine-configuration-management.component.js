import template from '../vaccine-configuration-management.html';

let vaccineConfigurationComponent = {
  restrict: 'E',
  bindings: {},
  controller: VaccineConfigurationController,
  template: template
};

VaccineConfigurationController.$inject = ['ImmunizationService', '$scope'];

function VaccineConfigurationController(ImmunizationService, $scope) {
    $scope.vaccineConfigurations = [];

    _fetchVaccineConfigurations();
    // fetch vaccine configuration when this controller is instantiated.
    function _fetchVaccineConfigurations() {
        ImmunizationService.getVaccineConfigurations({v: 'full'}).then(data => {
            $scope.vaccineConfigurations = data;
        })
        .catch(err => {
            console.error(err);
        });
    }
}

export default vaccineConfigurationComponent;
