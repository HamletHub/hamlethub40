"use client"

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TownHeaderProps {
  hubTitle: string;
}

const TownHeader = ({ hubTitle }: TownHeaderProps) => {
  const pathname = usePathname();
  // Check if we're on a town homepage by counting path segments
  // Town homepages will have only one path segment (the town alias)
  const isTownHomePage = pathname ? 
    pathname.split('/').filter((segment: string) => segment !== '').length === 1 : 
    false;
  
  return (
    <header className="mb-6">
      <div className="flex flex-col">
        {/* Logo in the upper left */}
        <div className="mb-2 md:pt-8">
          <Image 
            src="/images/HH_logo.svg" 
            alt="HamletHub Logo" 
            width={223} 
            height={32} 
            priority
          />
        </div>
        
        {/* Nav items row with hub title and menu items */}
        <div className="flex items-center justify-between mb-3">
          {/* Hub title in gold */}
          <h2 
            className="text-base md:text-lg font-vollkorn font-normal"
            style={{ color: 'rgb(170, 150, 95)' }}
          >
            {hubTitle}
          </h2>
          
          {/* Navigation menu */}
          <nav className="flex items-center space-x-6">
            <Link 
              href="/[town]" 
              as={`/${pathname?.split('/')[1]}`}
              className={`text-base md:text-lg font-vollkorn text-green-dark hover:text-green-medium ${isTownHomePage ? 'border-b-4 border-green-medium' : ''}`}
            >
              Home
            </Link>
            <Link 
              href="/login" 
              className="text-base md:text-lg font-vollkorn text-green-dark hover:text-green-medium"
            >
              Login
            </Link>
            {/* Search icon */}
            <button 
              aria-label="Search" 
              className="text-green-dark hover:text-green-medium"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </nav>
        </div>
        
        {/* Horizontal light grey line */}
        <div 
          className="w-full h-[1px]" 
          style={{ backgroundColor: 'rgb(229, 229, 229)' }}
        ></div>
      </div>
    </header>
  );
};

export default TownHeader; 