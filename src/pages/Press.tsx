import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PressMediaSection from '@/components/PressMediaSection';
import FeaturedInLogoBar from '@/components/FeaturedInLogoBar';

const Press = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = 'Press & Media Coverage | zero-to-coin-hub';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Discover what leading publications are saying about zero-to-coin-hub. Read press coverage from Forbes, TechCrunch, Bloomberg, and more.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Press & Media
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Leading publications recognize zero-to-coin-hub as a trusted platform for 
            professional cryptocurrency investment and trading.
          </p>
        </div>
      </div>

      {/* Featured In Logo Bar */}
      <FeaturedInLogoBar />

      {/* Press Coverage Section */}
      <PressMediaSection />

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Media Inquiries</h2>
            <p className="text-lg text-muted-foreground mb-8">
              For press inquiries, interviews, or additional information, please contact our media relations team.
            </p>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                <strong>Email:</strong> press@cryptoinvestpro.com
              </p>
              <p className="text-muted-foreground">
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Press;
