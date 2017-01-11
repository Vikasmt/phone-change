(function(){
var app = angular.module("mainApp");
app.controller("createCtrl", function($scope, $http, $window, apiUrl) {
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
                        $window.location.href = "https://phone-change-con.herokuapp.com";
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    });    
})();
