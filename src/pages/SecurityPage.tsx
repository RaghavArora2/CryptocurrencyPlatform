import React from 'react';
import useThemeStore from '../store/themeStore';
import SecurityFeatures from '../components/security/SecurityFeatures';
import TrustIndicators from '../components/layout/TrustIndicators';
import { Shield, Award } from 'lucide-react';

const SecurityPage: React.FC = () => {
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = React.useState<'security' | 'trust'>('security');

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1440px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
            Security & Trust
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Your security is our top priority. Manage your account security and learn about our trust measures.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : theme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Security Settings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('trust')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'trust'
                  ? 'border-blue-500 text-blue-600'
                  : theme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Trust & Compliance</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'security' ? <SecurityFeatures /> : <TrustIndicators />}
      </div>
    </div>
  );
};

export default SecurityPage;