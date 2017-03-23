(function(){
var app = angular.module("mainApp");
      


app.controller("createHelpCtrl", function($scope, $http, $state, $stateParams, apiUrl) {
  
        $scope.help={};
 
      
          $scope.bindParameters = function(){
            $scope.help = angular.isDefined($stateParams.helpdata) ? $stateParams.helpdata : {};
            console.log($scope.help);
            $scope.mode = angular.isDefined($stateParams.mode) ? $stateParams.mode : 'C';
            console.log($scope.mode);
          }
    
        $scope.CreateHelp = function(userInformation) {
                
            if(angular.isDefined(helpInformation) && helpInformation !== null) {
                var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
                
                var createhelpurl = apiUrl + ($scope.mode==='E' ? 'updateHelpInfo' : 'CreateHelp');
                console.log(createhelpurl);
                
                $http.post(createhelpurl,helpInformation,config)
                    .then(function (data, status, headers, config) {
                        $scope.help={};
                        $state.go('helplist');
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    });    
})();
