import { added, trackpadOutput } from './__fixtures__/upower';
import {
  parseBodyLine,
  parseHeaderLine,
  parseBlock,
  splitLines,
} from './upower';

describe('upower monitor', () => {
  test('header line', () => {
    const result = parseHeaderLine(added.split('\n')[1]);
    expect(result).toMatchObject({
      fullPath:
        '/org/freedesktop/UPower/devices/touchpad_hid_bcod0o74obbof8oc4_battery',
      type: 'added',
    });
  });
  test('body line', () => {
    expect(
      parseBodyLine('native-path:          hid-bc:d0:74:bb:f8:c4-battery')
    ).toMatchObject({
      key: 'native-path',
      value: 'hid-bc:d0:74:bb:f8:c4-battery',
    });
    expect(
      parseBodyLine(' \t   native-path:          hid-bc:d0:74:bb:f8:c4-battery')
    ).toMatchObject({
      key: 'native-path',
      value: 'hid-bc:d0:74:bb:f8:c4-battery',
    });
    expect(
      parseBodyLine(
        'updated:              Sunday 05 May 2024 01:04:55 PM (0 seconds ago)'
      )
    ).toMatchObject({
      key: 'updated',
      value: 'Sunday 05 May 2024 01:04:55 PM (0 seconds ago)',
    });
  });
});
describe('upower single device', () => {
  test('parse single device output', () => {
    const result = parseBlock(splitLines(trackpadOutput), '/test/path');
    expect(result).toMatchObject({
      'native-path': 'hid-bc:d0:74:bb:f8:c4-battery',
      path: '/test/path',
      model: 'Magic Trackpad',
      'power supply': 'no',
      updated: 'Monday 06 May 2024 02:38:28 PM (30 seconds ago)',
      'has history': 'yes',
      'has statistics': 'yes',
      present: 'yes',
      rechargeable: 'yes',
      state: 'discharging',
      'warning-level': 'none',
      percentage: 21,
      'icon-name': "'battery-low-symbolic'",
    });
  });
});
