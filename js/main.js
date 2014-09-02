var fs = require('fs'),
    async = require('async'),
    https = require('https'),
    options = require('url').parse('https://api.tinypng.com/shrink'),
    API_KEY = window.localStorage.getItem('APIToken') || '';

function Uploader() {
  this.inputDir = '';
  this.outputDir = '';
}
Uploader.prototype.publish = function () {
  var _this = this;

  API_KEY = document.getElementById('APIToken').value;
  options.auth = "api:" + API_KEY;
  options.method = "POST";

  if ( API_KEY !== '' && API_KEY != null ) {
    window.localStorage.setItem('APIToken', API_KEY);
  }
  fs.readdir(_this.inputDir, function(err, files){
    if (err) { throw err }

    Object.keys(files).forEach(function(key) {
      async.series([
        function (callback) {
          if (/.*\.jpg$/.test(files[key]) || /.*\.jpeg$/.test(files[key])|| /.*\.png$/.test(files[key])) {

            var first_read = fs.createReadStream(_this.inputDir+'/'+files[key]);
            var first_write = fs.createWriteStream(_this.inputDir+'/output/'+files[key]);
            var request = https.request(options, function (response) {

              console.log('--- output response ---');
              console.log(response);

              if (response.statusCode === 201) {
                https.get(response.headers.location, function (response) {
                  console.log('Success GET response');
                  console.log(response);
                  response.pipe(first_write);
                  first_write.on('finish', function() {
                    callback(null, 'first');
                  });
                });
              } else {
                console.log("Compression failed");
                callback(null, 'first');
              }
            });
            first_read.pipe(request);
          } else {
            console.log(' no image file found ');
          }
        },
        function (callback) {
          console.log('second process');
          var fileName = files[key].split('.')[0];
          var fileExt = files[key].split('.')[1];
          console.log(fileName);

          var newFileName = fileName + 1;
          var second_read = fs.createReadStream(_this.inputDir+'/output/'+files[key]);
          var second_write = fs.createWriteStream(_this.outputDir+'/'+newFileName+'.'+fileExt);
          second_read.pipe(second_write);
          callback(null, 'second');
        },
        function (callback) {
          console.log('third process');
          var fileName = files[key].split('.')[0];
          var fileExt = files[key].split('.')[1];
          console.log(fileName);

          var newFileName = fileName + 2;
          var second_read = fs.createReadStream(_this.inputDir+'/output/'+files[key]);
          var second_write = fs.createWriteStream(_this.outputDir+'/'+newFileName+'.'+fileExt);
          second_read.pipe(second_write);
          callback(null, 'third');
        },
        function (callback) {
          console.log('forth process');
          var fileName = files[key].split('.')[0];
          var fileExt = files[key].split('.')[1];
          console.log(fileName);

          var newFileName = fileName + 3;
          var second_read = fs.createReadStream(_this.inputDir+'/output/'+files[key]);
          var second_write = fs.createWriteStream(_this.outputDir+'/'+newFileName+'.'+fileExt);
          second_read.pipe(second_write);
          callback(null, 'forth');
        }
      ], function(err, results) {
        if (err) { throw err; }
        console.log('series all done.' + results);
      });      
    });
  });
}
var uploader = new Uploader();

function init() {
  var input = document.getElementById('inputDir');
  var output = document.getElementById('outputDir');
  var button = document.getElementById('commit');
  var tokenInput = document.getElementById('APIToken');
  tokenInput.value = API_KEY;
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

