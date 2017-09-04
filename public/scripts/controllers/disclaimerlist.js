(function(){
var app = angular.module("mainApp");
app.controller("DisclaimerCtrl", function($scope, $http, $state, apiUrl) {
        $scope.helplist = [];
        $scope.helpMainList = [];
    
        $scope.getDisclaimercontent = function () {
            var getDisclaimerUrl = apiUrl + 'getDisclaimercontent';
             var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
            $http.get(getDisclaimerUrl, config)
                .then(function (data, status, config) {
                    var Disclaimer = angular.fromJson(angular.toJson(data));
                    angular.forEach(Disclaimer.data, function(Disclaimer){
                       Disclaimer.country = Disclaimer.country.trim();
                       Disclaimer.language = Disclaimer.language.trim();
                       Disclaimer.content = Disclaimer.content.trim();
                    });
                    $scope.Disclaimerlist = angular.copy(Disclaimer.data);
                    $scope.DisclaimerMainList = angular.copy(Disclaimer.data);
                })
                .catch(function (data, status, config) {
                    console.log(data);
                    alert('failed to retreive Help list');
                });
        };
    
        $scope.redirectToEdit = function(DisclaimerInfo){
            $state.go('createDisclaimer', {'disclaimerdata':DisclaimerInfo, 'mode':'E'});
        }
        
        
        $scope.updateDisclaimer = function(DisclaimerInfo) {
            if(angular.isDefined(DisclaimerInfo) && DisclaimerInfo !== null) {
                var config = {
                    headers : {
                        'Content-Type': 'application/json'
                        }
                }
                
                var updateDisclaimerurl = apiUrl + 'updateDisclaimerInfo';
                console.log(updateDisclaimerurl);
                
                $http.post(updateDisclaimerurl, DisclaimerInfo, config)
                    .then(function (data, status, headers, config) {
                        $scope.getDisclaimercontent();
                    })
                    .catch(function (data, status, header, config) {
                        console.log(data);
                    });
            }
        };
    
        
    });    
})();
