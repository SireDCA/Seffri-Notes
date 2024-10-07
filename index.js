let { app, BrowserWindow, ipcMain } = require("electron");
let Datastore = require("nedb");

let win;
let datastore;

function createWindow() {
    //initialize the window
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences : {
            //allows use of the fs module in the render process
            nodeIntegration : true,
            //this forces electron to be required in the rendering process
            contextIsolation: false,
        },
        //prevents the default menu at the top
        autoHideMenuBar : true
    });

    win.loadFile(__dirname + "/renderer/index.html");

    //makes the window appear only after renderer has loaded
    win.addListener('ready-to-show', () => {
        //shows window
        win.show();
    });
}

function initDatastore() {
    let path = app.getPath("userData");

    datastore = new Datastore({
        //the address in which you want to store the database
        filename: path + "/notes.json",
      });

    //loads the database
    datastore.loadDatabase((err) => {
        if (err) {
          console.log("there was some error in loading the datastore");
          throw err;
        } else {
          console.log("datastore loaded successfully");
        }
      });
    }

//when the app is ready then create the window
app.whenReady().then(() => {
  initDatastore();
  createWindow();
})

//sometimes on mac, the application does not closed when closed and needs to be closed manually
app.addListener("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
});

//all the ipc calls
//receives data sent once the save_note event is triggered
ipcMain.on("save_note", (e, note) => {
    datastore.insert(note, (err, new_doc) => {
      console.log(new_doc);
      if (err) {
        console.log("there was some error in inserting the doc");
        throw err;
      } else {
        console.log("data inserted successfully");
      }
    });
  });

  ipcMain.handle("get_data", (e) => {
    return new Promise((resolve, reject) => {
      datastore.find({}, (err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  });