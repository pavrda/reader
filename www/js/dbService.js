
readerApp.factory('dbService', ['$http', '$route', '$q', '$timeout', function($http, $route, $q, $timeout) {

	var loaderCounter = 0;
	
    var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
	db.errorDB = function(tx, err) {
		if (err && err.message) {
		    alert("Error processing SQL: " + err.message);
		} else {
		    alert("Error processing SQL: " + tx);
		}
	};
    

    db.transaction(populateDB, stazeno, successDB);
	
	function populateDB(tx) {
//	    tx.executeSql('DROP TABLE IF EXISTS category');
	    tx.executeSql('CREATE TABLE category (poradi unique, id unique, title)');
		$('#preLoaderDiv').show();

	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (1, 'o-nas', 'O Eyrie')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (2, 'poradenstvi-a-sluzby', 'Naše služby')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (3, 'pro-inspiraci', 'Pro inspiraci')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (4, 'doporucujeme', 'Doporučujeme')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (5, 'osobnosti', 'Osobnosti')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (6, 'kontakt', 'Kontakt')");
	    
	    tx.executeSql('DROP TABLE IF EXISTS article');
	    tx.executeSql('CREATE TABLE IF NOT EXISTS article (id unique, poradi unique, category_id, title, txt, image)');
	
	}
	
	function stahni() {
		if (loaderCounter >= loader.length) return stazeno();
		var s = loader[loaderCounter].url;
		var category = loader[loaderCounter].category;
		var sa=s.split('/');
		s = sa[sa.length-1];
		var sid = s;
		s = 'texty/' + s;

		var image = loader[loaderCounter].image;
		
		
	    $http({method: 'GET', url: s}).
	    success(function(data, status, headers, config) {
	    	var i = data.indexOf('<article class="text">');
	    	var j = data.indexOf('   <span class="clear-box"></span>');
	    	var txt = data.substring(i + 24,j);
	    	
	    	txt = txt.replace("/files/uploads/workshopy/", "texty/");
	    	txt = txt.replace("/files/uploads/pro%20inspiraci/", "texty/");
	    	txt = txt.replace("/files/uploads/", "texty/");
	    	
	    	
	    	i = data.indexOf('<title>');
	    	j = data.indexOf('</title>');
	    	var title = data.substring(i + 7,j);
	    	j = title.indexOf(' |');
	    	if (j) title = title.substring(0,j);

		    db.transaction(function (tx) {
		    	tx.executeSql('INSERT INTO article (poradi, category_id, id, title, txt, image) VALUES (?,?,?,?,?,?)', [loaderCounter, category, sid, title, txt, image]);
		    	console.log('123');
		    	loaderCounter ++;
		    	stahni();
		    });
	    }).
	    error(function(data, status, headers, config) {
		    alert('Problem');
	      // called asynchronously if an error occurs
	      // or server returns response with an error status.
	    });
	    
	}
	
	
	function successDB(){
		stahni();
	}

	function stazeno() {
		$('#preLoaderDiv').hide();
		$route.reload();
	}
	
	
	return db;
}]);
