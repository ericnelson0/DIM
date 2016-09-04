(function() {
  'use strict';

  angular.module('dimApp').controller('dimSettingsCtrl', SettingsController);

  SettingsController.$inject = ['dimSettingsService', 'dimInfoService', '$scope', 'SyncService', 'dimCsvService', 'dimStoreService'];

  function SettingsController(settings, dimInfoService, $scope, SyncService, dimCsvService, dimStoreService) {
    var vm = this;

    $scope.$watchCollection('vm.settings', function() {
      settings.save();
    });

    vm.charColOptions = _.range(3, 6).map((num) => ({ id: num, name: num }));
    vm.vaultColOptions = _.range(5, 21).map((num) => ({ id: num, name: num }));
    vm.vaultColOptions.unshift({ id: 999, name: 'Auto' });

    vm.settings = settings;

    vm.showSync = function() {
      return SyncService.drive();
    };

    vm.driveSync = function() {
      SyncService.authorize();
    };

    vm.downloadInfusionCsv = function(){
      var infusions = dimStoreService.getInfusions();
      if (infusions.length) {
        dimCsvService.downloadInfusion(infusions);
        dimStoreService.clearInfusions();
      } else {
        dimInfoService.show('noinfusions', {
          type: 'warning',
          title: 'No Infusions',
          body: 'There are no infusions that are currently saved.',
        });
      }
    };

    vm.downloadWeaponCsv = function(){
      dimCsvService.downloadCsvFiles(dimStoreService.getStores(), "Weapons");
      _gaq.push(['_trackEvent', 'Download CSV', 'Weapons']);
    };

    vm.downloadArmorCsv = function(){
      dimCsvService.downloadCsvFiles(dimStoreService.getStores(), "Armor");
      _gaq.push(['_trackEvent', 'Download CSV', 'Armor']);
    };
  }
})();
