import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import TradingView from './components/trading/TradingView';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ChatBot from './components/chat/ChatBot';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { theme } = useThemeStore();
  
  return isAuthenticated ? (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <Footer />
      <ChatBot />
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  const { theme } = useThemeStore();
  
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/trading"
            element={
              <PrivateRoute>
                <TradingView />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <PrivateRoute>
                <WalletPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/trading" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;