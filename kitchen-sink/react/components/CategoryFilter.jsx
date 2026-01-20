import React from 'react';
import { Chip } from 'konsta/react';

const CATEGORIES = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'dinner', label: 'Dinner', icon: '🍽️' },
  { value: 'drinks', label: 'Drinks', icon: '🍹' },
  { value: 'explore', label: 'Explore', icon: '🏃' },
  { value: 'cowork', label: 'Cowork', icon: '💻' },
];

export function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="absolute top-safe-16 left-0 right-0 z-10 px-4 py-3 overflow-x-auto">
      <div className="flex gap-2 min-w-max mx-auto md:justify-center">
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            outline={selected !== cat.value}
            className={`shadow-md transition-all ${
              selected === cat.value
                ? 'scale-105'
                : ''
            }`}
          >
            <span className="mr-1.5 text-base">{cat.icon}</span>
            <span className="font-medium">{cat.label}</span>
          </Chip>
        ))}
      </div>
    </div>
  );
}
