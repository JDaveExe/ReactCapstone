import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const useAnalytics = (period = 'month1') => {
  const [data, setData] = useState({
    consultations: [],
    diagnosticTests: [],
    services: [],
    medications: [],
    dailyTrends: [],
    summary: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/analytics/dashboard/${period}`);
        
        if (response.data.success) {
          setData({
            consultations: response.data.consultations || [],
            diagnosticTests: response.data.diagnosticTests || [],
            services: response.data.services || [],
            medications: response.data.medications || [],
            dailyTrends: response.data.dailyTrends || [],
            summary: response.data.summary || {}
          });
        } else {
          throw new Error('Failed to fetch analytics data');
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(err.message);
        // Set fallback static data in case of error
        setData({
          consultations: [
            { name: 'General', value: 35 },
            { name: 'Follow-up', value: 25 },
            { name: 'Emergency', value: 20 },
            { name: 'Specialist', value: 20 }
          ],
          diagnosticTests: [
            { name: 'Blood Test', value: 40 },
            { name: 'X-Ray', value: 30 },
            { name: 'Urine Test', value: 20 },
            { name: 'Other', value: 10 }
          ],
          services: [
            { name: 'Consultation', value: 45 },
            { name: 'Diagnostic Test', value: 30 },
            { name: 'Medication', value: 25 }
          ],
          medications: [
            { name: 'Paracetamol', value: 25 },
            { name: 'Amoxicillin', value: 20 },
            { name: 'Metformin', value: 15 },
            { name: 'Ibuprofen', value: 15 },
            { name: 'Others', value: 25 }
          ],
          dailyTrends: [],
          summary: {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [period]);

  const refetch = () => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/analytics/dashboard/${period}`);
        
        if (response.data.success) {
          setData({
            consultations: response.data.consultations || [],
            diagnosticTests: response.data.diagnosticTests || [],
            services: response.data.services || [],
            medications: response.data.medications || [],
            dailyTrends: response.data.dailyTrends || [],
            summary: response.data.summary || {}
          });
        }
      } catch (err) {
        console.error('Analytics refetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  };

  return { data, loading, error, refetch };
};

export default useAnalytics;
