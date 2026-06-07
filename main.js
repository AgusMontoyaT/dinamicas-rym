const { app, BrowserWindow } = require('electron')
// 1. AÑADE ESTA LÍNEA AQUÍ ARRIBA
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    // 2. Verifica que esta ruta coincida con tu estructura de carpetas real
    icon: path.join(__dirname, 'dist/rickymorty/browser/assets/clones-favicon.png'),
    center: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#14171a',
    show: false
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  win.loadFile('dist/rickymorty/browser/index.html')

  // Bloquear el zoom para que el diseño no se rompa
  win.webContents.on('did-finish-load', () => {
    win.webContents.setVisualZoomLevelLimits(1, 1);
  });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
