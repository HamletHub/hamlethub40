declare module 'react-image-crop' {
  import { ReactElement, RefObject } from 'react';
  
  export interface Crop {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    unit?: 'px' | '%';
    aspect?: number;
  }

  export interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface ReactCropProps {
    crop?: Crop;
    component?: any;
    crossorigin?: string;
    disabled?: boolean;
    locked?: boolean;
    imageAlt?: string;
    imageStyle?: React.CSSProperties;
    keepSelection?: boolean;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    onChange: (crop: Crop) => void;
    onComplete?: (crop: PixelCrop) => void;
    onImageError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    onImageLoaded?: (image: HTMLImageElement) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    renderComponent?: ReactElement;
    renderSelectionAddon?: (state: any) => ReactElement;
    ruleOfThirds?: boolean;
    circularCrop?: boolean;
    aspect?: number;
    children?: React.ReactNode;
  }

  export function makeAspectCrop(
    crop: Crop,
    aspect: number,
    width: number,
    height: number
  ): Crop;

  export function centerCrop(
    crop: Crop,
    width: number,
    height: number
  ): Crop;

  const ReactCrop: React.FC<ReactCropProps>;
  
  export default ReactCrop;
} 