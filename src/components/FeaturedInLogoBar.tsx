import React from 'react';
import { motion } from 'framer-motion';
import forbesLogo from '@/assets/forbes-logo.png';
import techcrunchLogo from '@/assets/techcrunch-logo.png';
import bloombergLogo from '@/assets/bloomberg-logo.png';
import wsjLogo from '@/assets/wsj-logo.png';
import coindeskLogo from '@/assets/coindesk-logo.png';
import reutersLogo from '@/assets/reuters-logo.png';

interface Publication {
  name: string;
  logo: string;
  url?: string;
}

const publications: Publication[] = [
  {
    name: 'Forbes',
    logo: forbesLogo,
    url: '#'
  },
  {
    name: 'TechCrunch',
    logo: techcrunchLogo,
    url: '#'
  },
  {
    name: 'Bloomberg',
    logo: bloombergLogo,
    url: '#'
  },
  {
    name: 'The Wall Street Journal',
    logo: wsjLogo,
    url: '#'
  },
  {
    name: 'CoinDesk',
    logo: coindeskLogo,
    url: '#'
  },
  {
    name: 'Reuters',
    logo: reutersLogo,
    url: '#'
  }
];

const FeaturedInLogoBar = () => {
  return (
    <section className="py-12 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            As Featured In
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <div className="flex items-center justify-center gap-12 flex-wrap md:flex-nowrap">
            {publications.map((publication, index) => (
              <motion.a
                key={publication.name}
                href={publication.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex items-center justify-center min-w-[120px] h-12 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
              >
                <img
                  src={publication.logo}
                  alt={`${publication.name} logo`}
                  className="max-h-full w-auto object-contain"
                  loading="lazy"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInLogoBar;
