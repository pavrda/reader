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

readerApp.config( [
          '$compileProvider',
          function( $compileProvider )
          {   
//              $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|filesystem:http):/);
              $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|filesystem:http):/);	//kvuli obrazkum z filesystemu
              // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
          }
      ]);

angular.module('readerApp').run(['$rootScope', function($rootScope) {
    document.addEventListener('deviceready', function() {
        $rootScope.$apply(function() {
//        	alert('angular onready');
            $rootScope.myVariable = "variable value";
        });
    });
}]);
