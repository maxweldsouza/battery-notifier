import React, {useEffect, useState} from 'react';
const ipcRenderer  = window.electron.ipcRenderer

function Battery(props) {
  const [data, setData] = useState([]);
  const [state, setState] = useState({})

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
  console.log('state: ', state);
  const saveState = (id, key, value) => {
    setState(state => {
      return {
        ...state,
        [id]: {
          ...state[id],
          [key]: value
        }
      }
    })
  }
  return (
    <div>{data.map(row => {
      console.log('row: ', row);
      return <div className={'row'} key={row['native-path']}>
        <div className='name'>
          {row.model}
        </div>
        <div className='percentage'>
        {row.percentage}%
        </div>
        Low: <input type={'checkbox'} checked={state[row['native-path']]?.checked}
                    onChange={e => {
                      saveState(row['native-path'], 'low', e.target.checked)
                    }}
      />
        High: <input type={'checkbox'} checked={state[row.path]?.checked}
                    onChange={e => {
                       saveState(row['native-path'], 'high', e.target.checked)
                    }}
      />

      </div>
    })}</div>
  );
}

export default Battery;
