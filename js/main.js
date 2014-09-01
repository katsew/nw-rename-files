var fs = require('fs'),
    async = require('async');


function Uploader() {
  this.inputDir = '';
  this.outputDir = '';
}
Uploader.prototype.publish = function () {
  var _this = this;
  fs.readdir(_this.inputDir, function(err, files){
    if (err) { throw err }
    async.forEach(files, function(file, cb){
      if (/.*\.jpg$/.test(file) || /.*\.jpeg$/.test(file)|| /.*\.png$/.test(file)) {
        var fileName = file.split('.')[0];
        var fileExt = file.split('.')[1];
        for(var i=1; i<4; i++) {
          var newFileName = fileName + i;
          var read = fs.createReadStream(_this.inputDir+'/'+file);
          var write = fs.createWriteStream(_this.outputDir+'/'+newFileName+'.'+fileExt);
          read.pipe(write);
        }

      } else {
        console.log(' no image file found ');
      }
    });
  });  
}
var uploader = new Uploader();

function init() {
  var name = name || 'inputDir';
  var input = document.getElementById('inputDir');
  var output = document.getElementById('outputDir');
  var button = document.getElementById('commit');
  input.addEventListener('change', function(e) {
    uploader.inputDir = this.value;
  }, false);
  output.addEventListener('change', function(e) {
    uploader.outputDir = this.value;
  }, false);
  button.addEventListener('click', function(e) {
    uploader.publish();
  });
}
init();

