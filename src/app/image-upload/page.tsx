'use client';

import React, { useState } from 'react';
import ImageUploader from '../_components/ImageUploader';
import styles from './page.module.css';

export default function ImageUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<{
    original: string;
    square: string;
    wide: string;
  } | null>(null);

  const handleImagesUploaded = (imageUrls: {
    original: string;
    square: string;
    wide: string;
  }) => {
    setUploadedImages(imageUrls);
  };

  return (
    <div className={styles.container}>
      <h1>Image Upload with Dual Crop</h1>
      <p>Upload an image and adjust crops to 1:1 and 1.9:1 ratios</p>
      
      <ImageUploader onImageUploaded={handleImagesUploaded} />
      
      {uploadedImages && (
        <div className={styles.results}>
          <h2>Uploaded Images</h2>
          
          <div className={styles['image-grid']}>
            <div className={styles['image-card']}>
              <h3>Original</h3>
              <img 
                src={uploadedImages.original} 
                alt="Original upload" 
                style={{ maxWidth: '100%' }}
              />
              <div className={styles['image-url']}>
                <code>{uploadedImages.original}</code>
              </div>
            </div>
            
            <div className={styles['image-card']}>
              <h3>Square (1:1)</h3>
              <img 
                src={uploadedImages.square} 
                alt="Square crop" 
                style={{ maxWidth: '100%' }}
              />
              <div className={styles['image-url']}>
                <code>{uploadedImages.square}</code>
              </div>
            </div>
            
            <div className={styles['image-card']}>
              <h3>Wide (1.9:1)</h3>
              <img 
                src={uploadedImages.wide} 
                alt="Wide crop" 
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
              <div className={styles['image-url']}>
                <code>{uploadedImages.wide}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 