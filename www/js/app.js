var readerApp = angular.module('readerApp', [
  'ngSanitize', 'angular-carousel'
]);


readerApp.config( [
          '$compileProvider',
          function( $compileProvider )
          {   
              $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|cdvfile|filesystem:http):/);	//kvuli obrazkum z filesystemu
          }
      ]);

function backButtonHandler(e) {
	e.preventDefault();
}

readerApp.run(['$rootScope', 'dbService', 
    function($rootScope, dbService) {
		
    document.addEventListener('deviceready', function() {
    	    	
    	console.log("deviceready()");

    	document.addEventListener("backbutton", backButtonHandler, false);
    	
    	
    	if (!(parseFloat(window.device.version) >= 7)) {
    		window.plugins.spinnerDialog.show("", "Načítám ...");
    	}
    	if (window.device && parseFloat(window.device.version) >= 7) {
    		$('body').addClass('ios');
    		$('#vrsek').addClass('ios');
    	}
    	dbService.init();
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

readerApp.filter('datumPred2', function() {
	return function(input) {
		if (!input) return "";
		var dp = new Date(input);
		var dif = Math.round((new Date().getTime() - dp.getTime()) / (1000 * 60));
		// v dif jsou minuty
		if (dif<60) return "právě teď";
		if (dif<120) return "před hodinou";
		return "dnes";
	};
});

readerApp.filter('datumTermin', function() {
	return function(input) {
		if (!input) return "";
		try {
			var dd = eval(input.substr(8,2));
			var mm = eval(input.substr(5,2));
			var yyyy = input.substr(0,4);
			return dd + "." + mm + "." + yyyy;
		} catch (e) {
			return "";
		}
	};
});

readerApp.filter('datum', function() {
	return function(input) {
		input = input || '';
	    var out = "";
	    out = "před " + input;
	    return out;
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
    };
});

readerApp.directive('dir1', function() {
    return function(scope, element, attrs) {
    	elem.append('<h1>Test 1</h1>');
    	alert('ted');
    };
});

// ng-error se pouziva, kdyz je v cache smazany obrazek, aby ho to natahlo znovu
readerApp.directive('qngError', function() {
	return {
		compile: function($element, attr) {
			console.log("----------------------------- compile");
			var fn = $parse(attr['ng-error']);
			return function(scope, element, attr) {
	            element.on('error', function(event) {
	              scope.$apply(function() {
	                fn(scope, {$event:event});
	              });
	            });
	        };
	    }
	};
});

