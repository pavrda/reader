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
                      when('/', {
                        templateUrl: 'tplNovinky.html',
                        controller: 'novinkyController'
                      }).
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

readerApp.run(['$rootScope', 'dbService', 
    function($rootScope, dbService) {
	
	$rootScope.ahoj = function() {
		alert('ahoj');
	};
	
    document.addEventListener('deviceready', function() {
        $rootScope.$apply(function() {
        	dbService.init();
        });
    });
}]);

readerApp.filter('datumPred', function() {
	return function(input) {
		if (!input) return "";
		var dp = new Date(input);
		var dif = Math.round((new Date().getTime() - dp.getTime()) / (1000 * 60));
//		if (dif<0) return "před chvílí";
		if (dif<2) return "před minutou";
		if (dif<60) return "před " + dif + " minutami";
		dif = Math.round(dif/60);
		if (dif<2) return "před hodinou";
		if (dif<24) return "před " + dif + " hodinami";
		dif = Math.round(dif/24);
		if (dif<2) return "před 1 dnem";
		if (dif<30) return "před " + dif + " dny";
		dif = Math.round(dif/30);
		if (dif<2) return "před měsícem";
		if (dif<12) return "před " + dif + " měsíci";
		dif = Math.round(dif/12);
		if (dif<2) return "před rokem";
		return "před " + dif + " lety";
	};
});


readerApp.directive('showMenu', function() {
    return function(scope, element, attrs) {
        $(element).click(function(event) {
        	alert('ahoj');

        	$('#navRubriky').show();
//        	$('#navRubriky').toggle('fast');
        	event.stopPropagation();         	
            event.preventDefault();
        });
    }
})

