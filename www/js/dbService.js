
readerApp.factory('dbService', ['$http', '$route', '$timeout', '$rootScope', function($http, $route, $timeout, $rootScope) {

	var fs = null;		// filesystem
	var dir = null;		// dir
	var db = null;		// database
	
	var loaderCounter = 0;
	var lastSync = 0;
	var nowSync = 0;
	var appBaseURL = "";
	
    db = window.openDatabase("Eyrie", "1.0", "Eyrie", 200000);
	
	function initFs() {		
		var s = location.origin + location.pathname;
		var pi = s.lastIndexOf("/");
		s = s.substring(0,pi);
		appBaseURL = s.substring(0, pi + 1);
		console.log("appBaseURL:" + appBaseURL);
		
		if (is_cordova()) {
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem, onError);
		} else {
			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
			window.requestFileSystem(window.webkitStorageInfo.TEMPORARY, 5*1024*1024, gotFileSystem, onError);
		}
	};

	function gotFileSystem(lfs) {
		fs = lfs;
		fs.root.getDirectory('eyrie', {create: true, exclusive: false}, gotDirectory, onError);
	}
	
	function gotDirectory(ldir) {
		dir = ldir;
		initDb();
	}
		
	
	function initDb(){
		var tstamp = window.localStorage.getItem('eyrie-timestamp');
		if (!tstamp) {
			console.log('first run - create db structure');
			db.transaction(createDbStructure, db.errorDB, function() {
				stahni(initialLoaded, initialLoaded);
			});
		} else {
			console.log('not first run - check for updates');
			prepareSync();
		}
	}
	

	function initialLoaded(e) {
		console.log('initialLoaded()');
		window.localStorage.setItem('eyrie-timestamp', 1); // aby se npriste nevytvarela databaze, ale aby se provedla synchronizace
		prepareSync();
//		runApp();
	}
	
	
	
	/***********************************************
	tiny-sha1 r4
	MIT License
 	http://code.google.com/p/tiny-sha1/
	***********************************************/
	function SHA1(s){function U(a,b,c){while(0<c--)a.push(b)}function L(a,b){return(a<<b)|(a>>>(32-b))}function P(a,b,c){return a^b^c}function A(a,b){var c=(b&0xFFFF)+(a&0xFFFF),d=(b>>>16)+(a>>>16)+(c>>>16);return((d&0xFFFF)<<16)|(c&0xFFFF)}var B="0123456789abcdef";return(function(a){var c=[],d=a.length*4,e;for(var i=0;i<d;i++){e=a[i>>2]>>((3-(i%4))*8);c.push(B.charAt((e>>4)&0xF)+B.charAt(e&0xF))}return c.join('')}((function(a,b){var c,d,e,f,g,h=a.length,v=0x67452301,w=0xefcdab89,x=0x98badcfe,y=0x10325476,z=0xc3d2e1f0,M=[];U(M,0x5a827999,20);U(M,0x6ed9eba1,20);U(M,0x8f1bbcdc,20);U(M,0xca62c1d6,20);a[b>>5]|=0x80<<(24-(b%32));a[(((b+65)>>9)<<4)+15]=b;for(var i=0;i<h;i+=16){c=v;d=w;e=x;f=y;g=z;for(var j=0,O=[];j<80;j++){O[j]=j<16?a[j+i]:L(O[j-3]^O[j-8]^O[j-14]^O[j-16],1);var k=(function(a,b,c,d,e){var f=(e&0xFFFF)+(a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF),g=(e>>>16)+(a>>>16)+(b>>>16)+(c>>>16)+(d>>>16)+(f>>>16);return((g&0xFFFF)<<16)|(f&0xFFFF)})(j<20?(function(t,a,b){return(t&a)^(~t&b)}(d,e,f)):j<40?P(d,e,f):j<60?(function(t,a,b){return(t&a)^(t&b)^(a&b)}(d,e,f)):P(d,e,f),g,M[j],O[j],L(c,5));g=f;f=e;e=L(d,30);d=c;c=k}v=A(v,c);w=A(w,d);x=A(x,e);y=A(y,f);z=A(z,g)}return[v,w,x,y,z]}((function(t){var a=[],b=255,c=t.length*8;for(var i=0;i<c;i+=8){a[i>>5]|=(t.charCodeAt(i/8)&b)<<(24-(i%32))}return a}(s)).slice(),s.length*8))))}
	/***********************************************/
	
	
	function createDbStructure(tx) {
	    tx.executeSql('DROP TABLE IF EXISTS category');
	    tx.executeSql('CREATE TABLE category (poradi unique, id unique, title)');
//		$('#preLoaderDiv').show();

	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (1, 'o-nas', 'O Eyrie')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (2, 'poradenstvi-a-sluzby', 'Naše služby')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (3, 'pro-inspiraci', 'Pro inspiraci')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (4, 'doporucujeme', 'Doporučujeme')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (5, 'osobnosti', 'Osobnosti')");
	    tx.executeSql("INSERT INTO category (poradi, id, title) VALUES (6, 'kontakt', 'Kontakt')");
	    
	    tx.executeSql('DROP TABLE IF EXISTS article');
	    tx.executeSql('CREATE TABLE IF NOT EXISTS article (id unique, poradi unique, category_id, title, txt, image, date_pub, icon)');
	
	}
	
	function stahni(stazenoOk, stazenoErr) {
		if (loaderCounter >= loader.length) return stazenoOk();
		var sURL = loader[loaderCounter].url;
		var category = convertCategory(loader[loaderCounter].category);
		var sid = loader[loaderCounter].id;
		var date_pub = new Date(loader[loaderCounter].date_pub).toISOString();
		if (sURL.substring(0,7) != "http://") {
			// stahuji neco z aplikace
			sURL = appBaseURL + "/" + sURL;
		}
		baseURL = sURL.substring(0, sURL.lastIndexOf("/") + 1);
		console.log("sURL:" + sURL);
		console.log("baseURL:" + baseURL);

		var image = loader[loaderCounter].image_url;
		var icon = "";
		if (image) {
			icon = image = saveImg(image, sURL);
		} else {
			icon = saveImg(appBaseURL + "/" + "texty/clanek.jpg", sURL);
		}
		
		
	    $http({method: 'GET', url: sURL}).
	    success(function(data, status, headers, config) {
	    	var i = data.indexOf('<article class="text">');
	    	var j = data.indexOf('   <span class="clear-box"></span>');
	    	var txt = data.substring(i + 24,j);
	    	
	    	i = data.indexOf('<title>');
	    	j = data.indexOf('</title>');
	    	var title = data.substring(i + 7,j);
	    	j = title.indexOf(' |');
	    	if (j) title = title.substring(0,j);
	    	
	    	console.log("title:" + title);
	    	i=0;
	    	while( (i = txt.indexOf('<img', i))>=0 ) {
	    		i=txt.indexOf("src=",i);
	    		i += 4;
	    		var ch = txt.charAt(i);
	    		i++;
	    		j=txt.indexOf(ch, i);
	    		var src=txt.substring(i,j);
	    		console.log("src:" + src);
	    		
	    		src = saveImg(src, sURL);
	    		txt = txt.substring(0,i) + src + txt.substring(j);
	    		i++;
	    	}

		    db.transaction(function (tx) {
		    	tx.executeSql('INSERT OR REPLACE INTO article (poradi, category_id, id, title, txt, image, date_pub, icon) VALUES (?,?,?,?,?,?,?,?)', [sid, category, sid, title, txt, image, date_pub, icon]);
		    	console.log("Stazeno ok:" + sURL);
		    	loaderCounter ++;
		    	stahni(stazenoOk, stazenoErr);
		    }, function(e) {
		    	console.log("Chyba pri vkladani do db:" + e.message);
//		    	stazenoErr();
		    	});
	    }).
	    error(function(data, status, headers, config) {
	    	// neco nejde stahnout
	    	// priste to zkusim znovu, pro ted stahovani koncim
	    	console.log("Nelze stahnout:" + sURL);
	    	stazenoErr();
	    });
	    
	}
	
	
	
	// chyba pri tvorbe struktury databaze
	function errorDB(tx, err) {
		if (err && err.message) {
		    alert("Error processing SQL: " + err.message);
		} else {
		    alert("Error processing SQL: " + tx);
		}
	};


	// chyba pri inicializaci filesystemu
	function onError(e) {
		alert("chyba:" + e);
	}

	// chyba pri nacitani obrazku
	function error_callback(e) {
		alert("chyba:" + e);
	}
	
	
	var is_cordova = function() {
		return (typeof(cordova) !== 'undefined' || typeof(phonegap) !== 'undefined');
	};

	function convertCategory(s) {
		if (s == "Pro inspiraci") return "pro-inspiraci";
		if (s == "Aktuální nabídka") return "pro-inspiraci";
		if (s == "Osobnosti Eyrie") return "pro-inspiraci";
		if (s == "Příběhy firem") return "pro-inspiraci";
		if (s == "K přečtění") return "pro-inspiraci";
		if (s == "Již proběhlo") return "pro-inspiraci";
		if (s == "K návštěvě") return "pro-inspiraci";
		if (s == "vývěska") return "pro-inspiraci";
		
		
		return s;
	}

	

	
	function saveImg(imgSrc, pageUrl) {
		var fname;
		if (!imgSrc) return "";
		
		var k = imgSrc.lastIndexOf(".");
		var ext = imgSrc.substring(k);
		var hash = SHA1(imgSrc);		
		var prefix = dir.toURL() + "/";
		var resUrl = prefix + hash + ext;

		if ((imgSrc.substring(0,7) == "http://") || (imgSrc.substring(0,8) == "https://") || (imgSrc.substring(0,7) == "file://"))  {
			fname = imgSrc;
		} else if (imgSrc.charAt(0) == "/"){
			var pi = pageUrl.indexOf("/");
			pi = pageUrl.indexOf("/", pi + 1);
			pi = pageUrl.indexOf("/", pi + 1);
			fname = pageUrl.substring(0, pi) + imgSrc;
		} else {
			var pi = pageUrl.lastIndexOf("/");
			fname = pageUrl.substring(0, pi+1) + imgSrc;			
		}

		console.log("saveImg: " + imgSrc + " -> " + fname + " -> " + prefix + hash + ext);

		
		if (is_cordova()) {
			var fileTransfer = new FileTransfer();

			fileTransfer.download(
			    fname,
			    dir.fullPath + "/" + hash + ext,
			    function(entry) {
//			    	alert('stazeno:' + fname);
			        console.log("download complete: " + entry.fullPath);
			    },
			    function(error) {
//			    	alert('error:' + error.code);
			        console.log("download error source " + error.source);
			        console.log("download error target " + error.target);
			        console.log("upload error code" + error.code);
			    },
			    false,
			    {
			    }
			);
			return resUrl;
		}
		
		var xhr = new XMLHttpRequest();
		xhr.open('GET', fname, true);
		xhr.responseType = 'blob';
		xhr.onload = function(event){
			if (xhr.response && (xhr.status == 200 || xhr.status == 0)) {
				dir.getFile(hash + ext, { create:true }, function(fileEntry) {
					fileEntry.createWriter(function(writer){

						writer.onerror = error_callback;
						writer.onwriteend = function() {
							console.log("Ulozeno:" + fname);
							};
						writer.write(xhr.response, error_callback);

					}, error_callback);
				}, error_callback);
			} else {
				console.log("nelze nacist obrazek 1:" + fname);
			}
		};
		xhr.onerror = function() {
			console.log("nelze nacist obrazek 2:" + fname);
		};
		xhr.send();
		return resUrl;
	};
	

	function prepareSync() {
		lastSync = window.localStorage.getItem('eyrie-timestamp');
		nowSync = Math.round(new Date().getTime()/1000);

		$http({method: 'GET', url: 'http://vyvoj.bzcompany.cz/everesta/eyrie.cz/rss/json/?changed=' + lastSync}).
	    success(function(data, status, headers, config) {
	    	loader = data;
	    	if (loader.length) {
	    		console.log('Pocet aktualizaci:' + loader.length);	    		
	    		loaderCounter=0;
	    		stahni(syncedOK, runApp);
	    	} else {
	    		console.log('Nic k aktualizaci');
	    		syncedOK();
	    	}
	    }).
	    error(function(data, status, headers, config) {
	    	console.log('Nelze nacist feed');
	    	// nejde stahnout feed, treba nejsem na netu
	    	runApp();
	    });

	}
	
	function syncedOK() {
		window.localStorage.setItem('eyrie-timestamp', nowSync);
		runApp();
	}
	
	function runApp() {
		if (window.cordova) {
			setTimeout(function() {
		        navigator.splashscreen.hide();
		    }, 1000);
		}
//		$timeout(prepareUpdate, 100000);
		$('#preLoaderDiv').hide();
		if (location.hash == "#/") {
			// na zacatku presmeruj na kategorii
			location.hash = "#/pro-inspiraci";
		} else {
			$route.reload();					
		}
	}
	
	function prepareUpdate() {
		$timeout(prepareUpdate, 10000);

		lastSync = window.localStorage.getItem('eyrie-timestamp');
		nowSync = Math.round(new Date().getTime()/1000);
		
		console.log(lastSync);
//		$http({method: 'GET', url: 'http://work.pavrda.cz/eyrie.js'}).
		$http({method: 'GET', url: 'http://vyvoj.bzcompany.cz/everesta/eyrie.cz/rss/json/?changed=' + lastSync}).
	    success(function(data, status, headers, config) {
	    	loader = data;
	    	if (loader.length) {
	    		console.log('Pocet aktualizaci:' + loader.length);	    		
	    		loaderCounter=0;
	    		stahni(updatedOK, updatedError);
	    	} else {
	    		console.log('Nic k aktualizaci');
	    		updatedOK();
	    	}
	    }).
	    error(function(data, status, headers, config) {
	    	console.log('Nelze nacist feed');
	    	// nejde stahnout feed, treba nejsem na netu
	    	updatedError();
	    });
		
	}
	
	function updatedOK() {
		window.localStorage.setItem('eyrie-timestamp', nowSync);
		if (loader.length) {
			$rootScope.$broadcast("contentUpdated");
		}
		console.log("update ok");
	}
	
	function updatedError() {
		console.log("update error");
	}
	
	db.init = function() {
		window.localStorage.removeItem('eyrie-timestamp');
//		window.localStorage.setItem('eyrie-timestamp', '2394924400');
		initFs();
	};
	
	// spust to - zacni s inicializaci filesystemu
	if (!window.cordova) {
		db.init();
	}

	return db;
}]);
