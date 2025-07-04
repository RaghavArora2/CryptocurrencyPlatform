import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import { useToast } from './hooks/useToast';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import TradingView from './components/trading/TradingView';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import AdvancedTradingPage from './pages/AdvancedTradingPage';
import SecurityPage from './pages/SecurityPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ToastContainer from './components/layout/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import ChatBot from './components/chat/ChatBot';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, fetchWallets } = useAuthStore();
  const { theme } = useThemeStore();
  const { info } = useToast();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchWallets();
      info('Welcome Back', 'Your trading dashboard is ready');
    }
  }, [isAuthenticated, fetchWallets, info]);
  
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
            path="/advanced-trading"
            element={
              <PrivateRoute>
                <AdvancedTradingPage />
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
          <Route
            path="/security"
            element={
              <PrivateRoute>
                <SecurityPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/trading" />} />
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;