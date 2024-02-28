import React, {useEffect, useState} from 'react';
const ipcRenderer  = window.electron.ipcRenderer

function Battery(props) {
  const [data, setData] = useState([]);
  const [preferences, setPreferences] = useState({})

  useEffect(() => {
    const preferences = window.electron.store.get('battery')
    console.log(preferences)
    setPreferences(preferences)
  }, [])

  useEffect(() => {
    window.electron.store.set('battery', preferences)
  }, [preferences])

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
  console.log('preferences: ', preferences);
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
    <div>{data.map(row => {
      const id = row['native-path']
      console.log('row, preferences: ', row, preferences);
      return <div className={'row'} key={id}>
        <div className='name'>
          {row.model}
        </div>
        <div className='percentage'>
        {row.percentage}%
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
  );
}

export default Battery;
