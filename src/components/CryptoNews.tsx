import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  source: string;
  url: string;
  category: 'market' | 'technology' | 'regulation' | 'adoption';
  sentiment: 'positive' | 'negative' | 'neutral';
}

const CryptoNews: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All News', icon: Newspaper },
    { id: 'market', name: 'Market', icon: TrendingUp },
    { id: 'technology', name: 'Technology', icon: AlertTriangle },
    { id: 'regulation', name: 'Regulation', icon: AlertTriangle },
    { id: 'adoption', name: 'Adoption', icon: TrendingUp },
  ];

  const mockNews: NewsArticle[] = [
    {
      id: '1',
      title: 'Bitcoin Reaches New All-Time High as Institutional Adoption Soars',
      description: 'Major corporations continue to add Bitcoin to their treasury reserves, driving unprecedented demand and pushing prices to historic levels.',
      publishedAt: '2024-01-04T10:30:00Z',
      source: 'CryptoDaily',
      url: '#',
      category: 'market',
      sentiment: 'positive'
    },
    {
      id: '2',
      title: 'Ethereum 2.0 Staking Rewards Surge as Network Activity Peaks',
      description: 'The Ethereum network sees record-breaking transaction volume while stakers enjoy increased rewards from network fees.',
      publishedAt: '2024-01-04T09:15:00Z',
      source: 'BlockchainNews',
      url: '#',
      category: 'technology',
      sentiment: 'positive'
    },
    {
      id: '3',
      title: 'New Regulatory Framework Brings Clarity to Cryptocurrency Markets',
      description: 'Government officials announce comprehensive guidelines that could provide much-needed regulatory certainty for digital assets.',
      publishedAt: '2024-01-04T08:45:00Z',
      source: 'RegulatoryUpdate',
      url: '#',
      category: 'regulation',
      sentiment: 'neutral'
    },
    {
      id: '4',
      title: 'Major Payment Processor Integrates Cryptocurrency Payments',
      description: 'Leading fintech company announces support for Bitcoin and Ethereum payments, expanding crypto adoption in retail.',
      publishedAt: '2024-01-04T07:30:00Z',
      source: 'PaymentNews',
      url: '#',
      category: 'adoption',
      sentiment: 'positive'
    },
    {
      id: '5',
      title: 'DeFi Protocol Launches Revolutionary Yield Farming Platform',
      description: 'New decentralized finance platform promises higher yields and better security features for cryptocurrency investors.',
      publishedAt: '2024-01-04T06:20:00Z',
      source: 'DeFiToday',
      url: '#',
      category: 'technology',
      sentiment: 'positive'
    },
    {
      id: '6',
      title: 'Central Bank Digital Currency Pilot Program Shows Promise',
      description: 'Early results from CBDC testing reveal potential for modernizing traditional banking infrastructure.',
      publishedAt: '2024-01-04T05:15:00Z',
      source: 'CentralBankWatch',
      url: '#',
      category: 'regulation',
      sentiment: 'neutral'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchNews = async () => {
      setLoading(true);
      // In a real app, you'd fetch from a crypto news API like CoinDesk, CryptoCompare, or NewsAPI
      setTimeout(() => {
        setNews(mockNews);
        setLoading(false);
      }, 1000);
    };

    fetchNews();
  }, []);

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(article => article.category === selectedCategory);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishedAt = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return publishedAt.toLocaleDateString();
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              Cryptocurrency News
            </CardTitle>
            <CardDescription>
              Latest updates from the crypto world
            </CardDescription>
          </div>
          <Badge variant="outline">
            Live Updates
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-1"
              >
                <Icon className="h-3 w-3" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* News Articles */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full mb-1"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            filteredNews.map((article) => (
              <div
                key={article.id}
                className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(article.publishedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSentimentBadge(article.sentiment)} className="text-xs">
                      {article.category}
                    </Badge>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-2 hover:text-primary cursor-pointer">
                  {article.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                    {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)} sentiment
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Read more <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredNews.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No news articles found for this category.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CryptoNews;