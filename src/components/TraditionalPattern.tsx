import React from 'react';

const TraditionalPattern: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Traditional Chinese cloud patterns */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-20"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cloud pattern 1 */}
        <path
          d="M100 150c-20-10-40-5-50 10-15-20-45-15-50 5-10-15-35-10-35 10 0 15 15 25 30 20 10 15 35 10 40-5 15 20 45 15 50-5 10 10 25 5 25-10 0-15-10-25-10-20z"
          fill="currentColor"
          className="text-primary/30"
        />
        
        {/* Cloud pattern 2 */}
        <path
          d="M800 100c-25-12-50-6-62 12-18-25-56-18-62 6-12-18-43-12-43 12 0 18 18 30 37 25 12 18 43 12 50-6 18 25 56 18 62-6 12 12 31 6 31-12 0-18-13-31-13-25z"
          fill="currentColor"
          className="text-primary/25"
        />
        
        {/* Decorative stars */}
        <circle cx="200" cy="300" r="3" fill="currentColor" className="text-accent/60" />
        <circle cx="900" cy="250" r="2" fill="currentColor" className="text-accent/60" />
        <circle cx="150" cy="500" r="2.5" fill="currentColor" className="text-accent/60" />
        <circle cx="1000" cy="400" r="3" fill="currentColor" className="text-accent/60" />
        
        {/* Traditional wave patterns */}
        <path
          d="M0 600c100-20 200 20 300 0s200-20 300 0 200 20 300 0 200-20 300 0v200H0v-200z"
          fill="currentColor"
          className="text-secondary/40"
        />
      </svg>
    </div>
  );
};

export default TraditionalPattern;