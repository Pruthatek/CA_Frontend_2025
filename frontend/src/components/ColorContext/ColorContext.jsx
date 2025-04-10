import React, { createContext, useState, useContext } from 'react';

// Create the context
const ColorContext = createContext();

// Create a provider component
export const ColorProvider = ({ children }) => {
  const [selectedColor, setSelectedColor] = useState({
    name: "blue",
    bg: "#2C87F2",
    disabled: "#F22C2C",
    one: "#2C87F2",
    two: "#FF8800",
    three: "#00AC17",
    four: "#922CF2",
    highlight: "#EAF3FE"
  });

  return (
    <ColorContext.Provider value={{ selectedColor, setSelectedColor }}>
      {children}
    </ColorContext.Provider>
  );
};

// Custom hook for using the ColorContext
export const useColor = () => {
  return useContext(ColorContext);
};
