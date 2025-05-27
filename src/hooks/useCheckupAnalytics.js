import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useCheckupAnalytics = (period = 'month1') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCheckupData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/analytics/checkups/${period}`);
      
      if (response.data.success) {
        setData(response.data);
      } else {
        throw new Error('Failed to fetch checkup analytics');
      }
    } catch (err) {
      console.error('Checkup analytics error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch checkup analytics');
        // Set to zero for now - will be connected to real data
      setData({
        success: true,
        period,
        data: generateZeroData(period),
        summary: {
          totalCheckups: 0,
          avgDaily: 0.0,
          periodStart: getPeriodStart(period),
          periodEnd: new Date().toISOString().split('T')[0]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchCheckupData();
  }, [fetchCheckupData]);

  const refetch = useCallback(() => {
    fetchCheckupData();
  }, [fetchCheckupData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

// Helper function to generate zero data (for initial state)
function generateZeroData(period) {
  const daysToShow = getPeriodDays(period);
  const data = [];
  const currentDate = new Date();
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    data.push({
      date: dateStr,
      checkups: 0 // All zeros for now
    });
  }
  
  return data;
}

// Helper function to generate fallback data
function generateFallbackData(period) {
  const daysToShow = getPeriodDays(period);
  const data = [];
  const currentDate = new Date();
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate realistic sample data
    const dayOfWeek = date.getDay();
    const baseCheckups = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 6; // Weekend vs weekday
    const randomVariation = Math.floor(Math.random() * 4);
    const checkups = Math.max(0, baseCheckups + randomVariation - 1);
    
    data.push({
      date: dateStr,
      checkups: checkups
    });
  }
  
  return data;
}

// Helper function to get period start date
function getPeriodStart(period) {
  const now = new Date();
  switch (period) {
    case 'day':
      return now.toISOString().split('T')[0];
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      return weekStart.toISOString().split('T')[0];
    case 'month1':
      const monthStart = new Date(now);
      monthStart.setDate(now.getDate() - 30);
      return monthStart.toISOString().split('T')[0];
    case 'month3':
      const threeMonthStart = new Date(now);
      threeMonthStart.setDate(now.getDate() - 90);
      return threeMonthStart.toISOString().split('T')[0];
    case 'month6':
      const sixMonthStart = new Date(now);
      sixMonthStart.setDate(now.getDate() - 180);
      return sixMonthStart.toISOString().split('T')[0];
    case 'year':
      const yearStart = new Date(now);
      yearStart.setDate(now.getDate() - 365);
      return yearStart.toISOString().split('T')[0];
    default:
      return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]; // Start of year
  }
}

// Helper function to get number of days for period
function getPeriodDays(period) {
  switch (period) {
    case 'day':
      return 1;
    case 'week':
      return 7;
    case 'month1':
      return 30;
    case 'month3':
      return 90;
    case 'month6':
      return 180;
    case 'year':
      return 365;
    default:
      return 30;
  }
}

export default useCheckupAnalytics;
