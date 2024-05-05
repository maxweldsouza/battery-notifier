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

export function parseBlock(block) {
  const lines = block
    .split('\n')
    .map((x) => x.trim())
    .filter((x) => x);
  let result = { deviceInfo: {} };
  const results = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith('[')) {
      const { type, path } = parseHeaderLine(line);
      if (Object.keys(result.deviceInfo).length > 0) {
        results.push(result);
      }
      result = {
        type,
        path,
        deviceInfo: {},
      };
    } else {
      const { key, value } = parseBodyLine(line);
      if (key && value) {
        result.deviceInfo[key] = value;
      }
    }
  }
  results.push(result);
  return results;
}
