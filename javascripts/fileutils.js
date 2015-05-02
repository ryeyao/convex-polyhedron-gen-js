/**
 *
 * Created by rye on 15-5-1.
 */
function writeToFile(path, content) {

    function onInitFs(fs) {
        fs.root.getFile(path, {create: true}, function (fileEntry) {

            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter(function (fileWriter) {

                fileWriter.onwriteend = function (e) {
                    console.log('Write completed.');
                };

                fileWriter.onerror = function (e) {
                    console.log('Write failed: ' + e.toString());
                };

                // Create a new Blob and write it to log.txt.
                var blob = new Blob([content], {type: 'text/plain'});

                fileWriter.write(blob);

            }, errorHandler);

        }, errorHandler);
    }
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, errorHandler);

}

function readFile(path, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", path, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                callback(allText);
            }
        }
    }
    rawFile.send(null);
}

function errorHandler(e) {
    var msg = '';
    switch (e.name) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    };

    console.log('Error: ' + msg);
}

