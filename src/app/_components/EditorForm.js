'use client';

import { createAssetStory } from '@/lib/actions';
import { useState, useEffect } from 'react';

export default function EditorForm() {
  const [towns, setTowns] = useState([
    { name: 'Ridgefield', slug: 'ridgefield-connecticut' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTowns() {
      try {
        const response = await fetch('/api/page-debug');
        const data = await response.json();
        if (data.success && data.towns) {
          setTowns(data.towns.map(town => ({
            name: town.town,
            slug: town.townSlug
          })));
        }
      } catch (error) {
        console.error('Error fetching towns:', error);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchTowns();
  }, []);

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
      
      <div className="flex flex-col">
        <label htmlFor="town" className="mb-1 font-medium">Town</label>
        <select 
          id="town" 
          name="town" 
          required
          className="border rounded p-2"
        >
          {loading ? (
            <option value="">Loading towns...</option>
          ) : (
            towns.map(town => (
              <option key={town.slug} value={town.slug}>
                {town.name}
              </option>
            ))
          )}
        </select>
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