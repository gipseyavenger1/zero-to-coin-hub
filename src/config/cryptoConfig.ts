// Real-time cryptocurrency portfolio tracker configuration

export const CRYPTO_CONFIG = {
  // Price update intervals
  PRICE_UPDATE_INTERVAL: 300000, // 5 minutes in milliseconds
  FAST_UPDATE_INTERVAL: 60000,   // 1 minute for active trading
  SLOW_UPDATE_INTERVAL: 600000,  // 10 minutes for background updates
  
  // API settings
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 2000, // 2 seconds base delay for exponential backoff
  
  // Performance alerts
  PERFORMANCE_ALERT_THRESHOLD: 20, // 20% change triggers alert
  HIGH_PERFORMANCE_THRESHOLD: 50,  // 50% gain threshold
  
  // Supported cryptocurrencies
  SUPPORTED_CRYPTOS: [
    { symbol: 'BTC', name: 'Bitcoin', color: '#f7931a' },
    { symbol: 'ETH', name: 'Ethereum', color: '#627eea' },
    { symbol: 'USDT', name: 'Tether', color: '#26a17b' },
    { symbol: 'BNB', name: 'Binance Coin', color: '#f3ba2f' },
    { symbol: 'ADA', name: 'Cardano', color: '#0033ad' },
    { symbol: 'SOL', name: 'Solana', color: '#9945ff' },
    { symbol: 'XRP', name: 'XRP', color: '#23292f' },
    { symbol: 'DOT', name: 'Polkadot', color: '#e6007a' },
    { symbol: 'MATIC', name: 'Polygon', color: '#8247e5' },
    { symbol: 'AVAX', name: 'Avalanche', color: '#e84142' }
  ] as const,
  
  // Portfolio settings
  ZERO_BALANCE_PORTFOLIO: {
    totalValue: 0,
    totalCost: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    positions: []
  },
  
  // Chart settings
  CHART_COLORS: {
    primary: '#8b5cf6',
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#6b7280'
  }
} as const;

export type CryptoSymbol = typeof CRYPTO_CONFIG.SUPPORTED_CRYPTOS[number]['symbol'];

export const getCryptoColor = (symbol: string): string => {
  const crypto = CRYPTO_CONFIG.SUPPORTED_CRYPTOS.find(c => c.symbol === symbol);
  return crypto?.color || '#8884d8';
};

export const getCryptoName = (symbol: string): string => {
  const crypto = CRYPTO_CONFIG.SUPPORTED_CRYPTOS.find(c => c.symbol === symbol);
  return crypto?.name || symbol;
};