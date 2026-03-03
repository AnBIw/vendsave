const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Placeholder para funcionalidades futuras de IPC
  platform: process.platform,
  
  // Ejemplo de comunicación IPC segura
  send: (channel, data) => {
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  receive: (channel, func) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
