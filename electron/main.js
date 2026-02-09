const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Метро Москвы — Исследуй историю',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false,
  })

  const outDir = path.join(__dirname, '..', 'out')
  const indexPath = path.join(outDir, 'index.html')

  if (fs.existsSync(indexPath)) {
    win.loadFile(indexPath).catch((err) => {
      console.error('loadFile failed:', err)
      win.loadURL('file:///' + outDir.replace(/\\/g, '/') + '/index.html')
    })
  } else {
    win.loadURL('http://localhost:3000')
  }

  win.once('ready-to-show', () => win.show())
  win.on('closed', () => app.quit())
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())
