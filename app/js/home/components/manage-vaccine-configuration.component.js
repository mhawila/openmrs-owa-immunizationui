import template from '../manage-vaccine-configuration.html';
import 'angular-ui-router';

let vaccineConfigurationComponent = {
  restrict: 'E',
  bindings: {},
  controller: VaccineConfigurationController,
  template: template
};

VaccineConfigurationController.$inject = ['ImmunizationService', '$state', '$filter' ];

function VaccineConfigurationController(ImmunizationService, $state, $filter) {
    const NUMBER_SEARCH_CHARS = 3;
    let vm = this;
    vm.vaccineConfigurations = [];
    vm.errors = [];

    /***************  PAGING STUFF***********************************/
    // vm.sortingOrder = sortingOrder;
    vm.itemsPerPage = 15;
    vm.pagedItems = [];
    vm.currentPage = 0;
    vm.numberOfSearchCharacters = NUMBER_SEARCH_CHARS;

    vm.groupToPages = function () {
        vm.pagedItems = [];

        for (var i = 0; i < vm.vaccineConfigurations.length; i++) {
            if (i % vm.itemsPerPage === 0) {
                vm.pagedItems[Math.floor(i / vm.itemsPerPage)] = [ vm.vaccineConfigurations[i] ];
            } else {
                vm.pagedItems[Math.floor(i / vm.itemsPerPage)].push(vm.vaccineConfigurations[i]);
            }
        }

        if(vm.pagedItems.length > 0) vm.currentPage = 0;
    };

    vm.range = function (start, end) {
        var ret = [];
        if (!end) {
            end = start;
            start = 0;
        }
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        return ret;
    };

    vm.prevPage = function () {
        if (vm.currentPage > 0) {
            vm.currentPage--;
        }
    };

    vm.nextPage = function () {
        if (vm.currentPage < vm.pagedItems.length - 1) {
            vm.currentPage++;
        }
    };

    vm.setPage = function (page) {
        console.log('this ni:', this, 'na kwenye vm je?',vm.n);
        vm.currentPage = page;
    };

    vm.search = function() {
        // Start with three characters
        let params = {};
        if(typeof vm.searchText === 'string' && vm.searchText.length >= NUMBER_SEARCH_CHARS) {
            params.name = vm.searchText;
        }

        console.log('includeRetired value: ', vm.includeRetired);
        if(vm.includeRetired === true) {
            params.includeAll = true;
        }

        _fetchVaccineConfigurations(params);
    };

    /************************* end of paging stufff***********************/

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
    function _fetchVaccineConfigurations(params) {
        params = params || {};
        if(params.v === null || params.v === undefined) {
            params.v = 'full';
        }

        ImmunizationService.getVaccineConfigurations(params).then(data => {
            // Technical debt: Clear errors for now, for simplicity
            vm.errors = [];
            vm.vaccineConfigurations = data;
            vm.groupToPages();
        })
        .catch(err => {
            vm.errors.push(err);
            console.error(err);
        });
    }
}

export default vaccineConfigurationComponent;
