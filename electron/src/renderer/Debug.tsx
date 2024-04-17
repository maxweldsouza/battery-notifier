import React from 'react';
import Button from '../shared/Button';

const { ipcRenderer } = window.electron;

function Debug() {
  return (
    <div>
      <h1>Debug</h1>

      <Button
        onClick={() => {
          ipcRenderer?.sendMessage('test-notification');
          console.log('test notification ');
        }}
      >
        Test Notification
      </Button>
    </div>
  );
}

export default Debug;
