(function () {
    var app = angular.module("mainApp");
    app.controller("userCtrl", function ($scope, $http, $state, $cookieStore, apiUrl) {
        $scope.userlist = [];
        $scope.usersMainList = [];

        $scope.getUsers = function () {
            $scope.selectedOption = "All";
            var getUsersUrl = apiUrl + 'getUsers';
            var config = {
                headers: {
                    'Content-Type': 'application/json',
                    'token': $cookieStore.get('AccessToken')
                }
            }
            $http.get(getUsersUrl, config)
                .then(function (data, status, config) {
                    var users = angular.fromJson(angular.toJson(data));
                    angular.forEach(users.data, function (user) {
                        user.firstname = user.firstname !== null ? user.firstname.trim() : '';
                        user.lastname = user.lastname !== null ? user.lastname.trim() : '';
                        user.email = user.email !== null ? user.email.trim() : '';
                        user.phone = user.phone !== null ? user.phone.trim() : '';
                        user.isEdit = false;
                    });
                    $scope.userlist = angular.copy(users.data);
                    $scope.usersMainList = angular.copy(users.data);
                })
                .catch(function (data, status, config) {
                    console.log(data);
                    alert('failed to retreive users list');
                });
        };

        $scope.redirectToEdit = function (userInfo) {
            $state.go('createuser', {
                'userdata': userInfo,
                'mode': 'E'
            });
        }

        $scope.updateStatus = function (userInfo) {
            if (angular.isDefined(userInfo) && userInfo !== null) {
                var config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'token': $cookieStore.get('AccessToken')
                    }
                }

                var updateStatusurl = apiUrl + 'updateStatus?id=\'' + userInfo.id + '\'';
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

        $scope.updateUser = function (userInfo) {
            if (angular.isDefined(userInfo) && userInfo !== null) {
                var config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'token': $cookieStore.get('AccessToken')
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

        $scope.filterUsers = function (option) {
            $scope.userlist = [];
            if (option === "All") {
                $scope.userlist = angular.copy($scope.usersMainList);
            } else if (option === "Active") {
                angular.forEach($scope.usersMainList, function (user) {
                    if (user.active === true) {
                        $scope.userlist.push(user);
                    }
                });
            } else if (option === "InActive") {
                angular.forEach($scope.usersMainList, function (user) {
                    if (user.active === false) {
                        $scope.userlist.push(user);
                    }
                });
            }
        }
    });
})();