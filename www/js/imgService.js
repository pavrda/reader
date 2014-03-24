
readerApp.factory('imgService', ['$http', '$route', '$q', '$timeout', function($http, $route, $q, $timeout) {
	
	var is = {};
	var fs = null;
	var dir = null;
	
	
	function gotFileSystem(lfs) {
		fs = lfs;
//		dir = fs.root;
		
		fs.root.getDirectory('eyrie', {create: true, exclusive: false}, gotDirectory, onError);
	}
	
	function gotDirectory(ldir) {
		dir = ldir;
		alert("Mam dir!:" + dir.toURL());
	}

	function onError(e) {
		alert("chyba:" + e);
	}

	function error_callback(e) {
		alert("chyba:" + e);
	}
	
	
	var is_cordova = function() {
		return (typeof(cordova) !== 'undefined' || typeof(phonegap) !== 'undefined');
	};

	is.init = function() {

		if (is_cordova()) {
			// PHONEGAP
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem, onError);
			return;
		}		
		
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		window.requestFileSystem(window.webkitStorageInfo.TEMPORARY, 5*1024*1024, gotFileSystem, function(e){alert(2);});
		return;
		
		if (is_cordova()) {
			// PHONEGAP
			window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, gotFileSystem, onError);
		} else {
			//CHROME
			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
			window.storageInfo = window.storageInfo || navigator.webkitPersistentStorage || window.webkitStorageInfo;
			if (!window.storageInfo) {
				onError('Your browser does not support the html5 File API');
				return;
			}
			
			
			// request space for storage
			alert('prequota');
			window.storageInfo.requestQuota(
				1024*1024,
				function() {
					alert('quota');
					/* success*/ window.requestFileSystem(window.storageInfo.TEMPORARY, 1024*1024, gotFileSystem, onError); 
					},
				function() {
						alert('nequota');
					}
			);
			window.requestFileSystem(window.storageInfo.TEMPORARY, 1024*1024, gotFileSystem, onError); 
		}
	};
	
	is.getURL = function() {
		if (!dir) {
			alert('imgService dir not created');
			return "";
		}
		return dir.toURL() + "/";
	};
	
	is.save = function(fname, hash, ext) {
		
		if (is_cordova()) {
			var fileTransfer = new FileTransfer();

//			alert('jdu stahovat:' + fname);
//			if (device.platform == "Android") {
//				fname= "file:///android_asset/www/" + fname;				
//			} else {
				var p = location.origin + location.pathname;
				var pi = p.lastIndexOf("/");
				p = p.substring(0,pi);
				fname = p + "/" + fname;
//				alert(fname);
//			}
			
			console.log("location:" + location.href);

			fileTransfer.download(
			    fname,
			    dir.fullPath + "/" + hash + ext,
			    function(entry) {
//			    	alert('stazeno:' + fname);
			        console.log("download complete: " + entry.fullPath);
			    },
			    function(error) {
			    	alert('error:' + error.code);
			        console.log("download error source " + error.source);
			        console.log("download error target " + error.target);
			        console.log("upload error code" + error.code);
			    },
			    false,
			    {
			    }
			);
			
			return;
		}
		
		var xhr = new XMLHttpRequest();
//		xhr.open('GET', "http://www.eyrie.cz" + fname, true);
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
				console.log("nelze nacist1:" + fname);
			}
		};
		xhr.onerror = function() {
			console.log("nelze nacist2:" + fname);
		};
		xhr.send();

	};
	
	is.init();

	return is;
//	alert('img service init');
	
}]);
