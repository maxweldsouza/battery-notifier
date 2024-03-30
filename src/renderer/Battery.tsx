import React, { useEffect, useState } from 'react';

const ipcRenderer = window.electron.ipcRenderer;
import { useInterval, useMountedState } from 'react-use';
import NormalContainer from '../shared/NormalContainer';
import Button from '../shared/Button';
import Table from '../shared/Table';
import Tr from '../shared/Tr';
import Th from '../shared/Th';
import Thead from '../shared/Thead';
import Tbody from '../shared/Tbody';
import Status from './Status';

const MIN_IN_MILLISECONDS = 60 * 1000;
const REFRESH_INTERVAL = 1 * MIN_IN_MILLISECONDS;

const humanizeStatus = status => status?.replace('-', ' ')

function Battery(props) {
  const [data, setData] = useState([]);
  const [preferences, setPreferences] = useState({});

  const isMounted = useMountedState();

  useEffect(() => {
    const preferences = window.electron.store.get('battery');
    if (preferences) {
      setPreferences(preferences);
    }
  }, []);

  useEffect(() => {
    ipcRenderer.on('receive-devices', (event: [], arg) => {
      setData(event);
    });
    ipcRenderer.sendMessage('get-devices');
    // Clean the listener after the component is dismounted
    return () => {
      ipcRenderer.removeAllListeners('receive-devices');
    };

  }, []);

  useInterval(() => {
    ipcRenderer.sendMessage('get-devices');
  }, isMounted ? REFRESH_INTERVAL : null);

  const saveState = (id, key, value) => {
    setPreferences(state => {
      const newPreferences = {
        ...state,
        [id]: {
          ...state[id],
          [key]: value
        }
      }
      window.electron.store.set('battery', newPreferences);
      return newPreferences;
    });
  };
  return (
    <NormalContainer>
      <Table>
        <Thead>
          <Tr>
          <Th>Device</Th>
          <Th>Percentage</Th>
          <Th>Status</Th>
          <Th>Low notification</Th>
          <Th>High notification</Th>
          </Tr>

        </Thead>
        <Tbody>
        {data.map(row => {
          const id = row['native-path'];
          return <Tr key={id}>
            <Th>
              {row.model}
            </Th>
            <Th>
              {row.percentage}%
            </Th>
            <Th>
              <Status>
                {/*0: Unknown*/}
                {/*1: Charging*/}
                {/*2: Discharging*/}
                {/*3: Empty*/}
                {/*4: Fully charged*/}
                {/*5: Pending charge*/}
                {/*6: Pending discharge*/}
                {humanizeStatus(row.state)}
              </Status>
            </Th>
            <Th>

              <input type={'checkbox'} checked={preferences[id]?.low !== false}
                     onChange={e => {
                       saveState(id, 'low', e.target.checked);
                     }}
              />
            </Th>
            <Th>
              <input type={'checkbox'} checked={preferences[id]?.high !== false}
                     onChange={e => {
                       saveState(id, 'high', e.target.checked);
                     }}
              />
            </Th>
          </Tr>;
        })}
        </Tbody>
      </Table>
      <Button onClick={() => {
        ipcRenderer.sendMessage('get-devices');
      }}>Refresh</Button>
    </NormalContainer>
  );
}

export default Battery;
