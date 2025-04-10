// YearContext.js
import React, { createContext, useContext, useState } from "react";

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const [selectedYearRange, setSelectedYearRange] = useState("2025 - 2026");

  const getDatesFromYearRange = (yearRange) => {
    const [startYear, endYear] = yearRange.split(" - ");
    const startDate = `${startYear}-04-01`;
    const endDate = `${endYear}-03-31`;
    return { startDate, endDate };
  };

  const value = {
    selectedYearRange,
    setSelectedYearRange,
    ...getDatesFromYearRange(selectedYearRange),
  };

  return <YearContext.Provider value={value}>{children}</YearContext.Provider>;
};

export const useYear = () => useContext(YearContext);
