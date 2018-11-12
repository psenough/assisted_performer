var fs = require('fs');
var path = require('path');
var async = require('async'); // https://github.com/caolan/async

// Original function
function getDirsSync(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

var basepath = './public/images/';
var dirlist = getDirsSync('./public/images/');

function listfiles(testFolder) {
	dirlist.forEach(dir => {
		fs.readdir(testFolder+dir+'/', (err, files) => {
		  var counter = 0;
		  files.forEach(file => {
			  //'    img(id="spring_ddg_0", src="/images/spring_ddg/1b30589d38936e5e82fd411841b5078754a30758.jpg")';
			  console.log("    img(id=\""+dir+"_"+(counter++)+"\" src=\""+testFolder.substring(8)+dir+"/"+file+"\")");
		  });
		});
	});
}

listfiles(basepath);


/*fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    console.log(file);
  });
})*/

/*function getDirs(srcpath, cb) {
  fs.readdir(srcpath, function (err, files) {
    if(err) { 
      console.error(err);
      return cb([]);
    }
    var iterator = function (file, cb)  {
      fs.stat(path.join(srcpath, file), function (err, stats) {
        if(err) { 
          console.error(err);
          return cb(false);
        }
        cb(stats.isDirectory());
      })
    }
    async.filter(files, iterator, cb);
  });
}*/


/*const testFolder = './public/images';
const fs = require('fs');

fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    console.log(file);
  });
})*/