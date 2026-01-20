import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Create your profile',
    description:
      "Share your travel style, interests, and where you're heading or where you are now.",
  },
  {
    number: '02',
    title: 'Discover Travelers',
    description:
      "See who's nearby or heading to your destination. Filter by interests and vibe.",
  },
  {
    number: '03',
    title: 'Connect & Go',
    description:
      'Chat securely, meet up for coffee, or plan a full excursion together.',
  },
];

export default function HowItWorks() {
  return (
    <div className="py-16 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-4 text-center">
          How It Works
        </h2>
        <p className="text-gray-600 text-lg md:text-xl text-center mb-16 max-w-2xl mx-auto">
          Three simple steps to connect with fellow travelers around the world
        </p>

        {/* Desktop: Grid with connector line */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary to-primary opacity-20" />

          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="relative text-center"
            >
              {/* Number circle */}
              <div className="w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold mx-auto mb-6 relative z-10">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-600 text-lg">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Mobile: Stack */}
        <div className="md:hidden space-y-12">
          {steps.map((step, idx) => (
            <div key={step.number} className="text-center">
              {/* Number circle */}
              <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
