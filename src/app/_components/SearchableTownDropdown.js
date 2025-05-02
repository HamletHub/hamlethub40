'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function SearchableTownDropdown({ onSelect, initialTown = null }) {
  const [searchText, setSearchText] = useState('');
  const [towns, setTowns] = useState([]);
  const [filteredTowns, setFilteredTowns] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTown, setSelectedTown] = useState(initialTown);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const didInitialSelectRef = useRef(false); // Track if we've already done initial selection

  // Load towns when component mounts
  useEffect(() => {
    const loadTowns = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/towns');
        const data = await response.json();
        
        if (data.towns) {
          setTowns(data.towns);
          setFilteredTowns(data.towns);
        }
      } catch (error) {
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
        setSelectedTown({ id: town._id, title: town.title });
        // Set the search text to match the town name
        setSearchText(town.title);
        // Mark that we've processed the initial selection
        didInitialSelectRef.current = true;
        // Also call onSelect to notify parent component
        onSelect({ id: town._id, title: town.title });
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
    const term = e.target.value.toLowerCase();
    
    // Only show dropdown and filter if text is actually changing
    if (term !== searchText.toLowerCase()) {
      setSearchText(term);
      setShowDropdown(true);
      setFilteredTowns(towns.filter(town => 
        town.title.toLowerCase().includes(term)
      ));
    } else {
      // Just update the text without toggling dropdown
      setSearchText(term);
    }
  };

  const handleSelectTown = (town) => {
    console.log('Town selected:', town);
    setSelectedTown(town);
    setSearchText(town.title);
    setShowDropdown(false);
    onSelect(town);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        className="w-full border rounded p-2"
        placeholder="Search for a town..."
        value={searchText}
        onChange={handleSearch}
        onClick={() => setShowDropdown(true)}
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