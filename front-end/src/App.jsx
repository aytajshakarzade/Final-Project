import { Route, Routes } from 'react-router-dom';
import SilentInterviewEngine from './features/silentInterview/SilentInterviewEngine';

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<SilentInterviewEngine />} />
    </Routes>
  );
}
