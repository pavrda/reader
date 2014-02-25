
readerApp.factory('dbService', ['$http', function($http) {

	var loaderCounter = 0;
	
    var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
	db.errorDB = function(tx, err) {
	    alert("Error processing SQL: " + err.message);
	};
    
    
    db.transaction(populateDB, function (err) {}, successDB);
	
	function populateDB(tx) {
	    tx.executeSql('DROP TABLE IF EXISTS category');
	    tx.executeSql('CREATE TABLE category (poradi unique, id unique, title)');
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (1, 'o-nas', 'O Eyrie')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (2, 'poradenstvi-a-sluzby', 'Naše služby')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (3, 'pro-inspiraci', 'Pro inspiraci')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (4, 'doporucujeme', 'Doporučujeme')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (5, 'osobnosti', 'Osobnosti')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (6, 'kontakt', 'Kontakt')");
	    
	    tx.executeSql('DROP TABLE IF EXISTS article');
	    tx.executeSql('CREATE TABLE IF NOT EXISTS article (id unique, poradi unique, category_id, title, txt)');
	
	}
	
	function stahni() {
		if (loaderCounter >= loader.length) return stazeno();
		var s = loader[loaderCounter].url;
		var category = loader[loaderCounter].category;
		var sa=s.split('/');
		s = sa[sa.length-1];
		var sid = s;
		s = 'texty/' + s;
		
	    $http({method: 'GET', url: s}).
	    success(function(data, status, headers, config) {
	    	var i = data.indexOf('<article class="text">');
	    	var j = data.indexOf('   <span class="clear-box"></span>');
	    	var txt = data.substring(i + 24,j);
	    	
	    	i = data.indexOf('<title>');
	    	j = data.indexOf('</title>');
	    	var title = data.substring(i + 7,j);
	    	j = title.indexOf(' |');
	    	if (j) title = title.substring(0,j);
//	    	title = title.replace(' | Eyrie - centrum moderního podnikání','');
//	    	title = title.replace(' | Workshopy a semináře','');

	    	
//		    alert('good:' + title);

		    db.transaction(function (tx) {
		    	tx.executeSql('INSERT INTO article (poradi, category_id, id, title, txt) VALUES (?,?,?,?,?)', [loaderCounter, category, sid, title, txt]);
		    	loaderCounter ++;
		    	stahni();
		    });
	    }).
	    error(function(data, status, headers, config) {
		    alert('bad');
	      // called asynchronously if an error occurs
	      // or server returns response with an error status.
	    });
	    
	}
	
	
	function successDB(){
		stahni();
	}

	function stazeno() {
		window.location.hash="";
	}
	
	
	
	return db;
}]);
