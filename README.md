# Simple Photo Sorter based of created time

Super simple photo sorter which will move photos from a single folder into many subfolders based off the created date of the photos.

A few variable that may need to be changed with each run

| Variable Name | Description |
|---------------|-------|
| `PHOTO_TIME_FROM_NEPAL` | The camera that was used to take the photos in Nepal was still in PST. This made it confusing to align photo times with location time and other data recordings. |
| `MAX_TIME_DIFFERENCE` | The max number of milliseconds between each photo that should be orgainized into the same folder |
| `photoDestinationRootFolder` | Where would you like the new folders of photos to be located. Must be an existing folder on your system.|
|`photoOriginFolder`| Where all the photos stored now. Currently this program assumes that this is a flat folder with all files existing on the same level. |

### To Run
- After downloading you must run `npm i` in the commandline from the same directory. This will create the node_modules folder which contains packages that the photoSorter uses.
- You will most likly next want to change some or all of the variables mentioned in the above table in the `getPhotos.js` file.
- Now all that needs to happen is run `node getPhotos.js` in the command line.