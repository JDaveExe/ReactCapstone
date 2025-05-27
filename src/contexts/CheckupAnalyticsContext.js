import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { backupAnalyticsData, restoreAnalyticsData } from '../utils/analyticsBackup';
import DateTimeContext from './DateTimeContext';

const CheckupAnalyticsContext = createContext();

export const useCheckupAnalytics = () => {
  const context = useContext(CheckupAnalyticsContext);
  if (!context) {
    throw new Error('useCheckupAnalytics must be used within a CheckupAnalyticsProvider');
  }
  return context;
};

export const CheckupAnalyticsProvider = ({ children }) => {
  const { getCurrentDate, isSimulated } = useContext(DateTimeContext);
  const [dailyCheckups, setDailyCheckups] = useState(new Map());
  const [testCheckups, setTestCheckups] = useState(new Map()); // Track test checkups separately
  const [lastUpdate, setLastUpdate] = useState(Date.now());// Add event listener to back up data when app is closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      backupAnalyticsData();
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Load data from localStorage on initialization
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        // First try to restore data from backup if needed
        const wasRestored = restoreAnalyticsData();
        
        // Load official checkups
        const savedCheckups = localStorage.getItem('checkupAnalytics_dailyCheckups');
        const savedTestCheckups = localStorage.getItem('checkupAnalytics_testCheckups');
        
        if (savedCheckups) {
          const parsedCheckups = JSON.parse(savedCheckups);
          const checkupsMap = new Map(parsedCheckups);
          setDailyCheckups(checkupsMap);
        }
        
        if (savedTestCheckups) {
          const parsedTestCheckups = JSON.parse(savedTestCheckups);
          const testCheckupsMap = new Map(parsedTestCheckups);
          setTestCheckups(testCheckupsMap);
        }
        
        // If no data exists, initialize with zero data for the current month
        if (!savedCheckups) {
          initializeEmptyData();
        }
        
        if (wasRestored) {
          console.log('Checkup analytics data was restored from backup');
        }
      } catch (error) {
        console.error('Error loading checkup analytics from localStorage:', error);
        initializeEmptyData();
      }
    };

    const initializeEmptyData = () => {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const initialData = new Map();
      const initialTestData = new Map();
      
      // Create entries for the last 30 days with 0 checkups
      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(thirtyDaysAgo.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        initialData.set(dateStr, 0);
        initialTestData.set(dateStr, 0);
      }

      setDailyCheckups(initialData);
      setTestCheckups(initialTestData);
    };

    loadFromLocalStorage();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('checkupAnalytics_dailyCheckups', JSON.stringify([...dailyCheckups]));
    } catch (error) {
      console.error('Error saving daily checkups to localStorage:', error);
    }
  }, [dailyCheckups]);
  useEffect(() => {
    try {
      // Make sure testCheckups is a valid Map before converting to array
      if (testCheckups && testCheckups instanceof Map && testCheckups.size >= 0) {
        localStorage.setItem('checkupAnalytics_testCheckups', JSON.stringify([...testCheckups]));
      }
    } catch (error) {
      console.error('Error saving test checkups to localStorage:', error);
    }
  }, [testCheckups]);// Function to increment today's checkup count
  const incrementTodayCheckups = useCallback(() => {
    const today = getCurrentDate().toISOString().split('T')[0];
    setDailyCheckups(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(today) || 0;
      newMap.set(today, currentCount + 1);
      return newMap;
    });
    setLastUpdate(Date.now());
  }, [getCurrentDate]);
  // Function to increment today's test checkup count
  const incrementTodayTestCheckups = useCallback(() => {
    const today = getCurrentDate().toISOString().split('T')[0];
    setTestCheckups(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(today) || 0;
      newMap.set(today, currentCount + 1);
      return newMap;
    });
    setLastUpdate(Date.now());
  }, [getCurrentDate]);
  // Function to get data for a specific period
  const getDataForPeriod = useCallback((period) => {
    const today = new Date();
    const data = [];
    let daysToShow;

    switch (period) {
      case 'day':
        daysToShow = 1;
        break;
      case 'week':
        daysToShow = 7;
        break;
      case 'month1':
        daysToShow = 30;
        break;
      case 'month3':
        daysToShow = 90;
        break;
      case 'month6':
        daysToShow = 180;
        break;
      case 'year':
        daysToShow = 365;
        break;
      default:
        daysToShow = 30;
    }    // Generate data for the specified period
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Safely access Map values with nullish coalescing
      const officialCheckups = dailyCheckups.get(dateStr) ?? 0;
      const testCheckupCount = testCheckups.get(dateStr) ?? 0;
      const totalCheckups = officialCheckups + testCheckupCount;
      
      data.push({
        date: dateStr,
        checkups: totalCheckups
      });
    }    // Calculate summary statistics
    const totalCheckups = data.reduce((sum, day) => sum + day.checkups, 0);
    const avgDaily = totalCheckups / (daysToShow || 1); // Avoid division by zero
    
    // Create a default data array if data is empty
    const safeData = data.length > 0 ? data : [{ date: new Date().toISOString().split('T')[0], checkups: 0 }];

    return {
      success: true,
      period,
      data: safeData,
      summary: {
        totalCheckups,
        avgDaily: parseFloat(avgDaily.toFixed(1)),
        periodStart: safeData[0]?.date,
        periodEnd: safeData[safeData.length - 1]?.date
      }
    };
  }, [dailyCheckups]);
  // Function to reset data (for testing purposes)
  const resetData = useCallback(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const resetMap = new Map();
    const resetTestMap = new Map();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      resetMap.set(dateStr, 0);
      resetTestMap.set(dateStr, 0);
    }

    setDailyCheckups(resetMap);
    setTestCheckups(resetTestMap);
    setLastUpdate(Date.now());
  }, []);  // Function to reset only test checkups
  const resetTestCheckups = useCallback(() => {
    try {
      // Backup the current data before resetting
      backupAnalyticsData();
      
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const resetTestMap = new Map();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(thirtyDaysAgo.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        resetTestMap.set(dateStr, 0);
      }

      // Verify resetTestMap is valid before updating state
      if (resetTestMap instanceof Map && resetTestMap.size > 0) {
        setTestCheckups(resetTestMap);
        setLastUpdate(Date.now());
        return resetTestMap; // Return the map for ChartSimulationModal to use
      } else {
        console.error('resetTestMap is not a valid Map');
        return new Map(); // Return empty map as fallback
      }
    } catch (error) {
      console.error('Error in resetTestCheckups:', error);
      return new Map(); // Return empty map as fallback
    }
  }, []);const value = {
    dailyCheckups,
    testCheckups,
    incrementTodayCheckups,
    incrementTodayTestCheckups,
    getDataForPeriod,
    resetData,
    resetTestCheckups,
    lastUpdate,
    setTestCheckups,
    setLastUpdate
  };

  return (
    <CheckupAnalyticsContext.Provider value={value}>
      {children}
    </CheckupAnalyticsContext.Provider>
  );
};

export default CheckupAnalyticsContext;
