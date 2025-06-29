const { app, BrowserWindow, ipcMain } = require('electron/main')
const mqtt = require('mqtt')
const { MessageMethod, MessageStatus, MessageType, Message } = require('./shared-model')

let win

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
  client.publish('grumpybin/lines', JSON.stringify(message))
  client.publish('grumpybin/lines', JSON.stringify({
    line: "",
    method: MessageMethod.GET,
    status: MessageStatus.NONE,
    type: MessageType.REQUEST,
    key: -1
  }))
}

app.whenReady().then(() => {
  createWindow()

  const client = mqtt.connect('mqtt://localhost:1883')

  client.on('connect', () => {
    win.webContents.send('mqtt-status', 'Connected to MQTT broker')
    client.subscribe('grumpybin/lines')
  })
  client.on('message', (topic, message) => {
    if (topic === 'grumpybin/lines') {
      win.webContents.send('mqtt-message', message.toString())
    }
  })

  ipcMain.on('form-message', (event, message) => {
    requestMessage(client, message)
  })

  requestMessage(client, {
    line: "",
    method: MessageMethod.GET,
    status: MessageStatus.NONE,
    type: MessageType.REQUEST,
    key: -1
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
