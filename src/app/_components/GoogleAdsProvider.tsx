'use client';

import { useEffect } from 'react';
import { DFPSlotsProvider, DFPManager } from 'react-dfp';

interface GoogleAdsProviderProps {
  children: React.ReactNode;
  networkId?: string;
}

export default function GoogleAdsProvider({ 
  children, 
  networkId = '15251363' 
}: GoogleAdsProviderProps) {
  useEffect(() => {
    // Initialize DFP once
    DFPManager.setCollapseEmptyDivs(true);
    
    // Load ads initially
    DFPManager.load();
    
    return () => {
      // No cleanup needed as react-dfp handles this
    };
  }, []);
  
  return (
    <DFPSlotsProvider dfpNetworkId={networkId}>
      {children}
    </DFPSlotsProvider>
  );
} 