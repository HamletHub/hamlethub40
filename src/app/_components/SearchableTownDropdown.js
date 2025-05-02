'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function SearchableTownDropdown({ onSelect }) {
  const [towns, setTowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTown, setSelectedTown] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch towns from the database
  useEffect(() => {
    async function fetchTowns() {
      try {
        console.log('Fetching towns from API...');
        const response = await fetch('/api/towns');
        const data = await response.json();
        
        if (data.success && data.towns) {
          console.log('Towns fetched successfully:', data.towns.length);
          setTowns(data.towns);
        } else {
          console.error('Failed to load towns from API:', data);
          setError('Failed to load towns');
        }
      } catch (error) {
        console.error('Error fetching towns:', error);
        setError('Failed to load towns');
      } finally {
        setLoading(false);
      }
    }

    fetchTowns();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter towns based on search term
  const filteredTowns = towns.filter(town => 
    town.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTown = (town) => {
    console.log('Town selected:', town);
    setSelectedTown(town);
    setSearchTerm(town.title);
    setIsOpen(false);
    onSelect(town);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        className="w-full border rounded p-2"
        placeholder="Search for a town..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onClick={() => setIsOpen(true)}
      />
      
      {/* Hidden input to store the town ID as a string */}
      <input 
        type="hidden" 
        name="townId" 
        value={selectedTown ? selectedTown._id : ''} 
      />
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-gray-500">Loading towns...</div>
          ) : error ? (
            <div className="p-2 text-red-500">{error}</div>
          ) : filteredTowns.length === 0 ? (
            <div className="p-2 text-gray-500">No towns found</div>
          ) : (
            <ul>
              {filteredTowns.map(town => (
                <li 
                  key={town._id}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectTown(town)}
                >
                  {town.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 