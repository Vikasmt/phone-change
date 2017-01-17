(function(){
var app = angular.module("mainApp");
      


app.controller("createCtrl", function($scope, $http, $state, $stateParams, apiUrl) {
  
        $scope.user={};
 
      
        $scope.bindParameters = function(){
            $scope.user = angular.isDefined($stateParams.userdata) ? $stateParams.userdata : {};
            console.log($scope.user);
            $scope.mode = angular.isDefined($stateParams.mode) ? $stateParams.mode : 'C';
            console.log($scope.mode);
        }
    
        $scope.createUser = function(userInformation) {
                
            if(angular.isDefined(userInformation) && userInformation !== null) {
                var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
                
                var createuserurl = apiUrl + ($scope.mode==='E' ? 'updateUserInfo' : 'CreateUser');
                console.log(createuserurl);
                
                $http.post(createuserurl,userInformation,config)
                    .then(function (data, status, headers, config) {
                        $scope.user={};
                        $state.go('userlist');
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    });    
})();
