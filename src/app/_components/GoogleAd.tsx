'use client';

import { useEffect, useRef } from 'react';

// Counter to create unique ad IDs
let adCounter = 0;
// Use a fixed timestamp to avoid hydration mismatches
const FIXED_TIMESTAMP = 1746391652922;

interface GoogleAdProps {
  alias: string;
  size?: '300x250' | '970x90';
  className?: string;
}

export default function GoogleAd({ alias, size = '970x90', className = '' }: GoogleAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  
  // Create the ad unit ID with account number
  const adUnitPath = `/15251363/${alias}`;
  
  // Create a unique container ID by incrementing a counter
  // This ensures each instance has a unique DOM ID
  const containerId = useRef(`div-gpt-ad-${FIXED_TIMESTAMP}-${adCounter++}`);
  
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
          // Define the slot using the proper ad unit path and the unique DOM ID
          const slot = googletag.defineSlot(adUnitPath, [dimensions.width, dimensions.height], containerId.current);
          
          if (!slot) return;
          
          slot.addService(googletag.pubads());
          
          // Enable services
          googletag.pubads().enableSingleRequest();
          googletag.pubads().collapseEmptyDivs();
          googletag.enableServices();
          
          // Display the ad
          googletag.display(containerId.current);
          
          // Refresh just this slot
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
            // Only destroy this specific slot if possible
            const slots = googletag.pubads().getSlots();
            const slotToDestroy = slots.find(
              (s: any) => s.getSlotElementId() === containerId.current
            );
            
            if (slotToDestroy) {
              googletag.destroySlots([slotToDestroy]);
            }
          } catch (e) {
            console.error('Error cleaning up ads:', e);
          }
        });
      }
    };
  }, [adUnitPath, dimensions.width, dimensions.height]);

  // Use combined styles from props and base styles
  const combinedClassName = `${className} relative`.trim();

  return (
    <div className={combinedClassName}>
      <div 
        id={containerId.current} 
        ref={adRef}
        style={{ 
          width: dimensions.width,
          height: dimensions.height,
          background: '#f0f0f0'
        }}
        data-adunit={alias}
        data-size={size}
      />
    </div>
  );
} 