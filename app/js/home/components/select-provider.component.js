import template from '../select-provider.html';

let selectProviderComponent = {
    restrict: 'E',
    bindings: {
        provider: '<',
        onUpdate: '&'
    },
    controller: Controller,
    template: template
};

Controller.$inject = [ 'openmrsRest' ];
function Controller(openmrsRest) {
    let vm = this;

    vm.inputId = (vm.id ? vm.id : 'select-person-' + Math.floor(Math.random() * 10000)) + '-input';

    vm.searchText = vm.provider.display;


    vm.providers =[];
    vm.suggestions = [];
    vm.isCorrect = !vm.required;
    vm.provider;
    vm.newProvider;

    vm.search = search;
    vm.checkInput = checkInput;
    vm.display = display;
    vm.onSelect = onSelect;

    activate();

    function activate(){
        if(vm.provider.display.length > 0){
            vm.isCorrect = true;
        }
    }

    function onSelect($item, $model, $label) {
        if(angular.isDefined($item.display)){
            vm.searchText = $item.display;
        }
        vm.newProvider = $item;
        vm.isCorrect = true;
        vm.onUpdate({isCorrect: vm.isCorrect, provider: vm.newProvider});
    }

    function display(display, uuid) {
        return display +"</br><sub>"+ uuid+"</sub>";
    }

    function checkInput(){
        var display = vm.searchText;
        if(angular.isDefined(vm.searchText)){
            if(angular.isDefined(vm.searchText.display)){
                display = vm.searchText.display;
            }
        }
        if(angular.isUndefined(display)){
            display = '';
        }
        for(var i=0; i<vm.suggestions.length; i++){
            if(display === vm.suggestions[i].display){
                vm.isCorrect = true;
                vm.newProvider = vm.suggestions[i]
                break;
            }else{
                vm.isCorrect = false;
                break;
            }
        }
        if(display === '' && !vm.required){
            vm.isCorrect = true;
            vm.newProvider = {
                display: ''
            };
        }
    }

    function search(){
        var maxResults = 0;
        vm.suggestions = [];
        vm.isCorrect = false;
        var display = vm.searchText;
        if(angular.isDefined(vm.searchText)){
            if(angular.isDefined(vm.searchText.display)){
                display = vm.searchText.display;
            }
        }
        if(angular.isUndefined(display)){
            display = '';
        }
        if(display.length > 1){
            openmrsRest.listFull('provider', {q: display, includeAll: true}).then(function (response) {
                vm.providers = vm.suggestions = response.results;

                vm.checkInput();
                vm.onUpdate({isCorrect: vm.isCorrect, provider: vm.newProvider});
            });
        }
    }
}
export default selectProviderComponent;