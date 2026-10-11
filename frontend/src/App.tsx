import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { ExplainerPage } from './pages/ExplainerPage';
import { VisualStudioPage } from './pages/VisualStudioPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ProgressPage } from './pages/ProgressPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing & Marketing */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Views */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Student Dashboard Shell */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="explainer" element={<ExplainerPage />} />
            <Route path="visuals" element={<VisualStudioPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="quizzes" element={<QuizzesPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="progress" element={<ProgressPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
