import React, { useState } from 'react';
import { Card, Searchbar, BlockTitle, List, ListItem, Block } from 'konsta/react';
import { Link as RouterLink } from 'react-router-dom';

const mockLocations = [
  {
    id: 1,
    title: 'Lisbon',
    country: 'Portugal',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
  },
  {
    id: 2,
    title: 'Chiang Mai',
    country: 'Thailand',
    imageUrl: 'https://images.unsplash.com/photo-1598965675045-684b9728a3af?w=800',
  },
  {
    id: 3,
    title: 'Canggu',
    country: 'Bali',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  },
  {
    id: 4,
    title: 'Mexico City',
    country: 'Mexico',
    imageUrl: 'https://images.unsplash.com/photo-1518659159510-643f3ad8e843?w=800',
  },
  {
    id: 5,
    title: 'Barcelona',
    country: 'Spain',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
  },
  {
    id: 6,
    title: 'Tokyo',
    country: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  },
];

export default function ExploreDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = mockLocations.filter(
    (location) =>
      location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Block className="space-y-4">
        <Searchbar
          placeholder="Search destinations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Block>

      <BlockTitle>Popular Destinations</BlockTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        {filteredLocations.map((location) => (
          <RouterLink key={location.id} to="/activities">
            <Card
              className="cursor-pointer active:scale-95 transition-transform"
            >
              <div
                className="h-48 -mx-4 -mt-4 mb-4 flex items-end p-4 text-white font-bold bg-cover bg-center ios:rounded-lg material:rounded-xl"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 100%), url(${location.imageUrl})`,
                }}
              >
                <div>
                  <div className="text-2xl">{location.title}</div>
                  <div className="text-sm font-normal opacity-90">{location.country}</div>
                </div>
              </div>
              <div className="text-gray-500">
                Explore travelers and activities in {location.title}
              </div>
            </Card>
          </RouterLink>
        ))}
      </div>

      {searchQuery && filteredLocations.length === 0 && (
        <Block>
          <p className="text-center text-gray-500">No destinations found</p>
        </Block>
      )}
    </>
  );
}
