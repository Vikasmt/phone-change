(function(){
var app = angular.module("mainApp");
app.controller("HelpCtrl", function($scope, $http, $state, apiUrl) {
        $scope.helplist = [];
        $scope.helpMainList = [];
    
        $scope.getHelpdata = function () {
            var getHelpUrl = apiUrl + 'getHelpdata';
             var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
            $http.get(getHelpUrl, config)
                .then(function (data, status, config) {
                    var Help = angular.fromJson(angular.toJson(data));
                    angular.forEach(Help.data, function(Help){
                       Help.eng_question = Help.eng_question.trim();
                       Help.eng_answer = Help.eng_answer.trim();
                       Help.ita_question = Help.ita_question.trim();
                       Help.ita_answer = Help.ita_answer.trim();
                       Help.email = Help.email.trim();
                       Help.helpcontactnum = Help.helpcontactnum.trim();
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
                        'Content-Type': 'application/json'
                        }
                }
                
                var updateHelpurl = apiUrl + 'updateHelpInfo';
                console.log(updateHelpurl);
                
                $http.post(updateHelpurl, HelpInfo, config)
                    .then(function (data, status, headers, config) {
                        $scope.getHelpdata();
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    
        
    });    
})();
