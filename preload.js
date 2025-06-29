const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onMqttStatus: (callback) => ipcRenderer.on('mqtt-status', (event, status) => callback(status)),
  onMqttMessage: (callback) => ipcRenderer.on('mqtt-message', (event, msg) => callback(msg)),
  sendToMain: (channel, data) => ipcRenderer.send(channel, data)
});