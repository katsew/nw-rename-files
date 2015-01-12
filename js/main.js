var fs = require('fs'),
    async = require('async'),
    https = require('https'),
    gui = require('nw.gui'),
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


  appendLog('ディレクトリ作成中...');
  try {
    fs.mkdirSync(_this.inputDir+'/output');  
    appendLog('[output]ディレクトリ作成完了');
  } catch (e) {
    appendLog('[output]ディレクトリはすでに存在しています');
  }
  fs.readdir(_this.inputDir, function(err, files){
    if (err) { appendLog(err); }

    Object.keys(files).forEach(function(key) {
      async.series([
        function (callback) {
          if (/.*\.jpg$/.test(files[key]) || /.*\.jpeg$/.test(files[key])|| /.*\.png$/.test(files[key])) {

            var first_read = fs.createReadStream(_this.inputDir+'/'+files[key]);
            var first_write = fs.createWriteStream(_this.inputDir+'/output/'+files[key]);

            // pngの場合のみtinypngする
            if (/.*\.png$/.test(files[key])) {
              var request = https.request(options, function (response) {

                if (response.statusCode === 201) {
                  https.get(response.headers.location, function (response) {
                    appendLog('通信が完了しました\n画像を書き込んでいます...');
                    response.pipe(first_write);
                    first_write.on('finish', function() {
                      appendLog('画像の圧縮が完了しました: ' + files[key]);
                      callback(null, '圧縮成功');
                    });
                  });
                } else {
                  appendLog('圧縮に失敗しました: ' + files[key]);
                  _this.failedFiles.push(files[key]);
                  callback(null, '圧縮失敗');
                }
              });
              first_read.pipe(request);

            } else {
              first_read.pipe(first_write);
              first_write.on('finish', function() {
                appendLog('outputディレクトリに画像を移動: ' + files[key]);
                callback(null, '圧縮なし');
              });
            }

          } else {
            appendLog('画像ファイルではありません: ' + files[key]);
          }
        },
        function (callback) {
          var fileName = files[key].split('.')[0];
          var fileExt = files[key].split('.')[1];

          var newFileName = fileName + 1;
          var second_read = fs.createReadStream(_this.inputDir+'/output/'+files[key]);
          var second_write = fs.createWriteStream(_this.outputDir+'/'+newFileName+'.'+fileExt);
          second_read.pipe(second_write);

          appendLog('xxxx1にリネーム完了: ' + newFileName);
          callback(null, 'xxxx1成功');
        },
        function (callback) {
          var fileName = files[key].split('.')[0];
          var fileExt = files[key].split('.')[1];

          var newFileName = fileName + 2;
          var second_read = fs.createReadStream(_this.inputDir+'/output/'+files[key]);
          var second_write = fs.createWriteStream(_this.outputDir+'/'+newFileName+'.'+fileExt);
          second_read.pipe(second_write);

          appendLog('xxxx2にリネーム完了: ' + newFileName);
          callback(null, 'xxxx2成功');
        },
        function (callback) {
          var fileName = files[key].split('.')[0];
          var fileExt = files[key].split('.')[1];

          var newFileName = fileName + 3;
          var second_read = fs.createReadStream(_this.inputDir+'/output/'+files[key]);
          var second_write = fs.createWriteStream(_this.outputDir+'/'+newFileName+'.'+fileExt);
          second_read.pipe(second_write);

          appendLog('xxxx3にリネーム完了: ' + newFileName);
          callback(null, 'xxxx3成功');
        }
      ], function(err, results) {
        if (err) { appendLog('エラーが発生しました\nERROR:' + err); }
        appendLog('処理が完了しました\n' + results);

        if ( _this.failedFiles.length > 0 ) {
          appendLog('以下のファイルが圧縮されませんでした:\n');
          for (var k=0; k < _this.failedFiles.length; k++) {
            appendLog(_this.failedFiles[k]);
          }
        } else {
          appendLog('すべての圧縮処理が正常に完了しました');
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
  var pasteButton = document.getElementById('pasteClipboard');

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
  pasteButton.addEventListener('click', function(e) {
    var clipboard = gui.Clipboard.get();
    var clipboardText = clipboard.get('text');
    appendLog('paste clipboard text: ' + clipboardText);
    tokenInput.value = clipboardText;
  });
}
init();

