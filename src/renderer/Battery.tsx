import React, {useEffect, useState} from 'react';
const ipcRenderer  = window.electron.ipcRenderer

function Battery(props) {
  const [data, setData] = useState([]);

  useEffect(() => {
    ipcRenderer.sendMessage('get-devices');
    ipcRenderer.on('receive-devices', (event: [], arg) => {
      setData(event);
      console.log(event, arg)
    });
    // Clean the listener after the component is dismounted
    return () => {
      // ipcRenderer.removeAllListeners('get-devices');
    };

  }, []);
  return (
    <div>{data.map(row => {
      return <div key={row['native-path']}>
        {row.model}
        {row.percentage}%
      </div>
    })}</div>
  );
}

export default Battery;
