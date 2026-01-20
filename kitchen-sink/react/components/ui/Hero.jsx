import React from 'react';
import { Button } from 'konsta/react';
import { Link } from 'react-router-dom';

export default function Hero({ isAuthenticated = false }) {
  return (
    <div className="min-h-[90vh] bg-black text-white flex flex-col justify-between p-6 md:p-12">
      {/* Brand Header */}
      <div className="flex justify-between items-start text-xs md:text-sm tracking-wider">
        <span>Est. 2026 — Globetrotter's Edition</span>
        <span>N° 001</span>
      </div>

      {/* Main Title */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[14vw] md:text-[12vw] font-black leading-none tracking-tighter">
            CITY
          </h1>
          <h1 className="text-[14vw] md:text-[12vw] font-black leading-none tracking-tighter">
            CREW
          </h1>
        </div>
      </div>

      {/* Bottom Info Grid & CTA */}
      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-4 text-xs md:text-sm tracking-wider">
          <div>
            <div className="text-gray-400 mb-1">LOCATION</div>
            <div>BASED IN SF</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">ACTION</div>
            <div>SCROLL TO DISCOVER</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">ACCESS</div>
            <div>GLOBAL</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link to={isAuthenticated ? '/activity-map' : '/sign-in'}>
            <Button
              rounded
              large
              className="bg-white text-black hover:bg-primary active:bg-primary transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                {isAuthenticated ? 'ENTER THE MAP' : 'JOIN THE LIST'}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
