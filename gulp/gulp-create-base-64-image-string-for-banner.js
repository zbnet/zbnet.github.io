var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var fm = require('front-matter');
var execSync = require('child_process').execSync;
var gutil = require('gulp-util');

// consts
const PLUGIN_NAME = 'gulp-prefixer';

// this plugin is ugly, but it gets the job done.

// plugin level function (dealing with files)
function addBase64ThumbnailToFrontMatter() {

    // creating a stream through which each file will pass
    var stream = through.obj(function (file, enc, cb) {

        if (file.isBuffer()) {
            var parsedMarkdown = fm(file.contents.toString());
            var imageStringPortrait = execSync('convert images\\mobile_portrait\\' + parsedMarkdown.attributes["banner"] + ' -resize 40x40 JPG:- | base64').toString();
            var imageStringLandscape = execSync('convert images\\small\\' + parsedMarkdown.attributes["banner"] + ' -resize 40x40 JPG:- | base64').toString();            
            // markdown hates a stray newline in the front matter.
            imageStringPortrait = imageStringPortrait.replace(/(\r\n|\n|\r)/gm,"");
            imageStringLandscape = imageStringLandscape.replace(/(\r\n|\n|\r)/gm,"");
            
            var markdown = file.contents.toString('utf8');
            var splitMarkdown = markdown.split('---')
            if(!splitMarkdown[1].includes('base64ThumbnailPortrait')){
                splitMarkdown[1] =  splitMarkdown[1] + "base64ThumbnailPortrait: " + imageStringPortrait + '\n' + 
                                    "base64ThumbnailLandscape: " + imageStringLandscape + '\n';
                
                markdown = splitMarkdown.join('---');
            }
            file.contents = Buffer.from(markdown, 'utf8');
        }
        this.push(file);
        cb();
    });

    // returning the file stream
    return stream;
};

// exporting the plugin main function
module.exports = addBase64ThumbnailToFrontMatter;



// var map = require('map-stream');
// var gutil = require('gulp-util');
// var fs = require("fs");
// var fm = require('front-matter');
// var execSync = require('child_process').execSync;
// var through = require('through2');  

// var modifyFrontMatter = function () {
//     return map(function (file, cb) {
//         //var fileContents = file.contents.toString();

//         var content = fm(file.contents.toString());

//         var imageString = execSync('convert images\\mobile_portrait\\' + content.attributes["banner"] + ' -resize 40x40 JPG:- | base64').toString();

//         content.attributes["base64Thumbnail"] = imageString;
//         return content;
//     });
// };

// // Export the plugin main function
// module.exports = function () {
//     return through.obj(function (file, encoding, callback) {
//         //var fileContents = file.contents.toString();

//         var content = fm(file.contents.toString());

//         var imageString = execSync('convert images\\mobile_portrait\\' + content.attributes["banner"] + ' -resize 40x40 JPG:- | base64').toString();

//         content.attributes["base64Thumbnail"] = imageString;
//         gutil.log(content.attributes);
//         return content;
//     });
// };