import React from 'react';
import { Shield, Lock, Award, Users, Globe, CheckCircle, Star, TrendingUp } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import Card from '../ui/Card';

const TrustIndicators: React.FC = () => {
  const { theme } = useThemeStore();

  const trustFeatures = [
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: '256-bit SSL encryption and cold storage',
      verified: true,
    },
    {
      icon: Lock,
      title: 'Regulatory Compliance',
      description: 'Licensed and regulated financial institution',
      verified: true,
    },
    {
      icon: Award,
      title: 'Industry Awards',
      description: 'Best Crypto Exchange 2024',
      verified: true,
    },
    {
      icon: Users,
      title: '10M+ Users',
      description: 'Trusted by millions worldwide',
      verified: true,
    },
  ];

  const securityCertifications = [
    'SOC 2 Type II Certified',
    'ISO 27001 Compliant',
    'PCI DSS Level 1',
    'CCSS Certified',
  ];

  const stats = [
    { label: 'Total Volume Traded', value: '$2.5B+', icon: TrendingUp },
    { label: 'Active Users', value: '10M+', icon: Users },
    { label: 'Countries Served', value: '180+', icon: Globe },
    { label: 'Uptime', value: '99.9%', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Trust Badges */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
            Trusted by Millions
          </h2>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Your security and trust are our top priorities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
              }`}>
                <feature.icon className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                {feature.title}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                {feature.description}
              </p>
              {feature.verified && (
                <div className="flex items-center justify-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">Verified</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Platform Statistics */}
      <Card className="p-6">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6 text-center`}>
          Platform Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
                {stat.value}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Security Certifications */}
      <Card className="p-6">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>
          Security Certifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityCertifications.map((cert, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
              }`}>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {cert}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Customer Reviews */}
      <Card className="p-6">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>
          What Our Users Say
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Sarah Johnson',
              role: 'Professional Trader',
              rating: 5,
              comment: 'Best trading platform I\'ve used. Fast execution and great security.',
            },
            {
              name: 'Michael Chen',
              role: 'Crypto Investor',
              rating: 5,
              comment: 'Excellent customer support and user-friendly interface.',
            },
            {
              name: 'Emma Davis',
              role: 'Day Trader',
              rating: 5,
              comment: 'Advanced features and reliable uptime. Highly recommended!',
            },
          ].map((review, index) => (
            <div key={index} className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                "{review.comment}"
              </p>
              <div>
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {review.name}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {review.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TrustIndicators;