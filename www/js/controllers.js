
readerApp.controller('CategoryListCtrl', [
	'$scope',
	'dbService',
	function($scope, dbService) {
		$scope.init = function() {
			dbService.transaction(function (tx) {
				tx.executeSql('SELECT id,title FROM category', [], querySuccess, dbService.errorDB);
			}, dbService.errorDB);
		};

		// Query the success callback
		function querySuccess(tx, results) {
			var len = results.rows.length;
			var ta = [];
			for (var i = 0; i < len; i++) ta[i] = results.rows.item(i);
			$scope.categories = ta;

			$scope.$apply(); // trigger digest
		}

		$scope.init();
		

}]);

readerApp.controller('CategoryCtrl', [
	'$scope',
	'$routeParams',
	'dbService',
	'$rootScope',
	function($scope, $routeParams, dbService, $rootScope) {
		$scope.init = function() {
			dbService.transaction(function(tx) {
				tx.executeSql(
						'SELECT id,title,image FROM article WHERE category_id=?',
						[ $routeParams.catId ], querySuccess,
						dbService.errorDB);
			}, dbService.errorDB);

			dbService.transaction(function(tx) {
				tx.executeSql(
						'SELECT title FROM category WHERE id=?',
						[ $routeParams.catId ], querySuccess2,
						dbService.errorDB);
			}, dbService.errorDB);
			
			
		};
	
		// Query the success callback
		function querySuccess(tx, results) {
			var len = results.rows.length;
			var ta = [];
			for (var i = 0; i < len; i++)
				ta[i] = results.rows.item(i);
			$scope.categories = ta;
			$scope.catId = $routeParams.catId;			
			$scope.$apply(); // trigger digest
		}

		function querySuccess2(tx, results) {
			var len = results.rows.length;
			if (len == 0) return;
			$rootScope.actualCategoryTitle = results.rows.item(0).title;
			$scope.catTitle = results.rows.item(0).title;
			$rootScope.$apply(); // trigger digest
//			$('#navRubriky').toggle('fast');
			$('#navRubriky').hide();

		}		
		$scope.init();
			
}]);

readerApp.controller('ArticleCtrl234', [ '$scope', '$routeParams', 'dbService',
	function($scope, $routeParams, dbService) {
		
		$scope.init = function() {
			dbService.transaction(function(tx) {
				tx.executeSql(
						'SELECT txt FROM article WHERE id=?',
						[ $routeParams.artId ], querySuccess,
						dbService.errorDB);
			}, dbService.errorDB);
		};
	
		// Query the success callback
		function querySuccess(tx, results) {
			var len = results.rows.length;
			if (len == 0) {
				$scope.htmlContent = '&nbsp;';
				
			} else {
				$scope.htmlContent = results.rows.item(0).txt;
			}
			$scope.$apply(); // trigger digest
		}
	
		$scope.init();
		
		
}]);

readerApp.controller('ArticleCtrl', [ '$scope', '$routeParams', 'dbService', '$q', '$timeout',
  	function($scope, $routeParams, dbService, $q, $timeout) {

	
		$scope.articleIndex = 0;
	
		
  		$scope.init = function() {
  			dbService.transaction(function(tx) {
  				tx.executeSql(
  						'SELECT id, txt, image FROM article WHERE category_id=?',
  						[ $routeParams.catId ], querySuccess,
  						dbService.errorDB);
  			}, dbService.errorDB);
  		};
  	
  		// Query the success callback
  		function querySuccess(tx, results) {
  			
			var len = results.rows.length;
			var ta = [];
			var artId = $routeParams.artId;
			var idx = 0;
			for (var i = 0; i < len; i++) {
				ta[i] = results.rows.item(i);
				if (ta[i].id == artId) { idx = i;}
			}
			$scope.articles = ta;
			$scope.$apply();
			$scope.articleIndex = idx;
			$scope.$apply();
  		}

  		$scope.init();

	}]);

readerApp.controller('demoController', function($scope, $http, $q, $timeout) {
	$scope.slideIndex=1;

	$scope.$watch('slideIndex', function(newValue, oldValue) {
		console.log('watch:' + newValue + ':' + oldValue);
		if (newValue>2) {
			$scope.items.splice(2,1);
			$scope.$apply();
			$scope.slideIndex=2;
			
		}
		if ((newValue==9) && (oldValue==0)) {
			$scope.slideIndex=1;
			$scope.$apply();
		}
//        alert('zmena:' + newValue + ':' + oldValue);
      });
	
	$scope.items = [
	  {txt:"0"},
	  {txt:"1"},
	  {txt:"2"},
	  {txt:"3"},
	  {txt:"4"},
	  {txt:"5"},
	  {txt:"6"},
	  {txt:"7"},
	  {txt:"8"}
    ];
	

  });

var showSpinner = 0;

readerApp.controller('novinkyController', [ '$scope', '$routeParams', 'dbService', '$q', '$timeout', '$rootScope', '$location', '$route', 
	function($scope, $routeParams, dbService, $q, $timeout, $rootScope, $location, $route) {

//		$('#preLoaderDiv').show();
//		navigator.notification.activityStart();
//		if (window.device && (showSpinner || !(parseFloat(window.device.version) >= 7))) window.plugins.spinnerDialog.show();
		if (window.device && showSpinner) window.plugins.spinnerDialog.show();
	
	
		var lastRoute = $route.current;
		var notChangeUrl = false;
	    $scope.$on('$locationChangeSuccess', function(event) {
	    	if (notChangeUrl) {
	    		$route.current = lastRoute;
	    		notChangeUrl=false;
	    		return;
	    	}
	    });
	    
	    $scope.$on('contentUpdated', function(event) {
	    	if (!$routeParams.artId) {
		    	dbService.transaction(function (tx) {
		    		tx.executeSql(
							'SELECT id, txt, image, title, date_pub FROM article WHERE category_id=?',
							[ $routeParams.catId ], querySuccess2,
							dbService.errorDB);
		    	}, dbService.errorDB);
	    	}
	    });
	    
	    
		$scope.slideIndex=1;
		$scope.items = [{txt:'asdasd'}];

	
		$scope.articleIndex = 0;

		$scope.init = function() {
			dbService.transaction(function (tx) {
				tx.executeSql('SELECT id,title FROM category', [], querySuccess1, dbService.errorDB);
			}, dbService.errorDB);
		};

		// Query the success callback
		function querySuccess1(tx, results) {
			var len = results.rows.length;
			var ta = [];
			for (var i = 0; i < len; i++) {
				ta[i] = results.rows.item(i);
				if (ta[i].id == $routeParams.catId) {
					$rootScope.actualCategoryTitle = ta[i].title;
				}
			}
			$scope.categories = ta;

			
			tx.executeSql(
					'SELECT id, txt, image, title, date_pub, icon FROM article WHERE category_id=? ORDER BY date_pub DESC',
					[ $routeParams.catId ], querySuccess2,
					dbService.errorDB);
		}
		
	
		// Query the success callback
		function querySuccess2(tx, results) {
//			$scope.items.splice(2,$scope.items.length-2);
			
			var len = results.rows.length;
			
			var ta;
			var j;
			
			if ($routeParams.catId=="kontakt") {
				ta = [{txt:"prvni", isFirst:true}];
				j = 1; 
				
			} else {
				ta = [{txt:"prvni", isFirst:true},{txt:"druhy", isSecond:true}];
				j = 2; 
				
			}
			var tb = [];
			var artId = $routeParams.artId;
			var idx = -1;
//			alert(len);
			var showDateLimit = new Date().getTime() - 1000*60*60*24;
			for (var i = 0; i < len; i++) {
				tb[i] = results.rows.item(i);
				if (tb[i].id == artId) {
					artId=false;
					idx=1;
				}
				if (!artId) {
					// pokud v textu neni titulek, pridej ho tam
					ta[j] = tb[i];
					var t = ta[j].txt;
					if (t.indexOf("<h1") < 0) t = "<h1>" + ta[j].title + "</h1>" + t;
					ta[j].txt2 = t;
					ta[j].isArticle=true;
					ta[j].date_show=((new Date(ta[j].date_pub).getTime()) >  showDateLimit);
					j++;
				}
			}
			ta[1].articles = tb;
			$scope.items = ta;
			$scope.catId = $routeParams.catId;
			$scope.$apply();
			if (idx>=0) {
				$scope.slideIndex = 2;
			} else {
				$scope.slideIndex = 1;	
			}
			
			$scope.$apply();
//			alert('hotovo');
			if (len>0) {
				showSpinner = 1;
				$('#preLoaderDiv').hide();
				if (window.cordova) {
					window.plugins.spinnerDialog.hide();
			        navigator.splashscreen.hide();
				}
			}
		}
		
		$scope.$watch('slideIndex', function(newValue, oldValue) {
			console.log('watchx:' + newValue + ':' + oldValue);
			
			if (newValue>1) {
				if (location.hash != "#/" + $scope.catId + "/" + $scope.items[newValue].id) {
					notChangeUrl=true;
					$location.path("/" + $scope.catId + "/" + $scope.items[newValue].id).replace();
				}
				$("div.articleItem2").removeClass('selArticle');
				var ai = $("div.articleItem[data-id='" + $scope.items[newValue].id + "']");
				var pi = ai.parent();
				ai.addClass('selArticle');
				var sy = ai.offset().top + pi.scrollTop() - pi.height()/2; // - 50;
				console.log("parent:" + pi.scrollTop());
				console.log("offset:" + ai.offset().top);
				console.log("scrollto:" + sy );
				pi.scrollTop(sy);
			}
			
			if ((newValue==1) && $scope.catId) {
				if (location.hash != "#/" + $scope.catId) {
					notChangeUrl=true;
					location.hash = "#/" + $scope.catId;
				}
			}

			
			if ((newValue==0) && $scope.catId) {
				if (location.hash != "#/") {
					notChangeUrl=true;
					location.hash = "#/";
				}
			}
			
			
			if (newValue>2) {
				$scope.items.splice(2,1);
				$scope.$apply();
				$scope.slideIndex=2;
				
			}
			
	      });
		

		$scope.init();

}]);


readerApp.filter('datum', function() {
  return function(input) {
    input = input || '';
    var out = "";
    out = "před " + input;
    return out;
  };
});

