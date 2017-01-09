(function(){
var app = angular.module("mainApp");
app.controller("userCtrl", function($scope, $http, apiUrl) {
        $scope.statuslist = [{"status": "All"},{"status": "Active"},{"status": "InActive"}]
    
        $scope.getUsers = function () {
            var getUsersUrl = apiUrl + 'getUsers';
             var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
            $http.get(getUsersUrl, config)
                .then(function (data, status, config) {
                    var users = angular.fromJson(angular.toJson(data));
                    angular.forEach(users.data, function(user){
                       user.firstname = user.firstname.trim();
                       user.lastname = user.lastname.trim();
                       user.email = user.email.trim();
                       user.phone = user.phone.trim();
                       user.isEdit = false; 
                    });
                    $scope.userlist = angular.copy(users.data);
                })
                .catch(function (data, status, config) {
                    console.log(data);
                    alert('failed to retreive users list');
                });
        };
        
        $scope.updateStatus = function(userInfo) {
            if(angular.isDefined(userInfo) && userInfo !== null) {
                var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
                
                var updateStatusurl = apiUrl + 'updateStatus?id=\''+userInfo.id+'\'';
                console.log(updateStatusurl);
                
                $http.put(updateStatusurl, null, config)
                    .then(function (data, status, headers, config) {
                        $scope.getUsers();
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
        
        $scope.updateUser = function(userInfo) {
            if(angular.isDefined(userInfo) && userInfo !== null) {
                var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
                
                var updateStatusurl = apiUrl + 'updateUserInfo';
                console.log(updateStatusurl);
                
                $http.post(updateStatusurl, userInfo, config)
                    .then(function (data, status, headers, config) {
                        $scope.getUsers();
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    });    
})();
