import React from 'react';
import { motion } from 'framer-motion';

interface Publication {
  name: string;
  logo: string;
  url?: string;
}

const publications: Publication[] = [
  {
    name: 'Forbes',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Forbes_logo.svg/320px-Forbes_logo.svg.png',
    url: '#'
  },
  {
    name: 'TechCrunch',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TechCrunch_logo.svg/320px-TechCrunch_logo.svg.png',
    url: '#'
  },
  {
    name: 'Bloomberg',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Bloomberg_logo.svg/320px-Bloomberg_logo.svg.png',
    url: '#'
  },
  {
    name: 'The Wall Street Journal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/The_Wall_Street_Journal_logo.svg/320px-The_Wall_Street_Journal_logo.svg.png',
    url: '#'
  },
  {
    name: 'CoinDesk',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/CoinDesk_logo.svg/320px-CoinDesk_logo.svg.png',
    url: '#'
  },
  {
    name: 'Reuters',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Reuters_logo.svg/320px-Reuters_logo.svg.png',
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
