const { app, BrowserWindow, ipcMain } = require('electron/main')
const mqtt = require('mqtt')
const { MessageMethod, MessageStatus, MessageType, Message } = require('./shared-model')

let win
let client = null;

function connectMqtt(uri, port) {
  if (client) {
    try { client.end(); } catch {}
  }
  client = mqtt.connect(`mqtt://${uri}:${port}`);
  console.log(client)
  client.on('connect', () => {
    console.log('connecting')
    win.webContents.send('mqtt-status', `Connected to MQTT broker at ${uri}:${port}`);
    client.subscribe('grumpybin/lines');
    // Request initial state
    requestMessage(client, {
      line: "",
      method: MessageMethod.GET,
      status: MessageStatus.NONE,
      type: MessageType.REQUEST,
      key: -1
    });
  });
  client.on('message', (topic, message) => {
    if (topic === 'grumpybin/lines') {
      win.webContents.send('mqtt-message', message.toString());
    }
  });
}

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: __dirname + '/preload.js'
    }
  })

  win.loadFile('index.html')
}

function requestMessage(client, message) {
  if (client) {
    client.publish('grumpybin/lines', JSON.stringify(message))
    client.publish('grumpybin/lines', JSON.stringify({
      line: "",
      method: MessageMethod.GET,
      status: MessageStatus.NONE,
      type: MessageType.REQUEST,
      key: -1
    }))
  }
}

app.whenReady().then(() => {
  createWindow()

  // Optionally connect to a default broker at startup:
  // connectMqtt('localhost', 1883);

  ipcMain.on('connect-mqtt', (event, { uri, port }) => {
    connectMqtt(uri, port);
  });

  ipcMain.on('form-message', (event, message) => {
    requestMessage(client, message)
  })
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})