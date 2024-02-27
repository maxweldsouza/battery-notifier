import React, {useEffect, useState} from 'react';
const ipcRenderer  = window.electron.ipcRenderer

function Battery(props) {
  const [data, setData] = useState(null);

  useEffect(() => {
    ipcRenderer.sendMessage('get-devices');

    // Listen for the event

    ipcRenderer.on('receive-devices', (event, arg) => {

      setData(arg);
      console.log(event, arg)

    });

    // Clean the listener after the component is dismounted

    return () => {

      // ipcRenderer.removeAllListeners('get-devices');

    };

  }, []);
  return (
    <div>{JSON.stringify(data, null, 4)}</div>
  );
}

export default Battery;
