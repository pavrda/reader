var readerApp = angular.module('readerApp', [
  'ngRoute', 'ngSanitize', 'angular-carousel'
]);

/*
readerApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/:catId', {
        templateUrl: 'tplCategories.html',
        controller: 'CategoryCtrl'
      }).
      when('/:catId/:artId', {
        templateUrl: 'tplArticle.html',
        controller: 'ArticleCtrl'
      }).
      otherwise({
        redirectTo: '/pro-inspiraci'
      });
  }]);
*/

readerApp.config(['$routeProvider',
                  function($routeProvider) {
                    $routeProvider.
                      when('/:catId', {
                        templateUrl: 'tplNovinky.html',
                        controller: 'novinkyController'
                      }).
                      when('/:catId/:artId', {
                        templateUrl: 'tplNovinky.html',
                        controller: 'novinkyController'
                      }).
                      otherwise({
                        redirectTo: '/pro-inspiraci'
                      });
                  }]);



angular.module('readerApp').run(['$rootScope', function($rootScope) {
    document.addEventListener('deviceready', function() {
        $rootScope.$apply(function() {
//        	alert('angular onready');
            $rootScope.myVariable = "variable value";
        });
    });
}]);
