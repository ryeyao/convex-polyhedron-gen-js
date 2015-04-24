var app = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

var mainWindow = null;

console.log('Hello World!');
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
})

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 600, center: true, resizable: false});
  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
})
