import React, { useState } from 'react';
import { Shield, Lock, Smartphone, Key, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const SecurityFeatures: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const securityFeatures = [
    {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security with 2FA',
      icon: Smartphone,
      status: user?.two_factor_enabled ? 'enabled' : 'disabled',
      action: user?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA',
    },
    {
      title: 'Email Verification',
      description: 'Verify your email address for account security',
      icon: CheckCircle,
      status: user?.is_verified ? 'verified' : 'pending',
      action: user?.is_verified ? 'Verified' : 'Verify Email',
    },
    {
      title: 'API Access',
      description: 'Generate API keys for programmatic trading',
      icon: Key,
      status: apiKey ? 'active' : 'inactive',
      action: apiKey ? 'Regenerate Key' : 'Generate Key',
    },
    {
      title: 'Login Alerts',
      description: 'Get notified of suspicious login attempts',
      icon: AlertTriangle,
      status: 'enabled',
      action: 'Configure',
    },
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    try {
      const response = await api.post('/auth/generate-api-key');
      setApiKey(response.data.api_key);
      setSuccess('API key generated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate API key');
    }
  };

  const toggle2FA = async () => {
    try {
      if (user?.two_factor_enabled) {
        await api.post('/auth/disable-2fa');
        setSuccess('2FA disabled successfully');
      } else {
        await api.post('/auth/enable-2fa');
        setSuccess('2FA enabled successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle 2FA');
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <Shield className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Security Center
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <feature.icon className={`w-6 h-6 mt-1 ${
                    feature.status === 'enabled' || feature.status === 'verified' || feature.status === 'active'
                      ? 'text-green-500'
                      : 'text-yellow-500'
                  }`} />
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      feature.status === 'enabled' || feature.status === 'verified' || feature.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {feature.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={feature.title === 'Two-Factor Authentication' ? toggle2FA : 
                           feature.title === 'API Access' ? generateApiKey : undefined}
                  variant="ghost"
                  size="sm"
                  disabled={feature.status === 'verified'}
                >
                  {feature.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <Lock className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Change Password
          </h3>
        </div>

        {(error || success) && (
          <div className={`p-4 rounded-xl mb-6 ${
            success 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {error || success}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={Lock}
          >
            Change Password
          </Button>
        </form>
      </Card>

      {/* API Key Management */}
      {apiKey && (
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Key className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              API Key
            </h3>
          </div>

          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Your API Key
                </label>
                <div className="flex items-center space-x-2">
                  <code className={`flex-1 p-2 rounded font-mono text-sm ${
                    theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                  }`}>
                    {showApiKey ? apiKey : '•'.repeat(32)}
                  </code>
                  <Button
                    onClick={() => setShowApiKey(!showApiKey)}
                    variant="ghost"
                    size="sm"
                    icon={showApiKey ? EyeOff : Eye}
                  />
                </div>
              </div>
            </div>
            
            <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                    Security Warning
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    Keep your API key secure. Never share it publicly or commit it to version control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Security Tips */}
      <Card className="p-6">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
          Security Best Practices
        </h3>
        
        <div className="space-y-3">
          {[
            'Use a strong, unique password for your account',
            'Enable two-factor authentication for additional security',
            'Never share your login credentials or API keys',
            'Regularly review your account activity and trading history',
            'Use secure networks when accessing your account',
            'Keep your devices and browsers up to date',
            'Log out of your account when using shared computers',
          ].map((tip, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {tip}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SecurityFeatures;