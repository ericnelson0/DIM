(function() {
  'use strict';

  angular.module('dimApp')
    .controller('dimVendorCtrl', dimVendorCtrl);

  dimVendorCtrl.$inject = ['$scope', '$state', '$q', 'dimStoreService', 'dimSettingsService'];

  function dimVendorCtrl($scope, $state, $q, dimStoreService, dimSettingsService) {
    var vm = this;

    var $window = $(window);
    var $vendorHeaders = $('#vendorHeaderWrapper');
    var $vendorHeadersBackground = $('#vendorHeadersBackground');
    var vendorsTop = $vendorHeaders.offset().top - 50; // Subtract height of title and back link

    function stickyHeader(e) {
      $vendorHeaders.toggleClass('sticky', $window.scrollTop() > vendorsTop);
      $vendorHeadersBackground.toggleClass('sticky', $window.scrollTop() > vendorsTop);
    }

    $window.on('scroll', stickyHeader);

    $scope.$on('$destroy', function() {
      $window.off('scroll', stickyHeader);
    });

    vm.activeTab = 'armorweaps';
    vm.activeTypeDefs = {
      armorweaps: ['armor', 'weapons'],
      vehicles: ['ships', 'vehicles'],
      shadersembs: ['shaders', 'emblems'],
      emotes: ['emotes']
    };
    // Banner
    vm.bannerHash = ['242140165'];

    // Titan van, Hunter van, Warlock van
    vm.vanguardHashes = ['1990950', '3003633346', '1575820975'];

    vm.settings = dimSettingsService;
    function init(stores) {
      if (_.isEmpty(stores)) {
        $state.go('inventory');
        return;
      }

      vm.stores = _.reject(stores, (s) => s.isVault);
      var vendors = _.omit(_.pluck(vm.stores, 'vendors'), function(value) {
        return !value;
      });
      vm.vendors = { armorweaps: {}, vehicles: {}, shadersembs: {}, emotes: {} };
      _.each(vendors, function(vendorMap, index) {
        vm.vendors.armorweaps[index] = {};
        vm.vendors.vehicles[index] = {};
        vm.vendors.shadersembs[index] = {};
        vm.vendors.emotes[index] = {};
        _.each(vendorMap, function(vendor, vendorHash) {
          if (vendor.hasArmorWeaps) {
            vm.vendors.armorweaps[index][vendorHash] = vendor;
          }
          if (vendor.hasVehicles) {
            vm.vendors.vehicles[index][vendorHash] = vendor;
          }
          if (vendor.hasShadersEmbs) {
            vm.vendors.shadersembs[index][vendorHash] = vendor;
          }
          if (vendor.hasEmotes) {
            vm.vendors.emotes[index][vendorHash] = vendor;
          }
        });
      });
      countCurrencies(stores);
      vm.vendorHashes = _.chain(vm.vendors[vm.activeTab])
                        .values()
                        .reduce(function(o, val) { o.push(_.keys(val)); return o; }, [])
                        .flatten()
                        .uniq()
                        .reject(function(hash) { return _.contains(vm.vanguardHashes, hash); })
                        .value();
    }

    init(dimStoreService.getStores());
    $scope.$on('dim-stores-updated', function(e, args) {
      init(args.stores);
    });

    // Van quart, Dead orb, Future war, New mon, Cruc hand, Cruc quart, Eris Morn, Speaker, Variks, Exotic Blue
    // vm.vendorHashes = ['2668878854', '3611686524', '1821699360', '1808244981', '3746647075', '3658200622', '174528503', '2680694281', '1998812735', '3902439767'];

    function mergeMaps(o, map) {
      _.each(map, function(val, key) {
        if (!o[key]) {
          o[key] = map[key];
        }
      });
      return o;
    }

    function countCurrencies(stores) {
      var currencies = _.chain(vm.vendors[vm.activeTab])
            .values()
            .reduce(function(o, val) { o.push(_.values(val)); return o; }, [])
            .flatten()
            .pluck('costs')
            .reduce(mergeMaps)
            .values()
            .pluck('currency')
            .pluck('itemHash')
            .unique()
            .value();
      vm.totalCoins = {};
      currencies.forEach(function(currencyHash) {
        // Legendary marks and glimmer are special cases
        if (currencyHash === 2534352370) {
          vm.totalCoins[currencyHash] = sum(stores, function(store) {
            return store.legendaryMarks || 0;
          });
        } else if (currencyHash === 3159615086) {
          vm.totalCoins[currencyHash] = sum(stores, function(store) {
            return store.glimmer || 0;
          });
        } else {
          vm.totalCoins[currencyHash] = sum(stores, function(store) {
            return store.amountOfItem({ hash: currencyHash });
          });
        }
      });
    }

    angular.extend(vm, {
      onTabChange: function() {
        vm.vendorHashes = _.chain(vm.vendors[vm.activeTab])
                          .values()
                          .reduce(function(o, val) { o.push(_.keys(val)); return o; }, [])
                          .flatten()
                          .uniq()
                          .reject(function(hash) { return _.contains(vm.vanguardHashes, hash); })
                          .value();
        countCurrencies(dimStoreService.getStores());
      }
    });
  }
})();
