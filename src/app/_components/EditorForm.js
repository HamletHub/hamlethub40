'use client';

import React, { useState, useEffect } from 'react';
import { createAssetStory } from '@/lib/actions';
import ImageUploader from './ImageUploader';
import SearchableTownDropdown from './SearchableTownDropdown';

export default function EditorForm() {
  const [loading, setLoading] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [uploadedImages, setUploadedImages] = useState({
    original: '',
    square: '',
    wide: ''
  });
  const [selectedTown, setSelectedTown] = useState(null);

  const handleImagesUploaded = (imageUrls) => {
    setUploadedImages(imageUrls);
    setShowImageUploader(false);
  };

  const handleTownSelect = (town) => {
    setSelectedTown(town);
  };

  return (
    <form action={createAssetStory} className="space-y-4">
      <div className="flex flex-col">
        <label htmlFor="title" className="mb-1 font-medium">Title</label>
        <input 
          type="text" 
          id="title" 
          name="title" 
          required 
          className="border rounded p-2"
        />
      </div>
      
      <div className="flex flex-col">
        <label htmlFor="description" className="mb-1 font-medium">Content (Markdown)</label>
        <textarea 
          id="description" 
          name="description" 
          rows="10" 
          required
          className="border rounded p-2"
        ></textarea>
      </div>
      
      <div className="flex flex-col">
        <label htmlFor="metadescription" className="mb-1 font-medium">Meta Description</label>
        <input 
          type="text" 
          id="metadescription" 
          name="metadescription"
          className="border rounded p-2"
        />
      </div>
      
      {/* Image Upload Section */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Featured Image</label>
        
        {!showImageUploader && (
          <div className="flex flex-col gap-4">
            <button 
              type="button"
              onClick={() => setShowImageUploader(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
            >
              {uploadedImages.original ? 'Change Image' : 'Upload Image'}
            </button>
            
            {uploadedImages.original && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Selected Image:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-1">Square (1:1)</p>
                      <img 
                        src={uploadedImages.square} 
                        alt="Square crop" 
                        className="border rounded max-h-32"
                      />
                    </div>
                    <div>
                      <p className="text-xs mb-1">Wide (1.9:1)</p>
                      <img 
                        src={uploadedImages.wide} 
                        alt="Wide crop" 
                        className="border rounded max-h-32"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {showImageUploader && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Crop Your Image</h3>
              <button 
                type="button" 
                onClick={() => setShowImageUploader(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <ImageUploader onImageUploaded={handleImagesUploaded} />
          </div>
        )}
        
        {/* Hidden inputs to include image URLs in form submission */}
        <input type="hidden" name="originalImage" value={uploadedImages.original} />
        <input type="hidden" name="squareImage" value={uploadedImages.square} />
        <input type="hidden" name="wideImage" value={uploadedImages.wide} />
      </div>
      
      <div className="flex flex-col">
        <label htmlFor="town" className="mb-1 font-medium">Town</label>
        <SearchableTownDropdown onSelect={handleTownSelect} />
        {selectedTown && (
          <p className="text-sm text-gray-500 mt-1">Selected: {selectedTown.title}</p>
        )}
      </div>
      
      <button 
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
      >
        Submit Story
      </button>
    </form>
  );
}