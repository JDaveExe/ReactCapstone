import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const CheckUpContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const CheckUpProvider = ({ children }) => {
  const [todaysCheckUps, setTodaysCheckUps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to fetch today's check-ups from API on mount
  useEffect(() => {
    const fetchCheckUps = async () => {
      try {
        console.log('[CheckUpContext] Fetching check-ups from API');
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/checkups/today`);
        console.log('[CheckUpContext] API response for check-ups:', response.data);
        setTodaysCheckUps(response.data || []);
        setError(null);
      } catch (error) {
        console.error('[CheckUpContext] Error fetching check-ups from API:', error);
        setError('Failed to fetch check-ups. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckUps();
  }, []);
  // Set up polling to refresh checkups from API periodically
  useEffect(() => {
    const pollInterval = setInterval(() => {
      const refreshCheckUps = async () => {
        try {
          console.log('[CheckUpContext] Polling API for updates');
          const response = await axios.get(`${API_URL}/checkups/today`);
          const apiData = response.data || [];
          
          // Only update if data has changed (compare lengths as a simple check)
          setTodaysCheckUps(prevCheckUps => {
            if (prevCheckUps.length !== apiData.length || JSON.stringify(prevCheckUps) !== JSON.stringify(apiData)) {
              console.log('[CheckUpContext] API polling detected changes:', apiData);
              return apiData;
            }
            return prevCheckUps;
          });
        } catch (error) {
          console.error('[CheckUpContext] Error polling check-ups API:', error);
          // Don't set error state here to avoid UI disruption during background polling
        }
      };
      
      refreshCheckUps();
    }, 3000); // Poll every 3 seconds
    
    console.log('[CheckUpContext] Started API polling interval');
    
    return () => {
      clearInterval(pollInterval);
      console.log('[CheckUpContext] Stopped API polling interval');
    };
  }, []);
  const addPatientToCheckUpList = useCallback(async (patientData) => {
    console.log('[CheckUpContext] addPatientToCheckUpList called with:', patientData);
    try {
      const response = await axios.post(`${API_URL}/checkups/today`, patientData);
      console.log('[CheckUpContext] API response after adding patient:', response.data);
      
      // Update local state with the full updated list from the server
      setTodaysCheckUps(response.data.checkUps);
      return response.data.checkUp;
    } catch (error) {
      console.error('[CheckUpContext] Error adding patient to check-up list via API:', error);
      setError('Failed to add patient to check-up list. Please try again.');
      throw error;
    }
  }, []);
  const updateCheckUpItem = useCallback(async (updatedItem) => {
    console.log('[CheckUpContext] updateCheckUpItem called with:', updatedItem);
    try {
      const response = await axios.put(`${API_URL}/checkups/today/${updatedItem.id}`, updatedItem);
      console.log('[CheckUpContext] API response after updating check-up item:', response.data);
      
      // Update local state with the full updated list from the server
      setTodaysCheckUps(response.data.checkUps);
      return response.data.checkUp;
    } catch (error) {
      console.error('[CheckUpContext] Error updating check-up item via API:', error);
      setError('Failed to update check-up item. Please try again.');
      throw error;
    }
  }, []);

  const clearTodaysCheckUps = useCallback(async () => {
    console.log('[CheckUpContext] clearTodaysCheckUps called.');
    try {
      const response = await axios.delete(`${API_URL}/checkups/today`);
      console.log('[CheckUpContext] API response after clearing check-ups:', response.data);
      
      setTodaysCheckUps([]);
    } catch (error) {
      console.error('[CheckUpContext] Error clearing check-ups via API:', error);
      setError('Failed to clear check-ups. Please try again.');
      throw error;
    }
  }, []);

  const archiveSession = useCallback(async (sessionData) => {
    console.log('[CheckUpContext] archiveSession called with:', sessionData);
    try {
      const response = await axios.post(`${API_URL}/sessionhistory`, sessionData);
      console.log('[CheckUpContext] API response after archiving session:', response.data);
      // Optionally, you might want to remove the archived session from todaysCheckUps
      // or trigger a re-fetch, depending on desired behavior.
      // For now, we assume the polling will handle the update if the backend removes it.
      return response.data.session;
    } catch (error) {
      console.error('[CheckUpContext] Error archiving session via API:', error);
      setError('Failed to archive session. Please try again.');
      throw error;
    }
  }, []);

  return (
    <CheckUpContext.Provider value={{ 
      todaysCheckUps, 
      addPatientToCheckUpList, 
      updateCheckUpItem, 
      clearTodaysCheckUps, 
      archiveSession, // Add new function to context value
      setTodaysCheckUps,
      isLoading,
      error
    }}>
      {children}
    </CheckUpContext.Provider>
  );
};

export default CheckUpContext;