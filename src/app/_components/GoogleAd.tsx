'use client';

import { useEffect, useRef } from 'react';

interface GoogleAdProps {
  alias: string;
  size?: '300x250' | '970x90';
  className?: string;
}

export default function GoogleAd({ alias, size = '970x90', className = '' }: GoogleAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  
  // Create the ad unit ID with account number
  const adId = `/15251363/${alias}`;
  
  // Get dimensions
  const dimensions = size === '300x250' 
    ? { width: 300, height: 250 } 
    : { width: 970, height: 90 };

  useEffect(() => {
    // Skip in SSR
    if (typeof window === 'undefined' || !adRef.current) return;
    
    try {
      // Add GPT script if not already present
      if (!document.getElementById('google-ads-script')) {
        const script = document.createElement('script');
        script.id = 'google-ads-script';
        script.async = true;
        script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
        document.head.appendChild(script);
      }

      // Initialize Google Ads
      const googletag = (window as any).googletag = (window as any).googletag || { cmd: [] };
      
      googletag.cmd.push(() => {
        try {
          // Clear existing slots first
          if (googletag.pubads && googletag.pubads().clear) {
            googletag.pubads().clear();
          }
          
          // Define the slot
          const slot = googletag.defineSlot(adId, [dimensions.width, dimensions.height], adId);
          
          if (!slot) return;
          
          slot.addService(googletag.pubads());
          
          // Enable services
          googletag.pubads().enableSingleRequest();
          googletag.pubads().collapseEmptyDivs();
          googletag.enableServices();
          
          // Display the ad
          googletag.display(adId);
          
          // Force refresh to ensure the ad loads
          googletag.pubads().refresh([slot]);
        } catch (err) {
          console.error('Error setting up ad:', err);
        }
      });
    } catch (err) {
      console.error('Error initializing ad:', err);
    }

    // Cleanup
    return () => {
      const googletag = (window as any).googletag;
      if (googletag && googletag.cmd) {
        googletag.cmd.push(() => {
          try {
            googletag.destroySlots();
          } catch (e) {
            console.error('Error cleaning up ads:', e);
          }
        });
      }
    };
  }, [adId, dimensions.width, dimensions.height]);

  // Use combined styles from props and base styles
  const combinedClassName = `${className} relative`.trim();

  return (
    <div className={combinedClassName}>
      <div 
        id={adId} 
        ref={adRef}
        style={{ 
          width: dimensions.width,
          height: dimensions.height,
          background: '#f0f0f0'
        }}
        data-adunit={alias}
      />
    </div>
  );
} 