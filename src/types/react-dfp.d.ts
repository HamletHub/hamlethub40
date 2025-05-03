// Type definitions for react-dfp
declare module 'react-dfp' {
  import { ComponentType, ReactNode } from 'react';

  export interface DFPSlotsProviderProps {
    dfpNetworkId: string;
    personalizedAds?: boolean;
    cookieOption?: boolean;
    singleRequest?: boolean;
    children?: ReactNode;
  }

  export interface AdSlotProps {
    dfpNetworkId?: string;
    adUnit: string;
    sizes: number[][];
    slotId: string;
    onSlotRender?: () => void;
    onSlotImpression?: () => void;
    onSlotIsViewable?: () => void;
    onSlotVisibilityChanged?: () => void;
    refreshable?: boolean;
    shouldRefresh?: () => boolean;
    targetingArguments?: Record<string, string | string[]>;
    collapseEmptyDiv?: boolean | [boolean, boolean];
    adSenseAttributes?: Record<string, string>;
    slotShouldRefresh?: () => boolean;
    priority?: number;
    children?: ReactNode;
    customEventHandlers?: Record<string, () => void>;
  }

  export const DFPSlotsProvider: ComponentType<DFPSlotsProviderProps>;
  export const AdSlot: ComponentType<AdSlotProps>;
  
  export const DFPManager: {
    init: (config?: Record<string, any>) => void;
    load: () => void;
    refresh: () => void;
    setCollapseEmptyDivs: (collapse: boolean) => void;
    registerSlot: (adSlot: any) => void;
    unregisterSlot: (adSlot: any) => void;
    getRegisteredSlots: () => Record<string, any>[];
    getRefreshableSlots: () => Record<string, any>[];
    getTargetingArguments: () => Record<string, string | string[]>;
    setTargetingArguments: (args: Record<string, string | string[]>) => void;
    getGoogleTag: () => any;
  };
} 