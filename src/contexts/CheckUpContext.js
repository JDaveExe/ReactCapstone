import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const CheckUpContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const CheckUpProvider = ({ children }) => {
  const [todaysCheckUps, setTodaysCheckUps] = useState([]);
  const [allScheduledAppointments, setAllScheduledAppointments] = useState([]); // New state
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
        
        // Check if today's data is from a previous day that needs to be reset
        if (response.data && response.data.length > 0) {
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          const firstCheckupDate = new Date(response.data[0].loggedInAt).toISOString().split('T')[0];
          
          if (firstCheckupDate !== today) {
            console.log(`[CheckUpContext] Detected outdated check-ups data (${firstCheckupDate} vs today ${today}). Triggering reset.`);
            try {
              const resetResponse = await axios.post(`${API_URL}/checkups/today/reset`);
              console.log('[CheckUpContext] Auto-reset response:', resetResponse.data);
              setTodaysCheckUps(resetResponse.data.checkUps || []);
            } catch (resetError) {
              console.error('[CheckUpContext] Error during auto-reset:', resetError);
            }
          }
        }
        
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

  // Effect to fetch all scheduled appointments from API on mount
  useEffect(() => {
    const fetchScheduledAppointments = async () => {
      try {
        console.log('[CheckUpContext] Fetching scheduled appointments from API');
        const response = await axios.get(`${API_URL}/appointments`);
        console.log('[CheckUpContext] API response for scheduled appointments:', response.data);
        setAllScheduledAppointments(response.data || []);
      } catch (error) {
        console.error('[CheckUpContext] Error fetching scheduled appointments from API:', error);
        // Don't set error state to avoid UI disruption if only appointments fail to load
      }
    };

    fetchScheduledAppointments();
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
    };  }, []);

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

  // Function to check if appointments need to be moved to today's list
  const moveAppointmentsToToday = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Find appointments scheduled for today that aren't in today's check-ups yet
      const todayAppointments = allScheduledAppointments.filter(app => app.date === today);
      
      if (todayAppointments.length === 0) {
        console.log('[CheckUpContext] No appointments to move to today\'s list');
        return;
      }
      
      console.log('[CheckUpContext] Found appointments for today:', todayAppointments);
      
      // Add today's appointments to the check-up list if they're not already there
      for (const appointment of todayAppointments) {
        const alreadyInList = todaysCheckUps.some(checkup => 
          checkup.appointmentId === appointment.id || 
          (checkup.name === appointment.patientName && 
           checkup.scheduledTime === appointment.time)
        );
        
        if (!alreadyInList) {
          const patientData = {
            id: `appointment_${appointment.id}`,
            appointmentId: appointment.id,
            name: appointment.patientName,
            familyName: appointment.familyName,
            purpose: appointment.purpose,
            scheduledTime: appointment.time
          };
          
          // Add to today's check-ups
          await addPatientToCheckUpList(patientData);
          console.log('[CheckUpContext] Moved appointment to today\'s check-ups:', appointment);
        }
      }
    } catch (error) {
      console.error('[CheckUpContext] Error moving appointments to today:', error);
    }
  }, [allScheduledAppointments, todaysCheckUps, addPatientToCheckUpList]);
    // Check for appointments that need to be moved to today's list periodically
  useEffect(() => {
    // Run once on initial load
    moveAppointmentsToToday();
    
    // Set up interval to check every hour
    const intervalId = setInterval(moveAppointmentsToToday, 60 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [moveAppointmentsToToday]);

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
  
  // Function to reset today's checkups and reload appointments
  const resetTodaysCheckUps = useCallback(async () => {
    console.log('[CheckUpContext] resetTodaysCheckUps called.');
    try {
      const response = await axios.post(`${API_URL}/checkups/today/reset`);
      console.log('[CheckUpContext] API response after resetting check-ups:', response.data);
      
      setTodaysCheckUps(response.data.checkUps || []);
      return response.data;
    } catch (error) {
      console.error('[CheckUpContext] Error resetting check-ups via API:', error);
      setError('Failed to reset check-ups. Please try again.');
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

  // Function to add to allScheduledAppointments
  const addScheduledAppointmentToList = useCallback(async (newAppointment) => {
    try {
      // Make API call to save the appointment to backend
      const response = await axios.post(`${API_URL}/appointments`, newAppointment);
      console.log('[CheckUpContext] Added appointment to backend:', response.data);
      
      // Update local state with the data from the server
      setAllScheduledAppointments(response.data.appointments);
      
      return response.data.appointment;
    } catch (error) {
      console.error('[CheckUpContext] Error adding scheduled appointment:', error);
      setError('Failed to schedule appointment. Please try again.');
      throw error;
    }
  }, []);

  // Function to delete a scheduled appointment
  const deleteScheduledAppointment = useCallback(async (appointmentId) => {
    try {
      // Make API call to delete the appointment
      const response = await axios.delete(`${API_URL}/appointments/${appointmentId}`);
      console.log('[CheckUpContext] Deleted appointment from backend:', response.data);
      
      // Update local state with the data from the server
      setAllScheduledAppointments(response.data.appointments);
      
      return response.data.appointment;
    } catch (error) {
      console.error('[CheckUpContext] Error deleting scheduled appointment:', error);
      setError('Failed to delete appointment. Please try again.');
      throw error;
    }
  }, []);

  return (
    <CheckUpContext.Provider value={{ 
      todaysCheckUps, 
      allScheduledAppointments, // Expose new state
      addPatientToCheckUpList, 
      updateCheckUpItem, 
      clearTodaysCheckUps, 
      archiveSession, 
      setTodaysCheckUps,
      resetTodaysCheckUps, // Expose reset function
      addScheduledAppointmentToList, // Expose new function
      deleteScheduledAppointment, // Expose delete function
      moveAppointmentsToToday, // Expose function to manually check for today's appointments
      isLoading,
      error
    }}>
      {children}
    </CheckUpContext.Provider>
  );
};

export default CheckUpContext;