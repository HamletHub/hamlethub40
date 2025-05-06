'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function SearchableTownDropdown({ onSelect, initialTown = null }) {
  const [searchText, setSearchText] = useState('');
  const [towns, setTowns] = useState([]);
  const [filteredTowns, setFilteredTowns] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTown, setSelectedTown] = useState(initialTown);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const didInitialSelectRef = useRef(false); // Track if we've already done initial selection

  // Load towns when component mounts
  useEffect(() => {
    const loadTowns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching towns from API...');
        const response = await fetch('/api/towns');
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.towns && Array.isArray(data.towns)) {
          console.log(`Loaded ${data.towns.length} towns`);
          
          // Ensure all towns have the required fields
          const validTowns = data.towns.filter(town => 
            town && town._id && town.title
          );
          
          console.log(`${validTowns.length} valid towns after filtering`);
          setTowns(validTowns);
        } else {
          setError('Invalid data format received from API');
          console.error('Invalid data format:', data);
        }
      } catch (error) {
        setError(`Error loading towns: ${error.message}`);
        console.error('Error loading towns:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTowns();
  }, []);

  // If initialTown is provided, set it when towns are loaded (only once)
  useEffect(() => {
    if (initialTown && towns.length > 0 && !didInitialSelectRef.current) {
      // Find the town in the loaded towns list
      const town = towns.find(t => t._id === initialTown.id);
      if (town) {
        setSelectedTown({ id: town._id, title: town.title, alias: town.alias });
        // Set the search text to match the town name
        setSearchText(town.title);
        // Mark that we've processed the initial selection
        didInitialSelectRef.current = true;
        // Also call onSelect to notify parent component
        onSelect({ id: town._id, title: town.title, alias: town.alias });
      }
    }
  }, [initialTown, towns, onSelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter towns based on search term
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchText(term);
    
    // Always show dropdown when typing
    setShowDropdown(true);
    
    // Only filter and show towns if there's at least 2 characters
    if (term.trim().length < 2) {
      setFilteredTowns([]);
    } else {
      const lowercaseTerm = term.toLowerCase();
      const filtered = towns.filter(town => 
        town.title.toLowerCase().includes(lowercaseTerm)
      );
      console.log(`Found ${filtered.length} matches for "${term}"`);
      setFilteredTowns(filtered);
    }
  };

  const handleSelectTown = (town) => {
    console.log('Town selected:', town);
    const selectedTownData = {
      id: town._id,
      title: town.title,
      alias: town.alias
    };
    setSelectedTown(selectedTownData);
    setSearchText(town.title);
    setShowDropdown(false);
    onSelect(selectedTownData);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        className="w-full border rounded p-2"
        placeholder="Start typing your town name..."
        value={searchText}
        onChange={handleSearch}
        onClick={() => setShowDropdown(true)}
        autoComplete="off"
      />
      
      {/* Hidden input to store the town ID as a string */}
      <input 
        type="hidden" 
        name="townId" 
        value={selectedTown ? selectedTown.id : ''} 
      />
      
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Loading towns...</div>
          ) : error ? (
            <div className="p-2 text-red-500">{error}</div>
          ) : searchText.trim().length < 2 ? (
            <div className="p-2 text-gray-500">Type at least 2 characters to search</div>
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