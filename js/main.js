fs = require('fs');
async = require('async');

fs.readdir('images', function(err, files){
  if (err) { throw err }
  async.forEach(files, function(file, cb){
    if (/.*\.jpg$/.test(file) || /.*\.jpeg$/.test(file)|| /.*\.png$/.test(file)) {
      var fileName = file.split('.')[0];
      var fileExt = file.split('.')[1];
      console.log(fileName);
      for(var i=1; i<4; i++) {
        var newFileName = fileName + i;
        var read = fs.createReadStream('images/'+file);
        var write = fs.createWriteStream('o_images/'+newFileName+'.'+fileExt);
        read.pipe(write);
      }

    } else {
      console.log(' no image file found ');
    }
  });
});
