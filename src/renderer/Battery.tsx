import React, {useEffect, useState} from 'react';
const ipcRenderer  = window.electron.ipcRenderer
import { useInterval, useMountedState } from 'react-use';

const MIN_IN_MILLISECONDS = 60 * 1000
const REFRESH_INTERVAL = 1 * MIN_IN_MILLISECONDS

function Battery(props) {
  const [data, setData] = useState([]);
  const [preferences, setPreferences] = useState({})

  const isMounted = useMountedState();

  useEffect(() => {
    const preferences = window.electron.store.get('battery')
    setPreferences(preferences)
  }, [])

  useEffect(() => {
    window.electron.store.set('battery', preferences)
  }, [preferences])

  useEffect(() => {
    ipcRenderer.on('receive-devices', (event: [], arg) => {
      setData(event);
      console.log(event, new Date())
    });
    ipcRenderer.sendMessage('get-devices');
    // Clean the listener after the component is dismounted
    return () => {
      ipcRenderer.removeAllListeners('receive-devices');
    };

  }, []);

  useInterval(() => {
    ipcRenderer.sendMessage('get-devices')
  }, isMounted ? REFRESH_INTERVAL : null)

  const saveState = (id, key, value) => {
    setPreferences(state => {
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
    <div className={''}>
    <div>{data.map(row => {
      const id = row['native-path']
      return <div className={'row'} key={id}>
        <div className='name'>
          {row.model}
        </div>
        <div className='percentage'>
        {row.percentage}%
        </div>
        <div className={'device-state'}>
          {/*0: Unknown*/}
          {/*1: Charging*/}
          {/*2: Discharging*/}
          {/*3: Empty*/}
          {/*4: Fully charged*/}
          {/*5: Pending charge*/}
          {/*6: Pending discharge*/}

          {row.state}
        </div>
        Low: <input type={'checkbox'} checked={preferences[id]?.low}
                    onChange={e => {
                      saveState(id, 'low', e.target.checked)
                    }}
      />
        High: <input type={'checkbox'} checked={preferences[id]?.high}
                    onChange={e => {
                       saveState(id, 'high', e.target.checked)
                    }}
      />

      </div>
    })}</div>
      <button onClick={() => {
        ipcRenderer.sendMessage('get-devices')
      }}>Refresh</button>
    </div>
  );
}

export default Battery;
