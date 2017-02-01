var fs = require('fs');
var path = require('path');
var process = require('process');
var Promise = require('bluebird');
var moment = require('moment');

var photoDestinationRootFolder = './sorted/'
var photoOriginFolder = "./Np2/";
var moveTo = photoDestinationRootFolder + "./1/"

// The photos from nepal were taken with the camera in PST
// it is easier to try and convert them to the date and time they
// were taken in Nepal
const PHOTO_TIME_FROM_NEPAL = true;

// The max Milliseconds between each photo that should be orgainized into
// the same folder
const MAX_TIME_DIFFERENCE = 10000;



var cameraTimeToLocal = (cameraTime) => {
  if (PHOTO_TIME_FROM_NEPAL)
    return moment(cameraTime).add(10, 'h').add(15, 'm');
  else
    return moment(cameraTime);
};

var moveFile = (origin, destination) => {
  return new Promise((resolve, reject) => {
    fs.rename(origin, destination, function( error ) {
      if( error ) {
        return reject("File moving error.", error);
      }
      else {
        console.log( "Moved file '%s' to '%s'.", origin, destination );
        return resolve();
      }
    });
  });
};

var makeDir = (data, file) => {
  var formattedTime = cameraTimeToLocal(data.createdDate).format('MMM-D_HH-mmA');
  var newDirName = `${formattedTime}`

  var createDir = Promise.promisify(fs.mkdir)

  moveTo = photoDestinationRootFolder + newDirName;
  toPath = path.join(moveTo, file);
  return createDir(moveTo)
  .catch((err) =>{
    moveTo = photoDestinationRootFolder + newDirName + '(2)';
    toPath = path.join(moveTo, file);
    return createDir(moveTo + '(2)')
  })
  .then(() => moveFile(path.join( photoOriginFolder, file ), toPath));
};

// Loop through all the files in the temp directory
fs.readdir( photoOriginFolder, function( err, files ) {
  if( err ) {
    console.error( "Could not list the directory.", err );
    process.exit( 1 );
  }

  var lastTimeStamp = null;
  Promise.each(files, (file) => {
    var fromPath = path.join( photoOriginFolder, file );
    var toPath = path.join( moveTo, file );
    var pStat = Promise.promisify(fs.stat);

    return pStat(fromPath)
    .then((stat) => {
      if (stat.isFile()) {
        var data = {
          createdDate: stat.mtime
        }

        if (!lastTimeStamp) {
          lastTimeStamp = data.createdDate;
          console.log('No previous timestamp');
          return makeDir(data, file);
        }

        var timeStampDiff = Math.abs(new Date(data.createdDate).getTime() - new Date(lastTimeStamp).getTime());
        if (timeStampDiff > MAX_TIME_DIFFERENCE) {
          console.log(`Time Difference ${new Date(data.createdDate).getTime()} - ${new Date(lastTimeStamp).getTime()}`);
          lastTimeStamp = data.createdDate;
          return makeDir(data, file)
        } else {
          lastTimeStamp = data.createdDate;
          return moveFile(fromPath, toPath)
        }
      }

      else if(stat.isDirectory() )
        console.log( "'%s' is a directory.", fromPath );
    });
  })
});