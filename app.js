var path = require('path'); 
var url = require('url');
var sizeOf = require('image-size');
var gm = require('gm');
// var smartCrop = require('smartcrop');
// var cloudinary = require('cloudinary');
var im = require('imagemagick');

var express = require("express"),
    app = express(),
    formidable = require('formidable'),
    util = require('util'),
    fs   = require('fs-extra'),
    qt   = require('quickthumb');

// Use quickthumb
app.use(qt.static(__dirname + '/'));

app.post('/imageupload', function (req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.end("Uploaded");
  });

  form.on('end', function(fields, files) {
    /* Temporary location of our uploaded file */

    var temp_path = this.openedFiles[0].path;
    console.log("Path = " + temp_path);
    /* The file name of the uploaded file */
    var file_name = this.openedFiles[0].name;
    console.log("File name = " + file_name);

    var dimensions = sizeOf(temp_path);

    var width = dimensions.width;
    var height = dimensions.height;
    console.log(width, height)

    if(height >= 1024 && width >= 1024){
      /* Location where we want to copy the uploaded file */
      var new_location = 'uploads/';

      var image_file = new_location + file_name;

      try {
        fs.copySync(temp_path, image_file);
        console.log("success!")
      } catch (err) {
        console.error(err)
      }

      var horizontal_image_file = new_location + "horizontal_" + file_name;
      var vertical_image_file = new_location + "vertical_" + file_name;
      var horizontal_small_image_file = new_location + "horizontal_small_" + file_name;
      var gallery_image_file = new_location + "gallery_" + file_name;

      im.crop({
        srcPath: image_file,
        dstPath: horizontal_image_file,
        width: 755,
        height: 450,
        quality: 1,
        gravity: "Center"
      }, function(err, stdout, stderr){
        console.log('');
      });

      im.crop({
        srcPath: image_file,
        dstPath: vertical_image_file,
        width: 365,
        height: 450,
        quality: 1,
        gravity: "Center"
      }, function(err, stdout, stderr){
        console.log('');
      });

      im.crop({
        srcPath: image_file,
        dstPath: horizontal_small_image_file,
        width: 365,
        height: 212,
        quality: 1,
        gravity: "Center"
      }, function(err, stdout, stderr){
        console.log('');
      });

      im.crop({
        srcPath: image_file,
        dstPath: gallery_image_file,
        width: 380,
        height: 380,
        quality: 1,
        gravity: "Center"
      }, function(err, stdout, stderr){
        console.log('');
      });

    }
    else{
      console.log("failure, image dimensions are low");
    }
  });
});

// Show the upload form	
app.get('/', function (req, res){
  res.writeHead(200, {'Content-Type': 'text/html' });
  var form = '<form action="/imageupload" enctype="multipart/form-data" method="post"><br><input multiple="multiple" name="imageupload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
  res.end(form); 
}); 

// Display images
app.get('/display/:imagename', function (req, res){
  var img = req.params.imagename;
  var new_location = 'uploads/';

  var image_file = new_location + img;

  if(fs.existsSync(image_file)){
    var request = url.parse(req.url, true);
    var action = request.pathname;
    res.writeHead(200, {'Content-Type': 'image'});

    var img_hor = fs.readFileSync('./uploads/horizontal_'+img);
    var img_ver = fs.readFileSync('./uploads/vertical_'+img);
    var img_hor_small = fs.readFileSync('./uploads/horizontal_small_'+img);
    var img_gal = fs.readFileSync('./uploads/gallery_'+img);

    // res.write("<html><head><link rel='stylesheet' type='text/css' href='style.css'></head><body>");
    // res.write("<div class='img'><img src="+img_hor+"><div class='Horizontal Image'></div>");

    res.write(img_ver, 'binary');
    res.end(img_hor, 'binary');
    // res.write(img_hor_small, 'binary');
    // res.end("bye");
  }
  else{
    console.log("File not present");
  }
  
});

app.listen(8080);