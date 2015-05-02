var app = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

var mainWindow = null;

//console.log('Hello World!');
app.on('window-all-closed', function() {
  //if (process.platform != 'darwin') {
    app.quit();
  //}
})

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 1024, height: 768, center: true, resizable: false, show: true});
  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/shapes.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
})

var ipc = require('ipc');
ipc.on('synchronous-message', function(event, arg) {
  //console.log(arg);  // prints "ping"

  var fs = require('fs');
  fs.writeFile('result', arg, function(err) {
    console.log(err);
  });

  event.returnValue = 'close';
});

console.log(process.argv);

