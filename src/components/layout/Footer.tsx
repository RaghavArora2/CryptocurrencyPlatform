import React from 'react';
import useThemeStore from '../../store/themeStore';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const { theme } = useThemeStore();
  
  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-6">
            <a href="https://github.com/raghav" target="_blank" rel="noopener noreferrer" 
               className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <Github className="w-6 h-6" />
            </a>
            <a href="https://twitter.com/raghav" target="_blank" rel="noopener noreferrer"
               className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <Twitter className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com/in/raghav" target="_blank" rel="noopener noreferrer"
               className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Made with ❤️ by Raghav
          </p>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            © 2024 CryptoTrade. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;