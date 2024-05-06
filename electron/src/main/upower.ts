import { transformDeviceInfo } from './battery';

export function parseHeaderLine(line) {
  const parts = line
    .split(/\s+/)
    .filter((x) => x)
    .map((x) => x.trim());
  return {
    path: parts[3],
    type: parts[2].replace(':', ''),
  };
}

export function parseBodyLine(line) {
  const [key, ...value] = line.split(':');
  if (!key || value.length === 0) {
    return { key: '', value: '' };
  }
  return {
    key: key.trim(),
    value: value.join(':').trim(),
  };
}

function splitLines(block) {
  return block
    .split('\n')
    .map((x) => x.trim())
    .filter((x) => x);
}

export function parseBlock(block) {
  const deviceInfo = {};
  const lines = splitLines(block);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const { key, value } = parseBodyLine(line);
    if (key && value) {
      deviceInfo[key] = value;
    }
  }
  return transformDeviceInfo(deviceInfo);
}

export function parseMonitorOutput(block) {
  const lines = splitLines(block);
  let blockLines = [];
  const results = [];
  let result = { deviceInfo: {} };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith('[')) {
      if (blockLines.length > 0) {
        const combined = blockLines.join('\n');
        result.deviceInfo = parseBlock(combined);
        if (Object.keys(result.deviceInfo).length > 0) {
          results.push(result);
        }
      }

      blockLines = [];
      const { type, path } = parseHeaderLine(line);
      result = {
        type,
        path,
        deviceInfo: {},
      };
    } else {
      blockLines.push(line);
    }
  }
  if (blockLines.length > 0) {
    const combined = blockLines.join('\n');
    result.deviceInfo = parseBlock(combined);
    results.push(result);
  }
  return results;
}
