import React, { useState, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";

const ColorPicker = ({ index, color, onColorChange, generateHexCode }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleColorChange = (newColor) => {
    onColorChange(index, newColor);
  };

  // Only apply dynamic styles if isClient is true
  const dynamicStyle = isClient ? { backgroundColor: color } : {};

  return (
    <div className="relative w-full">
      {color ? (
        <div
          className="h-[150px] bg-slate-800 cursor-pointer"
          style={dynamicStyle}
        >
          <div
            onMouseEnter={() => setShowPicker(true)}
            onMouseLeave={() => setShowPicker(false)}
            className="h-full w-full"
          >
            {showPicker && (
              <div className="absolute z-10 w-full">
                <HexColorPicker
                  style={{ width: "100vw", height: "150px", position: "fixed", left: "50%", transform: "translateX(-50%)" }}
                  color={color}
                  onChange={handleColorChange}
                />
              </div>
            )}
          </div>
          <button 
            className="absolute w-full translate-y-4 text-2xl text-center"
            onClick={() => handleColorChange(null)}
          >
            🗑️
          </button>
        </div>
      ) : (
        <button
          style={dynamicStyle}
          className={`w-full h-full text-3xl font-extrabold text-black ${index < 4 ? "border-r-2 border-black" : ""}`}
          onClick={() => handleColorChange(generateHexCode())}
        >
          +
        </button>
      )}
    </div>
  );
};


export default function ChoosePalette() {
  const [colors, setColors] = useState(Array(5).fill(null).map(generateHexCode));

  const handleColorChange = (index, newColor) => {
    setColors((prevColors) => {
      const newColors = [...prevColors];
      newColors[index] = newColor;
      return newColors;
    });
  };

  function generateHexCode() {
    const hexChars = '0123456789ABCDEF';
    let hex = '';
  
    // Generate a random 6-digit hex code
    for (let i = 0; i < 6; i++) {
      hex += hexChars[Math.floor(Math.random() * 16)];
    }
    
    // console.log(hex)
    hex = "#" + hex.toLowerCase()
    return hex;
  }
  
  const generateRandomPalette = () => {
    const numColors = Math.floor(Math.random() * 4) + 2;
    const newColors = Array(5).fill(null);
  
    for (let i = 0; i < numColors; i++) {
      newColors[i] = generateHexCode();
    }
  
    setColors(newColors);
    };

    async function fetchPalette() {
        let hexCodes = `${colors[0]}-${colors[1]}-${colors[2]}-${colors[3]}-${colors[4]}`;
            hexCodes = hexCodes.replaceAll('#', '').replaceAll('-undefined', '').replaceAll('-null', '');
        let url = `/api/palette?hex=${encodeURIComponent(hexCodes)}`;
    
        console.log('fetching new palette');
        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
        } catch (error) {
            console.error('Error fetching new palette:', error);
        }
    }

  // run on component mount
  useEffect(() => {
    fetchPalette();
  }, []);

  const sendAction = async (action) => {
    const response = await fetch('/api/carousel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });
  
    if (!response.ok) {
      console.error('Failed to send direction');
    }
  };

  return (
    <div className="relative flex flex-col justify-around h-full">

      <div className="flex justify-around w-full">
        {colors.map((color, index) => (
          <ColorPicker 
            key={index} 
            index={index} 
            color={color} 
            onColorChange={handleColorChange}
            generateHexCode={generateHexCode}
          />
        ))}
      </div>

      <div className="flex flex-col gap-y-8">
        
        <div className='flex justify-center gap-x-4'>
          {[
            { label: 'RANDOM PALETTE', action: generateRandomPalette },
            { label: 'FETCH IMAGES', action: fetchPalette }
          ].map((button, index) => (
            <button 
              key={index}
              className='h-24 px-4 bg-black hover:bg-slate-900 text-xl font-bold text-white'
              onClick={button.action}>
              {button.label}
            </button>
          ))}
        </div>

        <div className="flex w-full justify-center gap-24 mb-8">
          {[
            { label: "Prev", symbol: "&larr;", action: 'prev' },
            { label: "Favorite", symbol: "&#x2764;", action: 'favorite' },
            { label: "Next", symbol: "&rarr;", action: 'next' }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center hover:text-gray-600">
              <span className="text-sm">{item.label}</span>
              <button 
                className="text-4xl" 
                dangerouslySetInnerHTML={{ __html: item.symbol }}
                onClick={() => s(item.action)}
                ></button>
            </div>
          ))}
        </div>
            
      </div>

    </div>
  )
}