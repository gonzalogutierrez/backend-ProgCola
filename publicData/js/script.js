'use strict';
const app = angular.module('Login',[]);

/*---------------------------------------------------------------------------------
    Making service to run ajax Start
---------------------------------------------------------------------------------*/
app.service('runAjax', ['$http', function ($http) {
    this.runAjaxFunction = function(request,callback){

        const url = request.url;
        const data = request.data;
        const headers = request.headers;

        $http.post(url,data,headers).success(function(data, status, headers, config) {
            callback(data);
        })
        .error(function(err){
            callback(err);
        });
    }
}]);
/*---------------------------------------------------------------------------------
    Making service to run ajax End
---------------------------------------------------------------------------------*/
app.controller('LoginController', function ($scope,$window,runAjax) {

    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    $scope.Login = function(){

        if(! regEx.test($scope.email)){

            alert(`Enter valid Email`);
        }else if($scope.password == ""){

            alert(`Enter valid Password`);
        }else{

            const Data={
                url:'/login',
                data : {
                    email : $scope.email,
                    password : $scope.password
                }
            }
            runAjax.runAjaxFunction(Data,function(response){
                if(response.isUserExists){
                    $window.location.href ="/home";                   
                }else{
                    alert(`Login Failed`);
                }
            });
        }
    }
});