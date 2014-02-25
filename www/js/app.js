var readerApp = angular.module('readerApp', [
  'ngRoute', 'ngSanitize'
]);

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

