import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import CurriculumListPage from './pages/CurriculumListPage';
import CurriculumUploadPage from './pages/CurriculumUploadPage';
import CurriculumEditPage from './pages/CurriculumEditPage';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <Router>
            <div className="min-h-screen bg-spark-gray-100">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                
                {/* Protected routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="curricula" element={<CurriculumListPage />} />
                  <Route path="upload" element={<CurriculumUploadPage />} />
                  <Route path="edit/:id" element={<CurriculumEditPage />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
