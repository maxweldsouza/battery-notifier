import { Notification } from 'electron';

export function showLowBatteryNotification(device, percent) {
  showNotification({
    title: `Low battery`,
    body: `${device} battery is at ${percent}%`
  })
}

export function showHighBatteryNotification(device, percent) {
  showNotification({
    title: `Stop charging`,
    body: `${device} battery is at ${percent}%`
  })
}

function showNotification(options) {
  const notification = new Notification({
    sound: '../../assets/message.mp3',
    ...options,
  });
  notification.show();
}
