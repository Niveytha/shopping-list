const electron = require('electron');
const url = require('url');
const path = require('path');
// const { Menu } = require('electron');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function() {
    // Create new window
    mainWindow = new BrowserWindow({
        backgroundColor: '#cad0db',
        // frame: false, // frameless
        webPreferences: {
            nodeIntegration: true,
        }
    });

    // Load HTML into window
    mainWindow.loadURL(url.format({
        // file://dirname/mainWindow.html
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Quit all windows when main window is closed
    mainWindow.on('closed', function () {
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {
    // Create new window
    addWindow = new BrowserWindow({
        backgroundColor: '#cad0db',
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',

        // To solve: "Uncaught ReferenceError: require is not defined"
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Load HTML into window
    addWindow.loadURL(url.format({
        // file://dirname/mainWindow.html
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Garbage collection handle
    addWindow.on('closed', function() {
        addWindow = null; // takes space if not set to null even when closed
    })
}

// Catch item:add -> send from addWindow to mainWindow
ipcMain.on('item:add', function(e, item) {
    // console.log(item); // testing
    // mainWindow.webContents.on('did-finish-load', ()=>{
    //     mainWindow.webContents.send('item:add', item)
    // })

    // setTimeout(function() {
    //     mainWindow.webContents.send('item:add', item)
    // }, 1000)
    addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    // {}, // Empty item so that file is the second option on Mac
    // An array of menu items
    {
       label: 'File',
       submenu: [
           {
               label: 'Add Item',
               // Keyboard shortcut
               accelerator: process.platform == 'darwin' ? 'Command+Shift+A' : 'Ctrl+Shift+A',
               click() {
                   createAddWindow();
               }
           },
           {
               label: 'Clear Items'
           },
           {
               label: 'Quit',
                // Keyboard shortcut
               accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q', // mac or windows
               click() {
                   app.quit();
               }
           }
       ]
    }
];

// If Mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({}); // array method to add to start
}

// Add developer tools item if not in production
if (process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I', // mac or windows
                click(item, focusedWindow) { // DevTools appear on current window
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}