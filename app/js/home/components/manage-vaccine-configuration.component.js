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
    let vm = this;
    vm.vaccineConfigurations = [];
    vm.errors = [];

    /***************  PAGING STUFF***********************************/
    // vm.sortingOrder = sortingOrder;
    vm.reverse = false;
    // vm.filteredItems = [];
    vm.groupedItems = [];
    vm.itemsPerPage = 5;
    vm.pagedItems = [];
    vm.currentPage = 0;

    vm.groupToPages = function () {
        vm.pagedItems = [];

        for (var i = 0; i < vm.vaccineConfigurations.length; i++) {
            if (i % vm.itemsPerPage === 0) {
                vm.pagedItems[Math.floor(i / vm.itemsPerPage)] = [ vm.vaccineConfigurations[i] ];
            } else {
                vm.pagedItems[Math.floor(i / vm.itemsPerPage)].push(vm.vaccineConfigurations[i]);
            }
        }
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

    // vm.search = function () {
    //     vm.filteredItems = $filter('filter')(vm.items, function (item) {
    //         for(var attr in item) {
    //             if (searchMatch(item[attr], vm.query))
    //                 return true;
    //         }
    //         return false;
    //     });
    //     // take care of the sorting order
    //     if (vm.sortingOrder !== '') {
    //         vm.filteredItems = $filter('orderBy')(vm.filteredItems, vm.sortingOrder, vm.reverse);
    //     }
    //     vm.currentPage = 0;
    //     // now group by pages
    //     vm.groupToPages();
    // };
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
    function _fetchVaccineConfigurations() {
        ImmunizationService.getVaccineConfigurations({v: 'full'}).then(data => {
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
