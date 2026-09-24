// DisciplineAI desktop app (Electron).
// Loads the static production build (dist/) as a native desktop window.
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

app.setAppUserModelId('com.disciplineai.app');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 380,
    minHeight: 640,
    title: 'DisciplineAI',
    backgroundColor: '#171717',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      audio: true,
    },
  });

  // Prevent the app from being closed by accidental Ctrl+W / navigation
  win.setMenuBarVisibility(false);

  // Load the static site from disk (relative paths work with base './').
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // Open external links (e.g. console.groq.com) in the system browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('window-all-closed', () => {
    app.quit();
  });
});