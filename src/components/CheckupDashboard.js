import React, { useState, useEffect } from 'react';
import { Calendar, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import { useCheckupAnalytics } from '../contexts/CheckupAnalyticsContext';
import CheckupLineChart from './CheckupLineChart';

const CheckupDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { getDataForPeriod, lastUpdate } = useCheckupAnalytics();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update data when period changes or when lastUpdate changes (indicating new checkup)
  useEffect(() => {
    setLoading(true);
    const newData = getDataForPeriod(selectedPeriod);
    setData(newData);
    setLoading(false);
  }, [selectedPeriod, lastUpdate, getDataForPeriod]);
  
  const periodOptions = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'Last 7 days' },
    { value: 'month1', label: 'Last 30 days' },
    { value: 'month3', label: 'Last 3 months' },
    { value: 'month6', label: 'Last 6 months' },
    { value: 'year', label: 'Last year' },
    { value: 'all', label: 'All time' }
  ];

  const currentPeriodLabel = periodOptions.find(p => p.value === selectedPeriod)?.label || 'Last 30 days';

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, color: '#e5e7eb' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0, display: 'flex', alignItems: 'center' }}>
            <Activity size={24} style={{ marginRight: 8, color: '#3b82f6' }} />
            Patient Checkup Trends
          </h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0 0' }}>
            Real-time tracking of completed patient checkups
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              background: '#374151',
              color: '#e5e7eb',
              border: '1px solid #4b5563',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={() => {
              setLoading(true);
              const newData = getDataForPeriod(selectedPeriod);
              setData(newData);
              setLoading(false);
            }}
            disabled={loading}
            style={{
              background: loading ? '#374151' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              opacity: loading ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8'
        }}>
          <div style={{ textAlign: 'center' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
            <div>Loading checkup data...</div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#374151', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>Total Checkups</span>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>
                {data.summary?.totalCheckups || 0}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {currentPeriodLabel}
              </div>
            </div>

            <div style={{ background: '#374151', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>Daily Average</span>
                <Calendar size={16} style={{ color: '#3b82f6' }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>
                {data.summary?.avgDaily?.toFixed(1) || '0.0'}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                checkups per day
              </div>
            </div>

            <div style={{ background: '#374151', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>Peak Day</span>
                <Activity size={16} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>
                {data.data ? Math.max(...data.data.map(d => d.checkups)) : 0}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                highest single day
              </div>
            </div>
          </div>          {/* Chart */}
          <div style={{ background: '#374151', borderRadius: 8, padding: 20, width: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 16, margin: 0 }}>
              Checkup Trend - {currentPeriodLabel}
            </h3>
            <div style={{ width: '100%', height: 300, position: 'relative' }}>
              <CheckupLineChart 
                data={data.data || []} 
                height={300}
                color="#3b82f6"
                showGrid={true}
                showDots={true}
              />
            </div>          </div>

          {/* Recent Activity */}
          {data.data && data.data.length > 0 && (
            <div style={{ background: '#374151', borderRadius: 8, padding: 20, marginTop: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 16, margin: '0 0 16px 0' }}>
                Recent Daily Activity
              </h3>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {data.data.slice(-7).reverse().map((day, index) => {
                  const date = new Date(day.date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={day.date}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: index < 6 ? '1px solid #4b5563' : 'none'
                      }}
                    >
                      <div>
                        <span style={{ color: isToday ? '#3b82f6' : '#e5e7eb', fontWeight: isToday ? 600 : 400 }}>
                          {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        {isToday && (
                          <span style={{ 
                            marginLeft: 8, 
                            fontSize: 12, 
                            background: '#3b82f6', 
                            color: '#fff', 
                            padding: '2px 6px', 
                            borderRadius: 4 
                          }}>
                            Live
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        color: day.checkups > 0 ? '#10b981' : '#6b7280', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {day.checkups} checkup{day.checkups !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}        </>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CheckupDashboard;
