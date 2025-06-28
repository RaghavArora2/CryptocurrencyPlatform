import React, { useState } from 'react';
import { Shield, Lock, Smartphone, Key, AlertTriangle, CheckCircle, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';

const SecurityFeatures: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  const securityFeatures = [
    {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security with 2FA',
      icon: Smartphone,
      status: user?.two_factor_enabled ? 'enabled' : 'disabled',
      action: user?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA',
      critical: true,
    },
    {
      title: 'Email Verification',
      description: 'Verify your email address for account security',
      icon: CheckCircle,
      status: user?.is_verified ? 'verified' : 'pending',
      action: user?.is_verified ? 'Verified' : 'Verify Email',
      critical: false,
    },
    {
      title: 'API Access',
      description: 'Generate API keys for programmatic trading',
      icon: Key,
      status: apiKey ? 'active' : 'inactive',
      action: apiKey ? 'Regenerate Key' : 'Generate Key',
      critical: false,
    },
    {
      title: 'Login Alerts',
      description: 'Get notified of suspicious login attempts',
      icon: AlertTriangle,
      status: 'enabled',
      action: 'Configure',
      critical: false,
    },
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      error('Password Mismatch', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      error('Weak Password', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      success('Password Changed', 'Your password has been updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error('Password Change Failed', err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    setApiKeyLoading(true);
    try {
      const response = await api.post('/auth/generate-api-key');
      setApiKey(response.data.api_key);
      success('API Key Generated', 'Your new API key has been created successfully');
    } catch (err: any) {
      error('API Key Generation Failed', err.response?.data?.message || 'Failed to generate API key');
    } finally {
      setApiKeyLoading(false);
    }
  };

  const toggle2FA = async () => {
    setTwoFactorLoading(true);
    try {
      if (user?.two_factor_enabled) {
        await api.post('/auth/disable-2fa');
        success('2FA Disabled', 'Two-factor authentication has been disabled');
      } else {
        await api.post('/auth/enable-2fa');
        success('2FA Enabled', 'Two-factor authentication has been enabled');
      }
    } catch (err: any) {
      error('2FA Toggle Failed', err.response?.data?.message || 'Failed to toggle 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const copyApiKey = async () => {
    if (apiKey) {
      try {
        await navigator.clipboard.writeText(apiKey);
        success('Copied', 'API key copied to clipboard');
      } catch (err) {
        error('Copy Failed', 'Failed to copy API key to clipboard');
      }
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
              className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              } ${feature.critical ? 'ring-2 ring-yellow-500/20' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <feature.icon className={`w-6 h-6 mt-1 ${
                    feature.status === 'enabled' || feature.status === 'verified' || feature.status === 'active'
                      ? 'text-green-500'
                      : feature.critical
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  }`} />
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                      {feature.critical && feature.status !== 'enabled' && (
                        <span className="ml-2 text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full">
                          Critical
                        </span>
                      )}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      feature.status === 'enabled' || feature.status === 'verified' || feature.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : feature.critical
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {feature.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={
                    feature.title === 'Two-Factor Authentication' ? toggle2FA : 
                    feature.title === 'API Access' ? generateApiKey : 
                    undefined
                  }
                  variant={feature.status === 'verified' ? 'ghost' : 'primary'}
                  size="sm"
                  disabled={feature.status === 'verified'}
                  loading={
                    feature.title === 'Two-Factor Authentication' ? twoFactorLoading :
                    feature.title === 'API Access' ? apiKeyLoading :
                    false
                  }
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

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
            icon={Lock}
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 8 characters)"
            required
            icon={Lock}
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            icon={Lock}
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={Lock}
            className="w-full"
          >
            Change Password
          </Button>
        </form>
      </Card>

      {/* API Key Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Key className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              API Key Management
            </h3>
          </div>
          {apiKey && (
            <Button
              onClick={generateApiKey}
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              loading={apiKeyLoading}
            >
              Regenerate
            </Button>
          )}
        </div>

        {!apiKey ? (
          <div className="text-center py-8">
            <Key className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
              No API Key Generated
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Generate an API key to access our trading API programmatically
            </p>
            <Button
              onClick={generateApiKey}
              variant="primary"
              icon={Key}
              loading={apiKeyLoading}
            >
              Generate API Key
            </Button>
          </div>
        ) : (
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <label className={`block text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Your API Key
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setShowApiKey(!showApiKey)}
                  variant="ghost"
                  size="sm"
                  icon={showApiKey ? EyeOff : Eye}
                />
                <Button
                  onClick={copyApiKey}
                  variant="ghost"
                  size="sm"
                  icon={Copy}
                />
              </div>
            </div>
            
            <div className={`p-3 rounded-lg font-mono text-sm break-all ${
              theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
            }`}>
              {showApiKey ? apiKey : '•'.repeat(32)}
            </div>
            
            <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
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
        )}
      </Card>

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
            'Monitor your email for security alerts and notifications',
          ].map((tip, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
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