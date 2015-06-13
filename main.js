var app = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

var mainWindow = null;

//console.log('Hello World!');
app.on('window-all-closed', function() {
  //if (process.platform != 'darwin') {
    app.quit();
  //}
});

var fs = require('fs');
var ipc = require('ipc');
var path = require('path');

var cfg_path = "cfg.json";
var content, options;

app.on('ready', function() {
// parse options
  ipc.on('options', function(event, msg) {

    if (process.argv[4]) {
      cfg_path = path.join(process.cwd(), process.argv[4]);
    }
    //event.sender.send("options-got", options);
    event.returnValue = cfg_path;
  });

  content = fs.readFileSync(cfg_path);
  options = JSON.parse(content);

  mainWindow = new BrowserWindow({width: 1024, height: 768, center: true, resizable: false, show: options.show_window});
  //mainWindow = new BrowserWindow({width: 1024, height: 768, center: true, resizable: false, show: false});
  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/shapes.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});


ipc.on('synchronous-message', function(event, content) {
  //console.log(arg);  // prints "ping"

  var result_fname = "result";
  var statistics_fname = "statistics";
  if (process.argv[2]) {
    result_fname = path.join(process.cwd(), process.argv[2]);
    if (process.argv[3]) {
      statistics_fname = path.join(process.cwd(), process.argv[3]);
    }
  }
  fs.writeFileSync(result_fname, content.result);
  console.log("Polyhedrons are written to file [" + result_fname + "]");

  fs.writeFileSync(statistics_fname, content.statistics);
  console.log("Statistics are written to file [" + statistics_fname + "]");

  if (!options.show_window) {
    event.returnValue = 'close';
  }
});




