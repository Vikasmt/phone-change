(function(){
var app = angular.module("mainApp");
      


app.controller("createDisclaimerCtrl", function($scope, $http, $state, $stateParams, apiUrl) {
  
        $scope.disclaimer={};
 
      
          $scope.bindParameters = function(){
            $scope.disclaimer = angular.isDefined($stateParams.disclaimerdata) ? $stateParams.disclaimerdata : {};
            console.log($scope.disclaimer);
            $scope.mode = angular.isDefined($stateParams.mode) ? $stateParams.mode : 'C';
            console.log($scope.mode);
          }
    
        $scope.CreateDisclaimer = function(disclaimerInformation) {
                
            if(angular.isDefined(disclaimerInformation) && disclaimerInformation !== null) {
                var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
                
                var createdisclaimerurl = apiUrl + ($scope.mode==='E' ? 'updateDisclaimerInfo' : 'CreateDisclaimer');
                console.log(createdisclaimerurl);
                
                $http.post(createdisclaimerurl,disclaimerInformation,config)
                    .then(function (data, status, headers, config) {
                        $scope.disclaimer={};
                        $state.go('disclaimerlist');
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    });    
})();
