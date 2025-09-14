import React from 'react';

const TraditionalBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main background with traditional painting style */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 opacity-90"></div>
      
      {/* Traditional Chinese cloud patterns */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Large decorative cloud pattern in center */}
        <path
          d="M960 300c-100-50-200-25-250 50c-75-100-225-75-250 25c-50-75-175-50-175 50c0 75 75 125 150 100c50 75 175 50 200-25c75 100 225 75 250-25c50 50 125 25 125-50c0-75-50-125-50-100z"
          fill="#f8f1e4"
          className="opacity-90"
        />
        
        {/* Smaller cloud patterns */}
        <path
          d="M400 200c-40-20-80-10-100 20c-30-40-90-30-100 10c-20-30-70-20-70 20c0 30 30 50 60 40c20 30 70 20 80-10c30 40 90 30 100-10c20 20 50 10 50-20c0-30-20-50-20-40z"
          fill="#f8f1e4"
          className="opacity-80"
        />
        <path
          d="M1520 180c-40-20-80-10-100 20c-30-40-90-30-100 10c-20-30-70-20-70 20c0 30 30 50 60 40c20 30 70 20 80-10c30 40 90 30 100-10c20 20 50 10 50-20c0-30-20-50-20-40z"
          fill="#f8f1e4"
          className="opacity-80"
        />
        
        {/* Traditional decorative elements */}
        <circle cx="300" cy="400" r="8" fill="#4ade80" className="opacity-60" />
        <circle cx="1620" cy="450" r="6" fill="#60a5fa" className="opacity-60" />
        <circle cx="200" cy="600" r="5" fill="#f87171" className="opacity-60" />
        <circle cx="1720" cy="350" r="7" fill="#fbbf24" className="opacity-60" />
        
        {/* Star decorations */}
        <g transform="translate(500, 250)">
          <path d="M0,-10 L3,-3 L10,-3 L5,2 L7,9 L0,5 L-7,9 L-5,2 L-10,-3 L-3,-3 Z" fill="#fbbf24" className="opacity-70" />
        </g>
        <g transform="translate(1400, 280)">
          <path d="M0,-8 L2.4,-2.4 L8,-2.4 L4,1.6 L5.6,7.2 L0,4 L-5.6,7.2 L-4,1.6 L-8,-2.4 L-2.4,-2.4 Z" fill="#fbbf24" className="opacity-70" />
        </g>
      </svg>
      
      {/* Character illustrations positioned around the edges */}
      <div className="absolute inset-0">
        {/* Left side characters */}
        <div className="absolute left-4 top-1/4 w-24 h-24 bg-emerald-200 rounded-full opacity-80 shadow-lg flex items-center justify-center">
          <div className="w-16 h-16 bg-emerald-300 rounded-full flex items-center justify-center">
            <span className="text-2xl">👦</span>
          </div>
        </div>
        
        <div className="absolute left-8 bottom-1/3 w-20 h-20 bg-purple-200 rounded-full opacity-80 shadow-lg flex items-center justify-center">
          <div className="w-14 h-14 bg-purple-300 rounded-full flex items-center justify-center">
            <span className="text-xl">👧</span>
          </div>
        </div>
        
        {/* Right side characters */}
        <div className="absolute right-4 top-1/3 w-22 h-22 bg-blue-200 rounded-full opacity-80 shadow-lg flex items-center justify-center">
          <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center">
            <span className="text-2xl">🧒</span>
          </div>
        </div>
        
        <div className="absolute right-8 bottom-1/4 w-20 h-20 bg-yellow-200 rounded-full opacity-80 shadow-lg flex items-center justify-center">
          <div className="w-14 h-14 bg-yellow-300 rounded-full flex items-center justify-center">
            <span className="text-xl">👶</span>
          </div>
        </div>
        
        {/* Bottom characters */}
        <div className="absolute bottom-4 left-1/4 w-18 h-18 bg-pink-200 rounded-full opacity-80 shadow-lg flex items-center justify-center">
          <div className="w-12 h-12 bg-pink-300 rounded-full flex items-center justify-center">
            <span className="text-lg">👧</span>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-1/4 w-18 h-18 bg-indigo-200 rounded-full opacity-80 shadow-lg flex items-center justify-center">
          <div className="w-12 h-12 bg-indigo-300 rounded-full flex items-center justify-center">
            <span className="text-lg">👦</span>
          </div>
        </div>
      </div>
      
      {/* Traditional building silhouettes */}
      <div className="absolute left-0 top-0 w-32 h-48 opacity-40">
        <svg viewBox="0 0 128 192" fill="none" className="w-full h-full">
          <rect x="20" y="120" width="88" height="72" fill="#8b4513" />
          <polygon points="10,120 64,80 118,120" fill="#dc2626" />
          <rect x="40" y="140" width="12" height="20" fill="#654321" />
          <rect x="76" y="140" width="12" height="20" fill="#654321" />
        </svg>
      </div>
      
      <div className="absolute right-0 top-0 w-32 h-48 opacity-40">
        <svg viewBox="0 0 128 192" fill="none" className="w-full h-full">
          <rect x="20" y="120" width="88" height="72" fill="#8b4513" />
          <polygon points="10,120 64,80 118,120" fill="#dc2626" />
          <rect x="40" y="140" width="12" height="20" fill="#654321" />
          <rect x="76" y="140" width="12" height="20" fill="#654321" />
        </svg>
      </div>
    </div>
  );
};

export default TraditionalBackground;