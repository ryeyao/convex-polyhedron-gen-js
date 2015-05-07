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

var fs = require('fs');
var ipc = require('ipc');
app.on('ready', function() {
// parse options
//ipc.on('options', function(event, msg) {
//
//  console.log(msg);
//  var cft_path = process.argv[2];
//  var content = fs.readFileSync(cft_path);
//  console.log(JSON.parse(content));
//  event.sender.send("options", content);
//});
//  var cft_path = process.argv[2];
  var cft_path = "cfg.json";
  var content = fs.readFileSync(cft_path);
  var options = JSON.parse(content);

  //mainWindow = new BrowserWindow({width: 1024, height: 768, center: true, resizable: false, show: options.show_window});
  mainWindow = new BrowserWindow({width: 1024, height: 768, center: true, resizable: false, show: false});
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


ipc.on('synchronous-message', function(event, content) {
  //console.log(arg);  // prints "ping"

  fs.writeFile('result', content, function(err) {
    console.log(err);
  });

  event.returnValue = 'close';
});




