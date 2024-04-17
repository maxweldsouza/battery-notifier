import { ipcMain } from 'electron';
import { showNotification } from './battery';

export default function () {
  ipcMain.on('test-notification', async () => {
    console.log('test-notification ');
    showNotification({
      title: `Test Notification`,
      body: `This is a test notification.`,
    });
  });
}
