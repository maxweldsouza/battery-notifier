import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import '../shared/globals.css';
import Battery from "./Battery";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Battery />} />
      </Routes>
    </Router>
  );
}
