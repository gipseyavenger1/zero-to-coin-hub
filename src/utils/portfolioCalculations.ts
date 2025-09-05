interface Transaction {
  id: string;
  crypto_symbol: string;
  transaction_type: string;
  amount: number;
  purchase_price: number;
  fees: number;
  transaction_value: number;
  created_at: string;
}

interface PriceData {
  symbol: string;
  price_usd: number;
  change_24h: number;
}

interface PortfolioPosition {
  symbol: string;
  totalAmount: number;
  totalCost: number;
  averagePrice: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  totalFees: number;
  change24h: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalUnrealizedPnL: number;
  totalRealizedPnL: number;
  totalPnL: number;
  totalPnLPercent: number;
  totalFees: number;
  positions: PortfolioPosition[];
}

export const calculatePortfolioMetrics = (
  transactions: Transaction[],
  currentPrices: PriceData[]
): PortfolioMetrics => {
  const positions = new Map<string, {
    totalAmount: number;
    totalCost: number;
    realizedPnL: number;
    totalFees: number;
    transactions: Transaction[];
  }>();

  // Process all transactions
  transactions.forEach(tx => {
    const symbol = tx.crypto_symbol;
    
    if (!positions.has(symbol)) {
      positions.set(symbol, {
        totalAmount: 0,
        totalCost: 0,
        realizedPnL: 0,
        totalFees: 0,
        transactions: []
      });
    }

    const position = positions.get(symbol)!;
    position.transactions.push(tx);

    if (tx.transaction_type === 'buy' || tx.transaction_type === 'deposit') {
      position.totalAmount += tx.amount;
      position.totalCost += tx.transaction_value;
    } else if (tx.transaction_type === 'sell' || tx.transaction_type === 'withdrawal') {
      const averageCostBasis = position.totalAmount > 0 ? position.totalCost / position.totalAmount : 0;
      const soldValue = tx.amount * tx.purchase_price;
      const soldCost = tx.amount * averageCostBasis;
      
      position.realizedPnL += (soldValue - soldCost - tx.fees);
      position.totalAmount -= tx.amount;
      position.totalCost -= soldCost;
      
      // Ensure we don't go negative
      if (position.totalAmount < 0) position.totalAmount = 0;
      if (position.totalCost < 0) position.totalCost = 0;
    }

    position.totalFees += tx.fees;
  });

  // Calculate current portfolio metrics
  const portfolioPositions: PortfolioPosition[] = [];
  let totalValue = 0;
  let totalCost = 0;
  let totalUnrealizedPnL = 0;
  let totalRealizedPnL = 0;
  let totalFees = 0;

  positions.forEach((position, symbol) => {
    if (position.totalAmount <= 0) return;

    const priceData = currentPrices.find(p => p.symbol === symbol);
    const currentPrice = priceData?.price_usd || 0;
    const change24h = priceData?.change_24h || 0;

    const averagePrice = position.totalAmount > 0 ? position.totalCost / position.totalAmount : 0;
    const currentValue = position.totalAmount * currentPrice;
    const unrealizedPnL = currentValue - position.totalCost;
    const unrealizedPnLPercent = position.totalCost > 0 ? (unrealizedPnL / position.totalCost) * 100 : 0;

    portfolioPositions.push({
      symbol,
      totalAmount: position.totalAmount,
      totalCost: position.totalCost,
      averagePrice,
      currentPrice,
      currentValue,
      unrealizedPnL,
      unrealizedPnLPercent,
      realizedPnL: position.realizedPnL,
      totalFees: position.totalFees,
      change24h
    });

    totalValue += currentValue;
    totalCost += position.totalCost;
    totalUnrealizedPnL += unrealizedPnL;
    totalRealizedPnL += position.realizedPnL;
    totalFees += position.totalFees;
  });

  const totalPnL = totalUnrealizedPnL + totalRealizedPnL;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalUnrealizedPnL,
    totalRealizedPnL,
    totalPnL,
    totalPnLPercent,
    totalFees,
    positions: portfolioPositions.sort((a, b) => b.currentValue - a.currentValue)
  };
};

export const calculateFIFORealized = (
  symbol: string,
  sellAmount: number,
  sellPrice: number,
  buyTransactions: Transaction[]
): { realizedPnL: number; remainingBuys: Transaction[] } => {
  const sortedBuys = [...buyTransactions]
    .filter(tx => tx.crypto_symbol === symbol && (tx.transaction_type === 'buy' || tx.transaction_type === 'deposit'))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let remainingToSell = sellAmount;
  let realizedPnL = 0;
  const remainingBuys: Transaction[] = [];

  for (const buyTx of sortedBuys) {
    if (remainingToSell <= 0) {
      remainingBuys.push(buyTx);
      continue;
    }

    const sellFromThis = Math.min(remainingToSell, buyTx.amount);
    const profit = (sellPrice - buyTx.purchase_price) * sellFromThis;
    realizedPnL += profit;
    
    remainingToSell -= sellFromThis;

    // If there's remaining amount in this buy transaction
    if (buyTx.amount > sellFromThis) {
      remainingBuys.push({
        ...buyTx,
        amount: buyTx.amount - sellFromThis,
        transaction_value: (buyTx.amount - sellFromThis) * buyTx.purchase_price
      });
    }
  }

  return { realizedPnL, remainingBuys };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};

export const formatCrypto = (amount: number, symbol: string): string => {
  const decimals = amount < 1 ? 8 : amount < 1000 ? 4 : 2;
  return `${amount.toFixed(decimals)} ${symbol}`;
};