const {app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const fs = require('fs');
const encoding = require('encoding-japanese');

let win;
let settingPath = 'Setting.ini';

let curComment = '';
let yesNoKeys = ['youtube', 'pict1mai_kyousei_tuujou', 'username_link_br'];
let selectKeys = ['res_menu'];
let settings;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 956,
    height: 948,
    minWidth: 956,
    title: 'ツイート取得',
    backgroundColor: '#ffffff',
    icon: `${__dirname}\\dist\\ScriptMaker\\assets\\logo.png`,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL(`file://${__dirname}/dist/ScriptMaker/index.html`);


  //// uncomment below to open the DevTools.
  // win.webContents.openDevTools();

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  });

  let handleRedirect = (e, url) => {
    if (url !== win.webContents.getURL()) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    }
  };
  const isMac = process.platform === 'darwin'

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services'},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        isMac ? {role: 'close'} : {role: 'quit'}
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        ...(isMac ? [
          {role: 'pasteAndMatchStyle'},
          {role: 'delete'},
          {role: 'selectAll'},
          {type: 'separator'},
          {
            label: 'Speech',
            submenu: [
              {role: 'startspeaking'},
              {role: 'stopspeaking'}
            ]
          }
        ] : [
          {role: 'delete'},
          {type: 'separator'},
          {role: 'selectAll'}
        ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        {role: 'minimize'},
        {role: 'zoom'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const {shell} = require('electron');
            await shell.openExternal('https://electronjs.org');
          }
        }
      ]
    }

  ];

  const temp_menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(temp_menu);

  win.webContents.on('will-navigate', handleRedirect)
  win.webContents.on('new-window', handleRedirect)
  // win.setMenu(menu);
  // win.removeMenu();
}

// Create window on electron intialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
});
ipcMain.on("loadSettings", (event) => {
  getSettings();
});

function getSettings() {

  if(!fs.existsSync(settingPath)) {
    dialog.showErrorBox('設定', '設定ファイルを読めません。');
    return;
  }

  let input = fs.createReadStream(settingPath);
  let remaining = '';
  settings = { };
  input.on('data', function (data) {
    remaining += data;
    remaining = remaining.replace(/(\r)/gm, '');
    var index = remaining.indexOf('\n');
    var last = 0;
    while (index > -1) {
      let line = remaining.substring(last, index);

      last = index + 1;
      index = remaining.indexOf('\n', last);
      if (line.startsWith('#')) {
        // if(stateComments.indexOf(line) !== -1) {
        curComment = line;
        // }
        continue;
      }
      if (line.length === 0) {
        continue;
      }

      let chunks = line.split(':');
      let lineArgs = [chunks.shift(), chunks.join(':')];

      if (yesNoKeys.indexOf(lineArgs[0]) !== -1) {
        settings[lineArgs[0]] = (lineArgs[1] === 'yes' || lineArgs[1] === 'yes;');
      } else if (selectKeys.indexOf(lineArgs[0]) !== -1) {
        settings[lineArgs[0]] = lineArgs[1];
      } else {
        if (lineArgs.length > 1) {
          settings[lineArgs[0]] = lineArgs[1].replace(/;/g, '');
        } else {
          settings[lineArgs[0]] = '';
        }
      }
    }
    remaining = remaining.substring(last);
  });

  input.on('end', function () {
    win.webContents.send("getSettings", settings);
  });

}

ipcMain.on("saveSettings", (event, params) => {
  saveSettings(params);
});

function saveSettings(params) {
  let data = fs.readFileSync(settingPath, 'utf8');

  if (data.match(/(part1:)[^\r^\n]+(\r\n)/g) === null) {
    data = data.replace(/(part1:)+(\r\n)/g, `$1${params.part1}$2`);
  } else {
    data = data.replace(/(part1:)[^\r^\n]+(\r\n)/g, `$1${params.part1}$2`);
  }

  if (data.match(/(part2:)[^\r^\n]+(\r\n)/g) === null) {
    data = data.replace(/(part2:)+(\r\n)/g, `$1${params.part2}$2`);
  } else {
    data = data.replace(/(part2:)[^\r^\n]+(\r\n)/g, `$1${params.part2}$2`);
  }

  if (data.match(/(part3:)[^\r^\n]+(\r\n)/g) === null) {
    data = data.replace(/(part3:)+(\r\n)/g, `$1${params.part3}$2`);
  } else {
    data = data.replace(/(part3:)[^\r^\n]+(\r\n)/g, `$1${params.part3}$2`);
  }

  if (data.match(/(part4:)[^\r^\n]+(\r\n)/g) === null) {
    data = data.replace(/(part4:)+(\r\n)/g, `$1${params.part4}$2`);
  } else {
    data = data.replace(/(part4:)[^\r^\n]+(\r\n)/g, `$1${params.part4}$2`);
  }

  if (data.match(/(select_charset:)[^\r^\n]+(\r\n)/g) === null) {
    data = data.replace(/(select_charset:)+(\r\n)/g, `$1${params.selectedCharset}$2`);
  } else {
    data = data.replace(/(select_charset:)[^\r^\n]+(\r\n)/g, `$1${params.selectedCharset}$2`);
  }

  if (data.match(/(file_prefix:)[^\r^\n]+(\r\n)/g) === null) {
    data = data.replace(/(file_prefix:)+(\r\n)/g, `$1${params.filePrefix}$2`);
  } else {
    data = data.replace(/(file_prefix:)[^\r^\n]+(\r\n)/g, `$1${params.filePrefix}$2`);
  }

  if (data.match(/(start_row:)[^\r^\n]+(\r\n)/g) === null) {
    data = data.replace(/(start_row:)+(\r\n)/g, `$1${params.startRow}$2`);
  } else {
    data = data.replace(/(start_row:)[^\r^\n]+(\r\n)/g, `$1${params.startRow}$2`);
  }

  if (data.match(/(file_extension:)[^\r^\n]+(\r\n)/g) === null) {
    data = data.replace(/(file_extension:)+(\r\n)/g, `$1${params.fileExtension}$2`);
  } else {
    data = data.replace(/(file_extension:)[^\r^\n]+(\r\n)/g, `$1${params.fileExtension}$2`);
  }

  if (data.match(/(save_folder:)[^\r^\n]+(\r\n)/g) === null) {
    data = data.replace(/(save_folder:)+(\r\n)/g, `$1${params.saveFolder}$2`);
  } else {
    data = data.replace(/(save_folder:)[^\r^\n]+(\r\n)/g, `$1${params.saveFolder}$2`);
  }
  fs.writeFileSync('Setting.ini', data);
}

ipcMain.on("makeFiles", (event, params) => {
  makeFiles(params);
});

function makeFiles(params) {
  let outputList = params.outputScript.split(`\n`);
  let index = params.startRow;
  let options=`utf8`;
  if(params.selectedCharset === 'Shift-JIS'){
    options=`ascii`;
  }
  for (const line of outputList){
    let data = '';
    if (line.length > 0) {

      if (params.selectedCharset === 'Shift-JIS') {
        data = encoding.convert(line, {
          from: 'UNICODE',
          to: 'SJIS',
          type: 'string',
        });
      } else {
        data = line;
      }
      data += '\r\n';
      fs.writeFile(`${params.saveFolder}${params.filePrefix}_${index}${params.fileExtension}`, data, options, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
      index++;
    }
  }
  if (index > params.startRow) {
    dialog.showMessageBoxSync(win, {
      type: 'info',
      title: '生成',
      message: '生成が完了'
    });
  }
}
