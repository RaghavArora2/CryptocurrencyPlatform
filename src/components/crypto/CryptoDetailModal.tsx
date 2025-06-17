import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, ExternalLink, Globe, Twitter, Github } from 'lucide-react';
import { getCoinDetails, getCoinHistoricalData, CoinDetails } from '../../services/api/coinGecko';
import useThemeStore from '../../store/themeStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface CryptoDetailModalProps {
  coinId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CryptoDetailModal: React.FC<CryptoDetailModalProps> = ({ coinId, isOpen, onClose }) => {
  const { theme } = useThemeStore();
  const [coinDetails, setCoinDetails] = useState<CoinDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'links'>('overview');

  useEffect(() => {
    if (isOpen && coinId) {
      fetchCoinDetails();
    }
  }, [isOpen, coinId]);

  const fetchCoinDetails = async () => {
    setLoading(true);
    try {
      const details = await getCoinDetails(coinId);
      setCoinDetails(details);
    } catch (error) {
      console.error('Error fetching coin details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {coinDetails?.image?.large && (
                <img
                  src={coinDetails.image.large}
                  alt={coinDetails.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {coinDetails?.name || 'Loading...'}
                </h2>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {coinDetails?.symbol?.toUpperCase()}
                </p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : coinDetails ? (
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Price Section */}
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Current Price
                  </p>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(coinDetails.current_price)}
                  </p>
                  <div className={`flex items-center mt-2 ${
                    coinDetails.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {coinDetails.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <span className="font-medium">
                      {formatPercentage(coinDetails.price_change_percentage_24h)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Market Cap
                  </p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(coinDetails.market_cap)}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Rank #{coinDetails.market_cap_rank}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    24h Volume
                  </p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(coinDetails.total_volume)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'stats', label: 'Statistics' },
                  { id: 'links', label: 'Links' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : theme === 'dark'
                        ? 'border-transparent text-gray-400 hover:text-gray-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      About {coinDetails.name}
                    </h3>
                    <div 
                      className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}
                      dangerouslySetInnerHTML={{ 
                        __html: coinDetails.description?.en?.slice(0, 500) + '...' || 'No description available.' 
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        24h High
                      </p>
                      <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(coinDetails.high_24h)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        24h Low
                      </p>
                      <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(coinDetails.low_24h)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        All-Time High
                      </p>
                      <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(coinDetails.ath)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        All-Time Low
                      </p>
                      <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(coinDetails.atl)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Supply Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          Circulating Supply
                        </span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {coinDetails.circulating_supply?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          Total Supply
                        </span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {coinDetails.total_supply?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          Max Supply
                        </span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {coinDetails.max_supply?.toLocaleString() || 'Unlimited'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Price Changes
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          7 Days
                        </span>
                        <span className={`font-medium ${
                          coinDetails.price_change_percentage_7d >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatPercentage(coinDetails.price_change_percentage_7d || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          30 Days
                        </span>
                        <span className={`font-medium ${
                          coinDetails.price_change_percentage_30d >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatPercentage(coinDetails.price_change_percentage_30d || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          From ATH
                        </span>
                        <span className={`font-medium ${
                          coinDetails.ath_change_percentage >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatPercentage(coinDetails.ath_change_percentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Official Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coinDetails.links?.homepage?.[0] && (
                        <a
                          href={coinDetails.links.homepage[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <Globe className="w-5 h-5 text-blue-500" />
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            Official Website
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      )}
                      
                      {coinDetails.links?.twitter_screen_name && (
                        <a
                          href={`https://twitter.com/${coinDetails.links.twitter_screen_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <Twitter className="w-5 h-5 text-blue-400" />
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            Twitter
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      )}
                      
                      {coinDetails.links?.repos_url?.github?.[0] && (
                        <a
                          href={coinDetails.links.repos_url.github[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <Github className="w-5 h-5 text-gray-600" />
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            GitHub
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      )}
                      
                      {coinDetails.links?.subreddit_url && (
                        <a
                          href={coinDetails.links.subreddit_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">r</span>
                          </div>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            Reddit
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Failed to load cryptocurrency details.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CryptoDetailModal;