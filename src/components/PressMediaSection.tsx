import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Quote } from 'lucide-react';
import forbesLogo from '@/assets/forbes-logo.png';
import techcrunchLogo from '@/assets/techcrunch-logo.png';
import bloombergLogo from '@/assets/bloomberg-logo.png';

interface PressItem {
  id: string;
  publication: string;
  publicationLogo: string;
  quote: string;
  author?: string;
  date: string;
  articleUrl: string;
  category?: string;
}

const pressItems: PressItem[] = [
  {
    id: '1',
    publication: 'Forbes',
    publicationLogo: forbesLogo,
    quote: 'zero-to-coin-hub is revolutionizing the way institutional investors approach digital assets with their cutting-edge security protocols.',
    author: 'Sarah Johnson',
    date: '2024-09-15',
    articleUrl: '#',
    category: 'Technology'
  },
  {
    id: '2',
    publication: 'TechCrunch',
    publicationLogo: techcrunchLogo,
    quote: 'The platform\'s innovative approach to cryptocurrency trading sets a new standard for security and user experience in the fintech industry.',
    author: 'Michael Chen',
    date: '2024-08-22',
    articleUrl: '#',
    category: 'Fintech'
  },
  {
    id: '3',
    publication: 'Bloomberg',
    publicationLogo: bloombergLogo,
    quote: 'With institutional-grade infrastructure and a focus on regulatory compliance, zero-to-coin-hub is attracting major players in the financial sector.',
    author: 'David Martinez',
    date: '2024-07-10',
    articleUrl: '#',
    category: 'Finance'
  }
];

const PressMediaSection = ({ limit }: { limit?: number }) => {
  const displayItems = limit ? pressItems.slice(0, limit) : pressItems;

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": displayItems.map((item, index) => ({
      "@type": "Review",
      "position": index + 1,
      "author": {
        "@type": "Person",
        "name": item.author || "Staff Writer"
      },
      "datePublished": item.date,
      "reviewBody": item.quote,
      "publisher": {
        "@type": "Organization",
        "name": item.publication
      },
      "itemReviewed": {
        "@type": "WebApplication",
        "name": "zero-to-coin-hub"
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Press & Media Coverage
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what industry leaders are saying about zero-to-coin-hub
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 group">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <img
                        src={item.publicationLogo}
                        alt={`${item.publication} logo`}
                        className="h-8 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                        loading="lazy"
                      />
                      {item.category && (
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div className="flex-grow mb-4">
                      <Quote className="h-8 w-8 text-primary/20 mb-3" />
                      <p className="text-muted-foreground italic leading-relaxed">
                        "{item.quote}"
                      </p>
                    </div>

                    <div className="space-y-3">
                      {item.author && (
                        <p className="text-sm font-medium">
                          — {item.author}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                        asChild
                      >
                        <a
                          href={item.articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Read Full Article
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {limit && pressItems.length > limit && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-12"
            >
              <Button
                size="lg"
                variant="outline"
                asChild
              >
                <a href="/press">
                  View All Press Coverage
                  <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default PressMediaSection;
