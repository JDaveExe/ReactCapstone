import React, { createContext, useState, useEffect } from 'react';

const DateTimeContext = createContext();

export const DateTimeProvider = ({ children }) => {
  const [simulatedDate, setSimulatedDate] = useState(null); // null means use system date
  
  // Function to set a simulated date
  const setSimulationDate = (date) => {
    if (date) {
      localStorage.setItem('simulatedDate', date.toISOString());
    } else {
      localStorage.removeItem('simulatedDate');
    }
    setSimulatedDate(date);
  };
  
  // Function to get current date (simulated or real)
  const getCurrentDate = () => {
    return simulatedDate || new Date();
  };
  
  // Load simulated date from localStorage on mount
  useEffect(() => {
    const savedDate = localStorage.getItem('simulatedDate');
    if (savedDate) {
      setSimulatedDate(new Date(savedDate));
    }
  }, []);
  
  return (
    <DateTimeContext.Provider value={{ 
      simulatedDate, 
      setSimulationDate, 
      getCurrentDate,
      isSimulated: simulatedDate !== null
    }}>
      {children}
    </DateTimeContext.Provider>
  );
};

export default DateTimeContext;
