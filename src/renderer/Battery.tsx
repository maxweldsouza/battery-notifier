import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { isNumber } from 'lodash-es';
import styled from 'styled-components';
import NormalContainer from '../shared/NormalContainer';
import Table from '../shared/Table';
import Tr from '../shared/Tr';
import Th from '../shared/Th';
import Thead from '../shared/Thead';
import Tbody from '../shared/Tbody';
import Status from './Status';
import useElectronStore from '../shared/electron/store/useElectronStoreState';

const { ipcRenderer } = window.electron;

// const MIN_IN_MILLISECONDS = 60 * 1000;
// const REFRESH_INTERVAL = 1 * MIN_IN_MILLISECONDS;

const humanizeStatus = (status) => status?.replace('-', ' ');

const LightText = styled.span`
  color: #c2c2c2;
`;

function Battery() {
  const [data, setData] = useSetState({});
  const [preferences, setPreferences] = useElectronStore('battery', {});

  // const isMounted = useMountedState();

  useEffect(() => {
    ipcRenderer.on('device-update', (device) => {
      setData(device);
    });
  }, [setData]);

  useEffect(() => {
    ipcRenderer.on('receive-devices', (devices) => {
      setData(devices);
    });
    ipcRenderer.sendMessage('get-devices');
    // Clean the listener after the component is dismounted
    return () => {
      ipcRenderer.removeAllListeners('receive-devices');
    };
  }, [setData]);

  const saveState = (id, key, value) => {
    setPreferences({
      [id]: {
        [key]: value,
      },
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
          {Object.keys(data).map((key) => {
            const row = data[key];
            const id = row['native-path'];
            return (
              <Tr key={id}>
                <Th>{row.model}</Th>
                <Th>
                  {isNumber(row.percentage) ? (
                    <>
                      {row.percentage}
                      <LightText> %</LightText>
                    </>
                  ) : (
                    '-'
                  )}
                </Th>
                <Th>
                  <Status>
                    {/* 0: Unknown */}
                    {/* 1: Charging */}
                    {/* 2: Discharging */}
                    {/* 3: Empty */}
                    {/* 4: Fully charged */}
                    {/* 5: Pending charge */}
                    {/* 6: Pending discharge */}
                    {humanizeStatus(row.state)}
                  </Status>
                </Th>
                <Th>
                  <input
                    type="checkbox"
                    checked={preferences[id]?.low !== false}
                    onChange={(e) => {
                      saveState(id, 'low', e.target.checked);
                    }}
                  />
                </Th>
                <Th>
                  <input
                    type="checkbox"
                    checked={preferences[id]?.high !== false}
                    onChange={(e) => {
                      saveState(id, 'high', e.target.checked);
                    }}
                  />
                </Th>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </NormalContainer>
  );
}

export default Battery;
