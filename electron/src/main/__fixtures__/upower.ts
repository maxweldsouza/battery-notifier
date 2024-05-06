export const trackpadOutput = `

  native-path:          hid-bc:d0:74:bb:f8:c4-battery
  model:                Magic Trackpad
  power supply:         no
  updated:              Monday 06 May 2024 02:38:28 PM (30 seconds ago)
  has history:          yes
  has statistics:       yes
  touchpad
    present:             yes
    rechargeable:        yes
    state:               discharging
    warning-level:       none
    percentage:          21%
    icon-name:          'battery-low-symbolic'

`;

export const added = `
    [13:04:55.549]\tdevice added:     /org/freedesktop/UPower/devices/touchpad_hid_bcod0o74obbof8oc4_battery
  native-path:          hid-bc:d0:74:bb:f8:c4-battery
  model:                Magic Trackpad
  power supply:         no
  updated:              Sunday 05 May 2024 01:04:55 PM (0 seconds ago)
  has history:          yes
  has statistics:       yes
  touchpad
    present:             yes
    rechargeable:        yes
    state:               discharging
    warning-level:       none
    percentage:          28%
    icon-name:          'battery-low-symbolic'
  History (charge):
    1714894495\t28.000\tdischarging
    1714894495\t0.000\tunknown
    1714894464\t28.000\tdischarging
    1714894464\t0.000\tunknown
  History (rate):
    1714894495\t0.000\tunknown
    1714894464\t0.000\tunknown
    `;

export const combinedOutput = `

  Monitoring activity from the power daemon. Press Ctrl+C to cancel.
[14:45:18.701]\tdevice changed:     /org/freedesktop/UPower/devices/touchpad_hid_bcod0o74obbof8oc4_battery
  native-path:          hid-bc:d0:74:bb:f8:c4-battery
  model:                Magic Trackpad
  power supply:         no
  updated:              Monday 06 May 2024 02:44:28 PM (50 seconds ago)
  has history:          yes
  has statistics:       yes
  touchpad
    present:             yes
    rechargeable:        yes
    state:               unknown
    warning-level:       none
    percentage:          21%
    icon-name:          'battery-missing-symbolic'

[14:45:18.702]\tdevice removed:   /org/freedesktop/UPower/devices/touchpad_hid_bcod0o74obbof8oc4_battery

[14:45:23.960]\tdevice added:     /org/freedesktop/UPower/devices/touchpad_hid_bcod0o74obbof8oc4_battery
  native-path:          hid-bc:d0:74:bb:f8:c4-battery
  model:                Magic Trackpad
  power supply:         no
  updated:              Monday 06 May 2024 02:45:23 PM (0 seconds ago)
  has history:          yes
  has statistics:       yes
  touchpad
    present:             yes
    rechargeable:        yes
    state:               discharging
    warning-level:       none
    percentage:          21%
    icon-name:          'battery-low-symbolic'
  History (charge):
    1714986923\t21.000\tdischarging
    1714986923\t0.000\tunknown
  History (rate):
    1714986923\t0.000\tunknown

`;
