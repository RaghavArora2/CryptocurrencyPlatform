import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { Camera, Save, User, Mail, FileText, Award, Shield, Edit3 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ProfilePage: React.FC = () => {
  const { user, wallets, updateProfile } = useAuthStore();
  const { theme } = useThemeStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131'
  });

  // Get balance for specific currency from wallets array
  const getBalance = (currency: string) => {
    const wallet = wallets.find(w => w.currency.toLowerCase() === currency.toLowerCase());
    return wallet?.balance || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Calculate portfolio value using wallets data
  const btcPrice = 45000;
  const ethPrice = 3000;
  const portfolioValue = getBalance('USD') + (getBalance('BTC') * btcPrice) + (getBalance('ETH') * ethPrice);

  const achievements = [
    { title: 'First Trade', description: 'Completed your first cryptocurrency trade', earned: true },
    { title: 'Portfolio Builder', description: 'Reached $10,000 portfolio value', earned: portfolioValue > 10000 },
    { title: 'Diversified Trader', description: 'Hold at least 3 different cryptocurrencies', earned: false },
    { title: 'Diamond Hands', description: 'Hold positions for 30+ days', earned: false },
  ];

  const stats = [
    { label: 'Total Trades', value: '47', icon: '📊' },
    { label: 'Win Rate', value: '68%', icon: '🎯' },
    { label: 'Best Day', value: '+$2,340', icon: '🚀' },
    { label: 'Member Since', value: 'Jan 2024', icon: '📅' },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                  />
                  <button className={`absolute bottom-0 right-0 p-3 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors shadow-lg`}>
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {user?.username}
                </h1>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  Professional Crypto Trader
                </p>
                
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Verified Account
                  </span>
                </div>

                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    variant="primary"
                    className="w-full"
                    icon={Edit3}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleSubmit}
                      variant="primary"
                      className="w-full"
                      icon={Save}
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setEditing(false)}
                      variant="ghost"
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-6 mt-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                Trading Stats
              </h3>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {stat.label}
                      </span>
                    </div>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Form */}
            <Card className="p-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>
                Profile Information
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!editing}
                    icon={User}
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editing}
                    icon={Mail}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FileText className="w-4 h-4 inline mr-2" />
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!editing}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </form>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6 flex items-center`}>
                <Award className="w-6 h-6 mr-2 text-yellow-500" />
                Achievements
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      achievement.earned
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : theme === 'dark'
                        ? 'border-gray-600 bg-gray-700/50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}>
                        {achievement.earned ? '🏆' : '🔒'}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${
                          achievement.earned 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6 flex items-center`}>
                <Shield className="w-6 h-6 mr-2 text-green-500" />
                Security Settings
              </h2>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Two-Factor Authentication
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="primary" size="sm">
                      Enable
                    </Button>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Change Password
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Update your password regularly for better security
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;