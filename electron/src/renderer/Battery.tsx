import React, { useEffect, useState } from 'react';
import { isNumber } from 'lodash-es';
import styled from 'styled-components';
import { Battery0Icon } from '@heroicons/react/24/outline';
import NormalContainer from '../shared/NormalContainer';
import Tr from '../shared/Tr';
import Th from '../shared/Th';
import Thead from '../shared/Thead';
import Tbody from '../shared/Tbody';
import Status from './Status';
import useElectronStore from '../shared/electron/store/useElectronStoreState';
import CustomTable from './CustomTable';
import Debug from './Debug';
import EmptyState from '../shared/EmptyState';

const { ipcRenderer } = window.electron;

const humanizeStatus = (status) => status?.replace('-', ' ');

const LightText = styled.span`
  color: #c2c2c2;
`;

function Battery() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useElectronStore('battery', {});

  useEffect(() => {
    const listener = (devices) => {
      setData(devices);
      setLoading(false);
    };
    const cleanup = ipcRenderer.on('receive-devices', listener);
    ipcRenderer.sendMessage('get-devices');
    return cleanup;
  }, []);

  const saveState = (id, key, value) => {
    setPreferences({
      [id]: {
        [key]: value,
      },
    });
  };
  if (loading) return null;
  if (data.length === 0) {
    return (
      <EmptyState>
        <Battery0Icon height={128} />
        No devices found
      </EmptyState>
    );
  }
  return (
    <NormalContainer>
      <CustomTable>
        <Thead>
          <Tr>
            <Th>Device</Th>
            <Th>Percentage</Th>
            <Th />
            <Th>Status</Th>
            <Th>Low notification</Th>
            <Th>High notification</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row) => {
            const id = row['native-path'];
            return (
              <Tr key={id}>
                <Th>{row.model}</Th>
                <Th>
                  <progress max="100" value={row.percentage}>
                    {row.percentage}%
                  </progress>
                </Th>
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
      </CustomTable>
    </NormalContainer>
  );
}

export default Battery;
