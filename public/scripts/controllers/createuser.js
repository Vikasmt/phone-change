(function(){
var app = angular.module("mainApp");
app.controller("createCtrl", function($scope, $http, $state, $stateParams, apiUrl) {
     var name = $('input[name="name"]').val();
if (name.length < 3)
{
    alert('Please enter a name 3 characters or more.');
    return false;
}
//validate email
var email = $('input[name="email"]').val(),
    emailReg = /^([w-.]+@([w-]+.)+[w-]{2,4})?$/;
if(!emailReg.test(email) || email == '')
{
     alert('Please enter a valid email address.');
     return false;
}
//validate phone
var phone = $('input[name="phone"]').val(),
    intRegex = ([0-9]{10})|(\([0-9]{3}\)\s+[0-9]{3}\-[0-9]{4});
if((phone.length < 6) || (!intRegex.test(phone)))
{
     alert('Please enter a valid phone number.');
     return false;
}
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
