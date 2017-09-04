(function () {
    "use strict";
    angular
        .module("mainApp")
        .factory("appHttpInterceptor", appHttpInterceptor);

    appHttpInterceptor.$inject = ["$q", "$injector", "$location"];
    function appHttpInterceptor($q, $injector, $location) {
        var requestCount = 0;
        function error(rejection) {
            var rScope = $injector.get('$rootScope');
            if (--requestCount == 0)
                rScope.working = false;
            var errorData = angular.fromJson(angular.toJson(rejection.data));
            rScope.errors = errorData;
            console.log(errorData);

            if (rejection.status == 401) {
                $injector.get('$state').transitionTo('home');
            }
            
            return $q.reject(rejection);
        }

        function handleResponse(response) {
            var rScope = $injector.get('$rootScope');
            if (--requestCount == 0)
                rScope.working = false;

            return response;
        }

        return {
            request: function (config) {
                requestCount++;
                var rScope = $injector.get('$rootScope');
                rScope.working = true;
                return config;
            },
            requestError: error,
            response: handleResponse,
            responseError: error
        };
    }
})();