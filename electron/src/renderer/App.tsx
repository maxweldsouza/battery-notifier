import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import '../shared/globals.css';
import { ThemeProvider } from 'styled-components';
import Battery from './Battery';
import { getTheme } from '../shared/theme';

export default function App() {
  return (
    <Router>
      <ThemeProvider theme={getTheme('dark')}>
        <Routes>
          <Route path="/" element={<Battery />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}
