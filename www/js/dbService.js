
readerApp.factory('dbService', ['$http', '$route', '$q', '$timeout', 'imgService', function($http, $route, $q, $timeout, imgService) {

	var loaderCounter = 0;
	
    var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
	db.errorDB = function(tx, err) {
		if (err && err.message) {
		    alert("Error processing SQL: " + err.message);
		} else {
		    alert("Error processing SQL: " + tx);
		}
	};
    
	
	/***********************************************
	tiny-sha1 r4
	MIT License
 	http://code.google.com/p/tiny-sha1/
	***********************************************/
	function SHA1(s){function U(a,b,c){while(0<c--)a.push(b)}function L(a,b){return(a<<b)|(a>>>(32-b))}function P(a,b,c){return a^b^c}function A(a,b){var c=(b&0xFFFF)+(a&0xFFFF),d=(b>>>16)+(a>>>16)+(c>>>16);return((d&0xFFFF)<<16)|(c&0xFFFF)}var B="0123456789abcdef";return(function(a){var c=[],d=a.length*4,e;for(var i=0;i<d;i++){e=a[i>>2]>>((3-(i%4))*8);c.push(B.charAt((e>>4)&0xF)+B.charAt(e&0xF))}return c.join('')}((function(a,b){var c,d,e,f,g,h=a.length,v=0x67452301,w=0xefcdab89,x=0x98badcfe,y=0x10325476,z=0xc3d2e1f0,M=[];U(M,0x5a827999,20);U(M,0x6ed9eba1,20);U(M,0x8f1bbcdc,20);U(M,0xca62c1d6,20);a[b>>5]|=0x80<<(24-(b%32));a[(((b+65)>>9)<<4)+15]=b;for(var i=0;i<h;i+=16){c=v;d=w;e=x;f=y;g=z;for(var j=0,O=[];j<80;j++){O[j]=j<16?a[j+i]:L(O[j-3]^O[j-8]^O[j-14]^O[j-16],1);var k=(function(a,b,c,d,e){var f=(e&0xFFFF)+(a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF),g=(e>>>16)+(a>>>16)+(b>>>16)+(c>>>16)+(d>>>16)+(f>>>16);return((g&0xFFFF)<<16)|(f&0xFFFF)})(j<20?(function(t,a,b){return(t&a)^(~t&b)}(d,e,f)):j<40?P(d,e,f):j<60?(function(t,a,b){return(t&a)^(t&b)^(a&b)}(d,e,f)):P(d,e,f),g,M[j],O[j],L(c,5));g=f;f=e;e=L(d,30);d=c;c=k}v=A(v,c);w=A(w,d);x=A(x,e);y=A(y,f);z=A(z,g)}return[v,w,x,y,z]}((function(t){var a=[],b=255,c=t.length*8;for(var i=0;i<c;i+=8){a[i>>5]|=(t.charCodeAt(i/8)&b)<<(24-(i%32))}return a}(s)).slice(),s.length*8))))}
	/***********************************************/
	
	function loadImg(fname, hash, ext) {
		imgService.save(fname, hash, ext);
	}
	

    db.transaction(populateDB, stazeno, successDB);
	
	function populateDB(tx) {
	    tx.executeSql('DROP TABLE IF EXISTS category');
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
	    		
	    		var k = src.lastIndexOf(".");
	    		var ext = src.substring(k);
	    		var hash = SHA1(src);
	    		loadImg(src, hash, ext);
	    		
	    		var prefix = imgService.getURL();
	    		
	    		console.log("new:" + prefix + hash + ext);
	    		
	    		txt = txt.substring(0,i) + prefix + hash + ext + txt.substring(j);
	    		i++;
	    	}
	    	
	    	

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
