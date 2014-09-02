var fs = require('fs'),
    async = require('async'),
    https = require('https'),
    options = require('url').parse('https://api.tinypng.com/shrink'),
    API_KEY = window.localStorage.getItem('APIToken') || '';

var log = document.getElementById('log');
function appendLog(text) {
  var textNode = document.createTextNode(text);
  var div = document.createElement('div');
  div.appendChild(textNode);
  log.appendChild(div);
  return;
}

function Uploader() {
  this.inputDir = '';
  this.outputDir = '';
  this.apiToken = '';
  this.failedFiles = [];
}
Uploader.prototype.validate = function () {
  if (this.inputDir === '' || this.outputDir === '' || this.apiToken === '' || this.inputDir == null || this.outputDir == null || this.apiToken == null) {
    appendLog('Failed to validate input. please make sure if directory selected or API Token sets.');
    alert('フォルダが選択されていないか、\nAPIトークンがセットされていません');
    return false;
  }
  return true;
};
Uploader.prototype.publish = function () {
  var _this = this;

  API_KEY = document.getElementById('APIToken').value;
  this.apiToken = API_KEY;
  options.auth = "api:" + API_KEY;
  options.method = "POST";

  if ( API_KEY !== '' && API_KEY != null ) {
    window.localStorage.setItem('APIToken', API_KEY);
  }
  
  if ( !_this.validate() ) { return false; }


  appendLog('Create output directory...');
  try {
    fs.mkdirSync(_this.inputDir+'/output');  
    appendLog('Success create output directory!');
  } catch (e) {
    appendLog('output directory has already exists.');
  }
  fs.readdir(_this.inputDir, function(err, files){
    if (err) { appendLog(err); }

    Object.keys(files).forEach(function(key) {
      async.series([
        function (callback) {
          if (/.*\.jpg$/.test(files[key]) || /.*\.jpeg$/.test(files[key])|| /.*\.png$/.test(files[key])) {

            var first_read = fs.createReadStream(_this.inputDir+'/'+files[key]);
            var first_write = fs.createWriteStream(_this.inputDir+'/output/'+files[key]);
            var request = https.request(options, function (response) {

              if (response.statusCode === 201) {
                https.get(response.headers.location, function (response) {
                  appendLog('success get response!\nwriting image...');
                  response.pipe(first_write);
                  first_write.on('finish', function() {
                    appendLog('finish write image file: ' + files[key]);
                    callback(null, 'success compress');
                  });
                });
              } else {
                appendLog('Failed to compress image!\nfile:' + files[key] + '\n' + response);
                _this.failedFiles.push(files[key]);
                callback(null, 'failed compress');
              }
            });
            first_read.pipe(request);
          } else {
            appendLog('Not an image file error at file: ' + files[key]);
          }
        },
        function (callback) {
          var fileName = files[key].split('.')[0];
          var fileExt = files[key].split('.')[1];

          var newFileName = fileName + 1;
          var second_read = fs.createReadStream(_this.inputDir+'/output/'+files[key]);
          var second_write = fs.createWriteStream(_this.outputDir+'/'+newFileName+'.'+fileExt);
          second_read.pipe(second_write);

          appendLog('success write first image: ' + newFileName);
          callback(null, 'copy01 success');
        },
        function (callback) {
          var fileName = files[key].split('.')[0];
          var fileExt = files[key].split('.')[1];

          var newFileName = fileName + 2;
          var second_read = fs.createReadStream(_this.inputDir+'/output/'+files[key]);
          var second_write = fs.createWriteStream(_this.outputDir+'/'+newFileName+'.'+fileExt);
          second_read.pipe(second_write);

          appendLog('success write second image: ' + newFileName);
          callback(null, 'copy02 success');
        },
        function (callback) {
          var fileName = files[key].split('.')[0];
          var fileExt = files[key].split('.')[1];

          var newFileName = fileName + 3;
          var second_read = fs.createReadStream(_this.inputDir+'/output/'+files[key]);
          var second_write = fs.createWriteStream(_this.outputDir+'/'+newFileName+'.'+fileExt);
          second_read.pipe(second_write);

          appendLog('success write third image: ' + newFileName);
          callback(null, 'copy03 success');
        }
      ], function(err, results) {
        if (err) { appendLog('An error occured!!\nERROR:' + err); }
        appendLog('all process done!\n' + results);

        if ( _this.failedFiles.length > 0 ) {
          appendLog('Following files are not compressed:\n');
          for (var k=0; k < _this.failedFiles.length; k++) {
            appendLog(_this.failedFiles[k]);
          }
        }

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

