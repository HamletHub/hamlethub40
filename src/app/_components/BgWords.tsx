import React from 'react';

const BgWords = () => {
  const words = ['News', 'Meeting', 'People', 'Events', 'Community', 'Hub'];

  // Define styles directly with every property explicitly set
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    margin: 0,
    padding: 0
  };

  return (
    <div style={containerStyle}>
      {words.map((word, index) => {
        // Define word style explicitly for each word
        const wordStyle: React.CSSProperties = {
          position: 'absolute',
          top: `${index * 8}rem`,
          left: 0,
          fontSize: '8.37rem',
          fontWeight: 800,
          fontFamily: 'var(--font-vollkorn), serif',
          color: '#c2e4e0', 
          opacity: 0.2,
          whiteSpace: 'nowrap',
          margin: 0,
          padding: 0
        };

        return (
          <p key={index} style={wordStyle}>
            {word}
          </p>
        );
      })}
    </div>
  );
};

export default BgWords; 