(function(){
var app = angular.module("mainApp");
app.controller("HelpCtrl", function($scope, $http, $state, $cookieStore, apiUrl) {
        $scope.helplist = [];
        $scope.helpMainList = [];
    
        $scope.getHelpcontent = function () {
            var getHelpUrl = apiUrl + 'getHelpcontent';
             var config = {
                    headers : {
                        'Content-Type': 'application/json',
                        'token': $cookieStore.get('AccessToken')
                        }
                }
            $http.get(getHelpUrl, config)
                .then(function (data, status, config) {
                    var Help = angular.fromJson(angular.toJson(data));
                    angular.forEach(Help.data, function(Help){
                       Help.eng_question = Help.eng_question;
                       Help.eng_answer = Help.eng_answer;
                       Help.ita_question = Help.ita_question.trim();
                       Help.ita_answer = Help.ita_answer;
                       Help.email = Help.email;
                       Help.helpcontactnum = Help.helpcontactnum;
                    });
                    $scope.Helplist = angular.copy(Help.data);
                    $scope.HelpMainList = angular.copy(Help.data);
                })
                .catch(function (data, status, config) {
                    console.log(data);
                    alert('failed to retreive Help list');
                });
        };
    
        $scope.redirectToEdit = function(HelpInfo){
            $state.go('createHelp', {'helpdata':HelpInfo, 'mode':'E'});
        }
        
        
        $scope.updateHelp = function(HelpInfo) {
            if(angular.isDefined(HelpInfo) && HelpInfo !== null) {
                var config = {
                    headers : {
                        'Content-Type': 'application/json',
                        'token': $cookieStore.get('AccessToken')
                        }
                }
                
                var updateHelpurl = apiUrl + 'updateHelpInfo';
                console.log(updateHelpurl);
                
                $http.post(updateHelpurl, HelpInfo, config)
                    .then(function (data, status, headers, config) {
                        $scope.getHelpcontent();
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    
        
    });    
})();
