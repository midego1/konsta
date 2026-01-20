import React from 'react';
import { Card } from 'konsta/react';

const features = [
  {
    id: 1,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Nearby Discovery',
    description: 'Scan your surroundings. Real-time.',
  },
  {
    id: 2,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Instant Chat',
    description: 'Connect safely. Encrypted.',
  },
  {
    id: 3,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Trip Planning',
    description: 'Coordinate future moves.',
  },
  {
    id: 4,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    title: 'Travel Buddies',
    description: 'Smart matching algorithms.',
  },
  {
    id: 5,
    icon: '🚀',
    title: 'Beta Access',
    description: 'Early access to premium features.',
  },
];

export default function FeaturesGrid() {
  return (
    <div className="bg-gray-50 py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-12 text-center">
          Why CityCrew?
        </h2>

        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className="min-w-[85vw] snap-center min-h-[300px] flex flex-col justify-between transition-all duration-300 active:scale-95"
            >
              <div className="p-6">
                <div className="text-primary mb-4">
                  {typeof feature.icon === 'string' ? (
                    <span className="text-4xl">{feature.icon}</span>
                  ) : (
                    feature.icon
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card
              key={feature.id}
              className={`min-h-[400px] flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                idx === 0 ? 'md:col-span-2' : ''
              } ${idx === 3 ? 'md:col-span-2' : ''}`}
            >
              <div className="p-8">
                <div className="text-primary mb-4">
                  {typeof feature.icon === 'string' ? (
                    <span className="text-5xl">{feature.icon}</span>
                  ) : (
                    <div className="w-12 h-12">{feature.icon}</div>
                  )}
                </div>
                <h3 className="text-3xl font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-xl">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
