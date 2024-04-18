import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import '../shared/globals.css';
import { ThemeProvider } from 'styled-components';
import Battery from './Battery';
import { getTheme } from '../shared/theme';
import useColorScheme from '../shared/hooks/useColorScheme';

export default function App() {
  const colorScheme = useColorScheme();
  return (
    <Router>
      <ThemeProvider theme={getTheme(colorScheme)}>
        <Routes>
          <Route path="/" element={<Battery />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}
