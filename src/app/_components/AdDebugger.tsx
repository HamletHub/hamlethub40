'use client';

import { useEffect, useState, useRef } from 'react';

interface AdDebuggerProps {
  alias: string;
  size?: '300x250' | '970x90';
}

export default function AdDebugger({ alias, size = '970x90' }: AdDebuggerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [adDetails, setAdDetails] = useState<any>(null);
  const adRef = useRef<HTMLDivElement>(null);
  
  // Important: Make sure the ID format exactly matches the old implementation
  const adId = `/15251363/${alias}`;
  
  // Get dimensions
  const dimensions = size === '300x250' 
    ? { width: 300, height: 250 } 
    : { width: 970, height: 90 };

  // Helper function to check for empty src attributes
  const checkForEmptySrc = () => {
    if (typeof document === 'undefined' || !adRef.current) return;
    
    const iframes = adRef.current.querySelectorAll('iframe');
    const images = adRef.current.querySelectorAll('img');
    
    iframes.forEach((iframe, index) => {
      console.log(`Iframe #${index} src:`, iframe.src || 'EMPTY');
      if (iframe.src === '') {
        console.warn('Found iframe with empty src attribute');
        // Don't modify it directly as it might be needed by Google's ad scripts
      }
    });
    
    images.forEach((img, index) => {
      console.log(`Image #${index} src:`, img.src || 'EMPTY');
      if (img.src === '') {
        console.warn('Found image with empty src attribute');
      }
    });
  };

  useEffect(() => {
    // Skip in SSR
    if (typeof window === 'undefined') return;
    
    setIsLoaded(false);
    setError(null);
    setAdDetails(null);
    
    // Debugging only
    console.log(`Initializing ad: ${adId} with size ${dimensions.width}x${dimensions.height}`);

    try {
      // Add GPT script if not already present
      if (!document.getElementById('google-ads-script')) {
        console.log('Adding GPT script to head');
        const script = document.createElement('script');
        script.id = 'google-ads-script';
        script.async = true;
        script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
        script.onload = () => console.log('GPT script loaded successfully');
        script.onerror = (e) => {
          console.error('Error loading GPT script:', e);
          setError('Failed to load ad script');
        };
        document.head.appendChild(script);
      }

      // Initialize Google Ads - Use a slight delay to ensure script is loaded
      setTimeout(() => {
        try {
          const googletag = (window as any).googletag = (window as any).googletag || { cmd: [] };
          
          // Make sure googletag is available
          if (!googletag) {
            throw new Error('googletag not available');
          }

          googletag.cmd.push(() => {
            try {
              // Log exact parameters being passed to defineSlot
              console.log(`==================== DEFINE SLOT PARAMETERS ====================`);
              console.log(`adId: "${adId}"`);
              console.log(`dimensions: [${dimensions.width}, ${dimensions.height}]`);
              console.log(`slotElementId: "${adId}"`);
              console.log(`==============================================================`);
              
              // Clear existing slots first
              if (googletag.pubads && googletag.pubads().clear) {
                googletag.pubads().clear();
              }
              
              // Define the slot
              const slot = googletag.defineSlot(adId, [dimensions.width, dimensions.height], adId);
              
              if (!slot) {
                console.error('Failed to define slot');
                setError('Failed to define ad slot');
                return;
              }
              
              console.log('Slot defined successfully:', slot);
              
              slot.addService(googletag.pubads());
              
              // Enable services
              googletag.pubads().enableSingleRequest();
              googletag.pubads().collapseEmptyDivs();
              googletag.enableServices();
              
              // Add event listeners for debugging
              googletag.pubads().addEventListener('slotRenderEnded', (event: any) => {
                if (event.slot.getSlotElementId() === adId) {
                  console.log('Ad render completed for', adId, event.isEmpty ? '(empty)' : '(filled)');
                  console.log('Full slot render event:', event);
                  
                  // Check for empty src attributes
                  setTimeout(checkForEmptySrc, 100);
                  
                  // Log all attributes of the ad div for debugging
                  if (adRef.current) {
                    console.log('Ad container attributes:', {
                      id: adRef.current.id,
                      queryId: adRef.current.getAttribute('data-google-query-id'),
                      style: adRef.current.getAttribute('style'),
                      innerHTML: adRef.current.innerHTML.length,
                      allAttributes: Array.from(adRef.current.attributes).map(attr => 
                        `${attr.name}="${attr.value}"`
                      ).join(', ')
                    });
                    
                    // Count iframes and check their src attributes
                    const iframes = adRef.current.querySelectorAll('iframe');
                    console.log(`Found ${iframes.length} iframes in ad container`);
                    
                    setAdDetails({
                      queryId: adRef.current.getAttribute('data-google-query-id'),
                      isEmpty: event.isEmpty,
                      iframeCount: iframes.length
                    });
                  }
                  
                  setIsLoaded(true);
                  if (event.isEmpty) {
                    setError('No ad available for this slot');
                  }
                }
              });
              
              // Display the ad
              console.log(`Displaying ad: ${adId}`);
              googletag.display(adId);
              
              // Force refresh to ensure the ad loads
              googletag.pubads().refresh([slot]);
            } catch (err) {
              console.error('Error in googletag.cmd:', err);
              setError(`Ad initialization error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
          });
        } catch (err) {
          console.error('Error setting up googletag:', err);
          setError(`Ad setup error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }, 100);
    } catch (err) {
      console.error('Error in ad initialization:', err);
      setError(`Ad error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Cleanup
    return () => {
      try {
        const googletag = (window as any).googletag;
        if (googletag && googletag.cmd) {
          googletag.cmd.push(() => {
            try {
              console.log(`Destroying ad slot: ${adId}`);
              googletag.destroySlots();
            } catch (e) {
              console.error('Error cleaning up ads:', e);
            }
          });
        }
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    };
  }, [adId, dimensions.width, dimensions.height]);

  return (
    <div className="relative">
      {/* The actual ad container - match the style from the old app exactly */}
      <div 
        id={adId} 
        ref={adRef}
        style={{ 
          width: dimensions.width,
          height: dimensions.height,
          background: error ? '#ffecec' : '#f0f0f0'
        }}
        data-adunit={alias}
      />
      
      {/* Error message if ad fails to load */}
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: '#666',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      {/* Debug info */}
      {isLoaded && adDetails && (
        <div className="mt-2 text-xs text-gray-500">
          {adDetails.queryId ? (
            <div className="bg-green-50 p-2 border border-green-200 rounded">
              ✅ Ad loaded - Query ID: {adDetails.queryId.substring(0, 15)}...
              {adDetails.iframeCount > 0 && ` (${adDetails.iframeCount} iframes)`}
            </div>
          ) : (
            <div className="bg-yellow-50 p-2 border border-yellow-200 rounded">
              ⚠️ Ad container rendered but no query ID found.
              {adDetails.iframeCount > 0 && ` (${adDetails.iframeCount} iframes)`}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 