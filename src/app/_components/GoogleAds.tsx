'use client';

import { useEffect, useState } from 'react';
import { AdSlot } from 'react-dfp';

type AdSize = '300x250' | '970x90';

interface GoogleAdsProps {
  alias: string; // Alias from the hub collection
  size?: AdSize; // Optional size parameter with default
  className?: string;
}

export default function GoogleAds({ 
  alias, 
  size = '300x250', 
  className = '',
}: GoogleAdsProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Handle client-side only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Create ad unit path with account number and alias in format: /15251363/town_ad-type
  const adUnitPath = `/15251363/${alias}`;
  
  // Create unique ID in the same format as the old implementation
  const id = `/15251363/${alias}`;
  
  // Convert size string to dimensions array
  const dimensions = size === '300x250' 
    ? [300, 250] 
    : [970, 90];
  
  // Only render on client side to avoid hydration issues
  if (!isClient) {
    return (
      <div 
        className={className} 
        style={{ 
          width: dimensions[0], 
          height: dimensions[1], 
          background: '#f0f0f0'
        }} 
      />
    );
  }
  
  return (
    <div className={className}>
      <AdSlot
        adUnit={alias}
        sizes={[dimensions]}
        slotId={id}
      />
    </div>
  );
} 