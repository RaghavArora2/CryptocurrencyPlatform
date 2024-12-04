import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { Camera, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { theme } = useThemeStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setEditing(false);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={formData.avatar}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
              <button className={`absolute bottom-0 right-0 p-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
              <div>
                <label className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!editing}
                  className={`mt-1 block w-full rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className={`mt-1 block w-full rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editing}
                  rows={4}
                  className={`mt-1 block w-full rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                />
              </div>

              <div className="flex justify-end space-x-4">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;