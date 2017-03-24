(function(){
    "use strict";
    var myapp = angular.module("mainApp", ['ui.router', 'ngLoader', 'ngResource', 'ngCookies', 'mainApp.constant']);
    
    myapp.run(function ($rootScope, $cookieStore, $state) {
        $rootScope.$on('$stateChangeStart', function (e, to) {
            if (to.Authentication == true) {
                if (angular.isUndefined($cookieStore.get('AccessToken')) || $cookieStore.get('AccessToken').length == 0) {
                    e.preventDefault();
                    $state.go('home');
                }
            }
            return;
        });
    });

    myapp.config(['$resourceProvider', function ($resourceProvider) {
        // Don't strip trailing slashes from calculated URLs
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }]);

    myapp.config(myAppConfiguration);
    
    myAppConfiguration.$inject = ["$httpProvider", "$provide"];
    function myAppConfiguration($httpProvider, $provide) {
        $provide.decorator('$templateRequest', ['$delegate', function ($delegate) {
            var templateProvider = function (tpl, ignoreRequestError) {
                return $delegate(tpl, true);
            }
            return templateProvider;
        }]);

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('appHttpInterceptor');
    }
    
    myapp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'index.html',
                controller: 'mainCtrl',
                controllerAs: 'vm'
            })
            .state('createuser', {
                url: '/userAction',
                templateUrl: 'createuser.html',
                controller: 'createCtrl',
                controllerAs: 'vm',
                params: {
                    'userdata': undefined,
                    'mode': undefined
                }
            })
            .state('userlist', {
                url: '/users',
                templateUrl: 'UsersList.html',
                controller: 'userCtrl',
                controllerAs: 'vm'
            })
           .state('helplist', {
                url: '/Helplist',
                templateUrl: 'HelpList.html',
                controller: 'HelpCtrl',
                controllerAs: 'vm'
            })
             .state('createHelp', {
                url: '/helpAction',
                templateUrl: 'createHelp.html',
                controller: 'createHelpCtrl',
                controllerAs: 'vm',
                params: {
                    'helpdata': undefined,
                    'mode': undefined
                }
            });
    }]);
    
    myapp.controller("mainCtrl", function($scope, $http, $state, apiUrl) {
        $scope.load = function(){
            $scope.isclicked = false;
        }
         $scope.loadd = function(){
            $scope.isclicked = false;
        }
        
        $scope.navigatecreateuser = function(){
            $scope.isclicked = true;
            $scope.isclickedd = true;
            $state.go('createuser');
        }
        
        $scope.navigateuserslist = function(){
            $scope.isclicked = true;
            $scope.isclickedd = true;
            $state.go('userlist');
        }
        $scope.navigatehelplist = function(){
            $scope.isclickedd = true;
            $scope.isclicked = true;
            $state.go('helplist');
        }
         $scope.navigatecreatehelp = function(){
            $scope.isclickedd = true;
             $scope.isclicked = true;
            $state.go('createHelp');
        }
    });
})();
