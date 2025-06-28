// Mock data service to handle API failures gracefully
export const mockMarketData = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 45000,
    market_cap: 850000000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.5,
    price_change_percentage_7d_in_currency: 5.2,
    price_change_percentage_30d_in_currency: 12.8,
    total_volume: 25000000000,
    high_24h: 46500,
    low_24h: 44200,
    circulating_supply: 19500000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 69000,
    ath_change_percentage: -34.8,
    atl: 67.81,
    atl_change_percentage: 66300.2,
    last_updated: new Date().toISOString()
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3000,
    market_cap: 360000000000,
    market_cap_rank: 2,
    price_change_percentage_24h: 1.8,
    price_change_percentage_7d_in_currency: 3.5,
    price_change_percentage_30d_in_currency: 8.2,
    total_volume: 15000000000,
    high_24h: 3100,
    low_24h: 2950,
    circulating_supply: 120000000,
    total_supply: 120000000,
    max_supply: null,
    ath: 4878,
    ath_change_percentage: -38.5,
    atl: 0.432979,
    atl_change_percentage: 692800.1,
    last_updated: new Date().toISOString()
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    current_price: 0.45,
    market_cap: 15000000000,
    market_cap_rank: 8,
    price_change_percentage_24h: -0.8,
    price_change_percentage_7d_in_currency: 2.1,
    price_change_percentage_30d_in_currency: -5.2,
    total_volume: 800000000,
    high_24h: 0.47,
    low_24h: 0.43,
    circulating_supply: 35000000000,
    total_supply: 45000000000,
    max_supply: 45000000000,
    ath: 3.09,
    ath_change_percentage: -85.4,
    atl: 0.01925275,
    atl_change_percentage: 2238.9,
    last_updated: new Date().toISOString()
  }
];

export const generateMockChartData = (days: number = 30, basePrice: number = 45000): Array<{ time: number; value: number }> => {
  const data = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  for (let i = days - 1; i >= 0; i--) {
    const time = Math.floor((now - (i * dayMs)) / 1000);
    const volatility = 0.02;
    const trend = Math.sin(i / 10) * 0.01;
    const random = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + trend + random);
    
    data.push({
      time,
      value: Math.round(price * 100) / 100
    });
  }
  
  return data;
};

export const mockCoinDetails = {
  bitcoin: {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: {
      thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
      small: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
    },
    current_price: 45000,
    market_cap: 850000000000,
    market_cap_rank: 1,
    fully_diluted_valuation: 945000000000,
    total_volume: 25000000000,
    high_24h: 46500,
    low_24h: 44200,
    price_change_24h: 1125,
    price_change_percentage_24h: 2.5,
    price_change_percentage_7d: 5.2,
    price_change_percentage_30d: 12.8,
    circulating_supply: 19500000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 69000,
    ath_change_percentage: -34.8,
    ath_date: '2021-11-10T14:24:11.849Z',
    atl: 67.81,
    atl_change_percentage: 66300.2,
    atl_date: '2013-07-06T00:00:00.000Z',
    description: {
      en: 'Bitcoin is the first successful internet money based on peer-to-peer technology; whereby no central bank or authority is involved in the transaction and production of the Bitcoin currency.'
    },
    links: {
      homepage: ['https://bitcoin.org/'],
      blockchain_site: ['https://blockchair.com/bitcoin/', 'https://btc.com/', 'https://btc.tokenview.com/'],
      official_forum_url: ['https://bitcointalk.org/'],
      chat_url: [],
      announcement_url: [],
      twitter_screen_name: 'bitcoin',
      facebook_username: '',
      bitcointalk_thread_identifier: null,
      telegram_channel_identifier: '',
      subreddit_url: 'https://www.reddit.com/r/Bitcoin/',
      repos_url: {
        github: ['https://github.com/bitcoin/bitcoin', 'https://github.com/bitcoin/bips'],
        bitbucket: []
      }
    }
  }
};