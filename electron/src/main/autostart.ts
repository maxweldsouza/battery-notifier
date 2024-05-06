const fs = require('fs').promises; // Use the promises version of the fs module
const path = require('path');

async function copyFileWithDirectories(source, destination) {
  const dir = path.dirname(destination);
  await fs.mkdir(dir, { recursive: true });

  await fs.copyFile(source, destination);
}

export default async function () {
  try {
    const sourcePath = process.env.SNAP;
    if (!sourcePath) return;
    const sourceFilePath = path.join(
      sourcePath,
      'snap',
      'gui',
      'battery-notifier.desktop'
    );

    const destinationPath = process.env.SNAP_USER_DATA;
    if (!destinationPath) return;
    const destinationFilePath = path.join(
      destinationPath,
      '.config',
      'autostart',
      'battery-notifier.desktop'
    );

    try {
      await fs.access(destinationFilePath, fs.constants.F_OK);
    } catch (err) {
      await copyFileWithDirectories(sourceFilePath, destinationFilePath);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
