import React, { useState } from 'react';

function Settings(props) {
  const [autostart, setAutostart] = useState(false);
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={autostart}
          onChange={(e) => setAutostart(!autostart)}
        />
        Automatically start on startup
      </label>
    </div>
  );
}

export default Settings;
