(function(){
var app = angular.module("mainApp");
app.controller("HelpCtrl", function($scope, $http, $state, apiUrl) {
        $scope.helplist = [];
        $scope.helpMainList = [];
    
        $scope.getHelp = function () {
            $scope.selectedOption = "All";
            var getHelpUrl = apiUrl + 'getHelpcontent';
             var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
            $http.get(getHelpUrl, config)
                .then(function (data, status, config) {
                    var Help = angular.fromJson(angular.toJson(data));
                    angular.forEach(Help.data, function(Help){
                       Help.title = Help.title.trim();
                       Help.discription = Help.discription.trim();
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
            $state.go('createhelp', {'helpdata':userInfo, 'mode':'E'});
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
                        $scope.getHelp();
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    
        
    });    
})();
