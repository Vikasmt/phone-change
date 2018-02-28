(function() {
    var app = angular.module("mainApp");



    app.controller("createCtrl", function($scope, $http, $state, $cookieStore, $stateParams, apiUrl) {

        $scope.user = {};


        $scope.bindParameters = function() {
            $scope.user = angular.isDefined($stateParams.userdata) ? $stateParams.userdata : {};
            console.log($scope.user);
            $scope.mode = angular.isDefined($stateParams.mode) ? $stateParams.mode : 'C';
            console.log($scope.mode);
            $scope.language = ["English", "German", "Spanish", "French", "Italian", "Japanese", "Swedish", "Korean", "Chinese (Traditional)", "Chinese (Simplified)", "Portuguese (Brazilian)", "Dutch", "Danish", "Thai", "Finnish", "Russian", "Spanish (Mexican)", "Norwegian"];
            $scope.country = ["Denmark", "Ecuador", "Egypt", "El Salvador", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Herzegovina", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Ivory Coast", "Japan", "Jordan", "Kazakhstan", "Kenya", "Korea", "Kuwait", "Laos", "Latvia", "Lebanon", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Malaysia", "Maldives", "Mali", "Mauritius", "Malta", "Mexico", "Moldova", "Monaco", "Mongolia", "Morocco", "Mozambique", "Myanmar", "Namibia", "Netherlands", "New Caledonia", "Nepal", "New Zealand", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "US", "Uzbekistan", "Vatican City St.,Venezuela", "Vietnam", "Yemen", "Yugoslavia", "Zaire", "Zambia", "Zimbabwe", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", " Plurinational State of", "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Cameroon", "Canada", "Chad", "Chile", "China", "Colombia", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Barbados", "Antarctica", "Aland Islands", "Botswana", "Benin", "Bonaire Sint Eustatius and Saba", "British Indian Ocean Territory", "Bhutan", "Bouvet Island", "Antigua and Barbuda", "Belize", "Bahamas", "Bermuda"];
        }

        $scope.createUser = function(userInformation) {

            if (angular.isDefined(userInformation) && userInformation !== null) {
                var config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'token': $cookieStore.get('AccessToken')
                    }
                }

                var createuserurl = apiUrl + ($scope.mode === 'E' ? 'updateUserInfo' : 'CreateUser');
                console.log(createuserurl);

                $http.post(createuserurl, userInformation, config)
                    .then(function(data, status, headers, config) {
                        $scope.user = {};
                        $state.go('userlist');
                    })
                    .catch(function(data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    });
})();