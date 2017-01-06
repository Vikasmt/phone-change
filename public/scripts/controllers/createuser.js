(function(){
var app = angular.module("mainApp");
app.controller("createCtrl", function($scope, $http, apiUrl) {
        $scope.user={};
        $scope.createUser = function(userInformation) {
            if(angular.isDefined(userInformation) && userInformation !== null) {
                var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
                
                var createuserurl = apiUrl + 'CreateUser';
                
                $http.post(createuserurl,userInformation,config)
                    .then(function (data, status, headers, config) {
                        $scope.user={};
                        alert('Success');
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    });    
})();
