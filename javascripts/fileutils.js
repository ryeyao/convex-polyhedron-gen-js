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

function downloadFile(content) {
    var data = new Blob([content], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    var textFile = null;
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    //window.location.href = textFile;
    //window.open("data:text/plain;charset=utf-8," + content);
    window.open(textFile);
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

function save_content_to_file(content, filename)
{
    var dlg = false;
    with(document){
        ir=createElement('iframe');
        ir.id='ifr';
        ir.location='about.blank';
        ir.style.display='none';
        body.appendChild(ir);
        with(getElementById('ifr').contentWindow.document){
            open("text/plain", "replace");
            charset = "utf-8";
            write(content);
            close();
            document.charset = "utf-8";
            dlg = execCommand('SaveAs', false, filename+'.txt');
        }
        body.removeChild(ir);
    }
    return dlg;
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

