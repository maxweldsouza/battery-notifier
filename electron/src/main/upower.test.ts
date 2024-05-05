import { added } from './__fixtures__/upower';
import { parseBlock, parseBodyLine, parseHeaderLine } from './upower';

describe('upower monitor', () => {
  test('header line', () => {
    const result = parseHeaderLine(added.split('\n')[1]);
    expect(result).toMatchObject({
      path: '/org/freedesktop/UPower/devices/touchpad_hid_bcod0o74obbof8oc4_battery',
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
  test('device removed', () => {
    const result = parseBlock(added);
    console.log('result: ', result);
  });
});
