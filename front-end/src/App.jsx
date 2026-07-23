import { Routes, Route } from "react-router-dom";
import SilentInterviewEngine from "./features/silentInterview/SilentInterviewEngine";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SilentInterviewEngine />} />
      <Route path="/auth" element={<LoginPage />} />
    </Routes>
  );
}