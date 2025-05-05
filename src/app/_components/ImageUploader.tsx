'use client';

import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import styles from './ImageUploader.module.css';

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

interface ImageUploaderProps {
  onImageUploaded?: (imageUrls: { original: string; square: string; wide: string }) => void;
}

export default function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cropSquare, setCropSquare] = useState<Crop>();
  const [cropWide, setCropWide] = useState<Crop>();
  const [completedCropSquare, setCompletedCropSquare] = useState<PixelCrop>();
  const [completedCropWide, setCompletedCropWide] = useState<PixelCrop>();
  
  const squareImgRef = useRef<HTMLImageElement>(null);
  const wideImgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setUploadError(null);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, isSquare: boolean) => {
    const { width, height } = e.currentTarget;
    const aspect = isSquare ? 1 : 1.9;
    
    const crop = centerAspectCrop(width, height, aspect);
    
    if (isSquare) {
      setCropSquare(crop);
      if (crop.width && crop.height && crop.x !== undefined && crop.y !== undefined) {
        setCompletedCropSquare({
          x: Math.round(crop.x),
          y: Math.round(crop.y),
          width: Math.round(crop.width),
          height: Math.round(crop.height)
        });
      }
    } else {
      setCropWide(crop);
      if (crop.width && crop.height && crop.x !== undefined && crop.y !== undefined) {
        setCompletedCropWide({
          x: Math.round(crop.x),
          y: Math.round(crop.y),
          width: Math.round(crop.width),
          height: Math.round(crop.height)
        });
      }
    }
  };

  // Canvas utility to get the cropped image
  const getCroppedImg = (
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName: string
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        // Create a new Blob with a name property
        const namedBlob = new Blob([blob], { type: blob.type });
        // We'll need to handle the filename separately since Blob doesn't have a name property
        resolve(namedBlob);
      }, 'image/jpeg');
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !squareImgRef.current || !wideImgRef.current || !completedCropSquare || !completedCropWide) {
      setUploadError('Please select an image and adjust both crops');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Get cropped image blobs
      const squareCropBlob = await getCroppedImg(
        squareImgRef.current,
        completedCropSquare,
        selectedFile.name
      );
      
      const wideCropBlob = await getCroppedImg(
        wideImgRef.current,
        completedCropWide,
        selectedFile.name
      );

      // Upload original image first
      const originalFormData = new FormData();
      originalFormData.append('file', selectedFile);
      originalFormData.append('subfolder', 'original');
      const originalResponse = await fetch('/api/upload', {
        method: 'POST',
        body: originalFormData,
      });
      
      if (!originalResponse.ok) throw new Error('Failed to upload original image');
      const originalData = await originalResponse.json();
      
      // Get the generated filename to use for all uploads
      const sharedFilename = originalData.filename;
      
      // Upload square crop - use the same filename as original
      const squareFormData = new FormData();
      squareFormData.append('file', squareCropBlob);
      squareFormData.append('subfolder', '1_1');
      squareFormData.append('filename', sharedFilename);  // Using the same filename
      const squareResponse = await fetch('/api/upload', {
        method: 'POST',
        body: squareFormData,
      });
      
      if (!squareResponse.ok) throw new Error('Failed to upload square crop');
      const squareData = await squareResponse.json();
      
      // Upload wide crop - use the same filename as original
      const wideFormData = new FormData();
      wideFormData.append('file', wideCropBlob);
      wideFormData.append('subfolder', '1.91_1');
      wideFormData.append('filename', sharedFilename);  // Using the same filename
      const wideResponse = await fetch('/api/upload', {
        method: 'POST',
        body: wideFormData,
      });
      
      if (!wideResponse.ok) throw new Error('Failed to upload wide crop');
      const wideData = await wideResponse.json();
      
      // Call the callback with all image URLs
      if (onImageUploaded) {
        onImageUploaded({
          original: originalData.url,
          square: squareData.url,
          wide: wideData.url,
        });
      }
      
      // Reset the form
      setSelectedFile(null);
      setImgSrc('');
      setCropSquare(undefined);
      setCropWide(undefined);
      setCompletedCropSquare(undefined);
      setCompletedCropWide(undefined);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles['image-uploader']}>
      <div className={styles['upload-section']}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={onSelectFile} 
          disabled={isUploading}
        />
        
        {uploadError && (
          <div className={styles['error-message']}>{uploadError}</div>
        )}
      </div>

      {imgSrc && (
        <div className={styles['crop-container']}>
          <h3>Square Crop (1:1)</h3>
          <div className={styles['crop-wrapper']}>
            <ReactCrop
              crop={cropSquare}
              onChange={(c: Crop) => setCropSquare(c)}
              onComplete={(c: PixelCrop) => setCompletedCropSquare(c)}
              aspect={1}
              circularCrop={false}
            >
              <img
                ref={squareImgRef}
                src={imgSrc}
                alt="Square crop"
                style={{ maxHeight: '300px' }}
                onLoad={(e) => onImageLoad(e, true)}
              />
            </ReactCrop>
          </div>

          <h3>Wide Crop (1.9:1)</h3>
          <div className={styles['crop-wrapper']}>
            <ReactCrop
              crop={cropWide}
              onChange={(c: Crop) => setCropWide(c)}
              onComplete={(c: PixelCrop) => setCompletedCropWide(c)}
              aspect={1.9}
              circularCrop={false}
            >
              <img
                ref={wideImgRef}
                src={imgSrc}
                alt="Wide crop"
                style={{ maxHeight: '300px' }}
                onLoad={(e) => onImageLoad(e, false)}
              />
            </ReactCrop>
          </div>

          <button 
            onClick={handleUpload} 
            disabled={isUploading || !completedCropSquare || !completedCropWide}
            className={styles['upload-button']}
          >
            {isUploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      )}
    </div>
  );
} 