'use client';

import { useState } from 'react';
import GoogleAd from "@/app/_components/GoogleAd";

export default function AdTestPage() {
  const [town, setTown] = useState('ridgefield-connecticut');
  const [adSize, setAdSize] = useState<'970x90' | '300x250'>('970x90');
  const [useCustomAlias, setUseCustomAlias] = useState(false);
  const [customAlias, setCustomAlias] = useState('ridgefield-connecticut');
  
  // Determine the alias based on the selected options
  const adAlias = useCustomAlias ? customAlias : town;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Google Ad Tester</h1>
      
      <div className="bg-gray-100 p-4 mb-8 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Ad Configuration</h2>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={useCustomAlias}
              onChange={() => setUseCustomAlias(!useCustomAlias)}
              className="mr-2"
            />
            Use custom alias
          </label>
        </div>
        
        {useCustomAlias ? (
          <div className="mb-4">
            <label className="block mb-1">Custom Alias</label>
            <input 
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g. ridgefield-connecticut"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the exact ad unit name without the account number
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Town</label>
                <select 
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="ridgefield-connecticut">Ridgefield</option>
                  <option value="danbury-connecticut">Danbury</option>
                  <option value="bethel-connecticut">Bethel</option>
                  <option value="westport-connecticut">Westport</option>
                  <option value="wilton-connecticut">Wilton</option>
                </select>
              </div>
            </div>
          </>
        )}
        
        <div className="mt-4">
          <label className="block mb-1">Ad Size</label>
          <select 
            value={adSize}
            onChange={(e) => setAdSize(e.target.value as '970x90' | '300x250')}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="970x90">970x90 (Leaderboard)</option>
            <option value="300x250">300x250 (Medium Rectangle)</option>
          </select>
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-mono bg-gray-200 p-2 rounded">
            Final Ad ID: <strong>{`/15251363/${adAlias}`}</strong>
          </p>
        </div>
      </div>
      
      <div className="bg-white p-4 border rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-4">Ad Preview</h2>
        <div className="flex justify-center">
          <GoogleAd alias={adAlias} size={adSize} />
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Troubleshooting</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Open your browser's console (F12) to see debug messages.</li>
          <li>Make sure the ad unit exists in your Google Ad Manager account.</li>
          <li>Try using the exact town slug pattern as defined in Google Ad Manager.</li>
          <li>Check for any console errors related to ad loading.</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm font-medium">Important Changes:</p>
          <ul className="text-xs mt-1 space-y-1">
            <li>Now using the town slug directly as the ad unit name</li>
            <li>No longer adding "_leaderboard-1" or other suffixes</li>
            <li>For the town pages, the URL slug is used directly</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 