

var showSpinner = 0;

readerApp.controller('novinkyController1', [ '$scope', '$routeParams', 'dbService', '$q', '$timeout', '$rootScope', '$location', '$route', 
                                        	function($scope, $routeParams, dbService, $q, $timeout, $rootScope, $location, $route) {
	console.log('controller()');
}]);



readerApp.controller('novinkyController', [ '$scope', 'dbService', '$q', '$timeout', '$rootScope', '$location',
	function($scope, dbService, $q, $timeout, $rootScope, $location) {

		console.log('controller() url:' + location.href);

		var notChangeUrl = false;
		$scope.slideIndex=1;
		$scope.items = [{txt:'asdasd'}];
		$scope.articleIndex = 0;

		
	    $scope.$on('$locationChangeSuccess', function(event) {
	    	
	    	console.log('$locationChangeSuccess:' + location.hash );
	    	if (notChangeUrl) {
	    		console.log('notChangeUrl');
	    		notChangeUrl=false;	    		
	    	} else {
	    		loadPage();
	    	}
	    });
	    
	    
	    function loadPage() {
	    	
	    	var s = $location.path();
	    	console.log('loadPage():' + s);
	    	if (!s) return;
			if (window.cordova && showSpinner) {
				window.plugins.spinnerDialog.show("", "Načítám ...");
			}			
	    	
	    	
	    	var sa = s.split("?");
	    	s = sa[0];
	    	sa = s.split("/");
	    	console.log('hash[0]:' + sa[0]);
	    	console.log('hash[1]:' + sa[1]);
	    	console.log('hash[2]:' + sa[2]);
	    	
	    	if (sa[1] == "") return;
	    	
	    	$scope.catId = sa[1];
	    	$scope.artId = sa[2];
	    	
	    	
    		console.log('controller::select article -1');
	    	dbService.transaction(function (tx) {
	    		console.log('controller::select article 1');
				tx.executeSql('SELECT id,title FROM category', [], querySuccess1, dbService.errorDB);
	    		tx.executeSql(
						'SELECT id, txt, image, title, date_pub, icon FROM article WHERE category_id=? ORDER BY date_pub DESC',
						[ $scope.catId ], querySuccess2,
						dbService.errorDB);
	    	}, dbService.errorDB);	    		    	
	    }
	    
	    
	    
	    $rootScope.$on('runApp', function(event) {
	    	console.log('controller::runApp():' + location.hash );
	    	if (!location.hash) {
	    		console.log('runApp: change url to /pro-inspiraci');
		    	$location.path("/pro-inspiraci").replace();
	    	}
	    	notChangeUrl=true;
	    	loadPage();
	    });

	    
	    $scope.$on('contentUpdated', function(event) {
	    	if (!$scope.artId) {
	    		loadPage();
	    	}
/*	    	
	    	return;
	    		location.hash = "#/" + $scope.catId + "?time=" + new Date().getTime();
	    		return;
		    	dbService.transaction(function (tx) {
		    		tx.executeSql(
							'SELECT id, txt, image, title, date_pub, icon FROM article WHERE category_id=?',
							[ $scope.catId ], querySuccess2,
							dbService.errorDB);
		    	}, dbService.errorDB);
	    	}
*/	    	
	    });
	    
	    

		// Query the success callback
		function querySuccess1(tx, results) {
			console.log('querySuccess1()');
			var len = results.rows.length;
			var ta = [];
			for (var i = 0; i < len; i++) {
				ta[i] = results.rows.item(i);
				if (ta[i].id == $scope.catId) {
					$rootScope.actualCategoryTitle = ta[i].title;
				}
			}
			$scope.categories = ta;
		}
		
	
		// Query the success callback
		function querySuccess2(tx, results) {
			console.log('querySuccess2()');
//			$scope.items.splice(2,$scope.items.length-2);
			
			var len = results.rows.length;
			
			var ta;
			var j;
			
			if ($scope.catId=="kontakt") {
				ta = [{txt:"prvni", isFirst:true}];
				j = 1; 
				
			} else {
				ta = [{txt:"prvni", isFirst:true},{txt:"druhy", isSecond:true}];
				j = 2; 
				
			}
			var tb = [];
			var artId = $scope.artId;
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
			$scope.$apply();
					
			if (idx>=0) {
				$scope.slideIndex = 2;
			} else {
				$scope.slideIndex = 1;	
			}
			
			$scope.$apply();
			if (len>0) {
				showSpinner = 1;
				if (window.cordova) {
					window.plugins.spinnerDialog.hide();
			        navigator.splashscreen.hide();
				}
			}
		}

		$scope.$watch('slideIndex', function(newValue, oldValue) {
			console.log('slideIndex new:' + newValue + ' old:' + oldValue);
			
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
					$location.path("/" + $scope.catId);
//					location.hash = "#/" + $scope.catId;
				}
			}

			
			if ((newValue==0) && $scope.catId) {
				if (location.hash != "#/") {
					notChangeUrl=true;
					$location.path("/");
//					location.hash = "#/";
				}
			}
			
			if (newValue>2) {
				$scope.items.splice(2,1);
				$scope.$apply();
				$scope.slideIndex=2;
				
			}
	      });

}]);


readerApp.filter('datum', function() {
  return function(input) {
    input = input || '';
    var out = "";
    out = "před " + input;
    return out;
  };
});

