'use client';

import BgWords from "@/app/_components/BgWords";
import WordsScroll from "@/app/_components/WordsScroll";
import SearchableTownDropdown from "@/app/_components/SearchableTownDropdown";
import styles from "./page.module.css";

// Define type for town object based on SearchableTownDropdown component
interface Town {
  id: string;
  title: string;
  alias: string;
}

export default function Index() {
  const handleTownSelect = (town: Town) => {
    if (town && town.id) {
      // Navigate to the town page using the town alias if available, fallback to slugified title
      const townSlug = town.alias || town.title.toLowerCase().replace(/\s+/g, '-');
      window.location.href = `/${townSlug}`;
    }
  };

  return (
    <div className={styles.wrapper}>
      <BgWords />
      <div className="container mx-auto">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-medium leading-tight text-green-dark font-vollkorn">
              <span>HamletHub celebrates the </span>
              <WordsScroll />
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-800 mt-4">
              that make our community great. <br />
              Be local. Discover your town.
            </p>
            
            <div className="mt-8 max-w-md mx-auto">
              <div className="pt-2">
                <h2 className="text-xl font-semibold mb-3 text-green-dark">Find Your Town</h2>
                <SearchableTownDropdown onSelect={handleTownSelect} />
                <p className="text-sm text-gray-600 mt-2">
                  Search and select your town to visit its local HamletHub
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}