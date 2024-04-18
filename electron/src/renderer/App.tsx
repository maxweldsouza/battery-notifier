import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import '../shared/globals.css';
import { ThemeProvider } from 'styled-components';
import Battery from './Battery';
import { getTheme } from '../shared/theme';
import useColorScheme from '../shared/hooks/useColorScheme';
import { ErrorProvider } from '../shared/ErrorContext';

export default function App() {
  const colorScheme = useColorScheme();
  return (
    <ErrorProvider>
      <Router>
        <ThemeProvider theme={getTheme(colorScheme)}>
          <Routes>
            <Route path="/" element={<Battery />} />
          </Routes>
        </ThemeProvider>
      </Router>
    </ErrorProvider>
  );
}
