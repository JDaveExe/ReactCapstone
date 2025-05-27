import React from 'react';

const CheckupLineChart = ({ data = [], height = 200, color = '#3b82f6', showGrid = true, showDots = true }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: 14
      }}>
        No checkup data available
      </div>
    );
  }
  const maxValue = Math.max(...data.map(d => d.checkups), 1);
  const minValue = Math.min(...data.map(d => d.checkups), 0);
  const range = maxValue - minValue || 1;
    // Set a more realistic width for the chart container
  const chartWidth = 600; // A larger value gives more horizontal space for the chart
  const chartHeight = height - 60; // leave space for labels
  const padding = 40; // We'll use this for label padding
  // Generate path for the line
  const generatePath = () => {
    if (data.length < 2) return '';
    
    return data.map((point, index) => {
      // Scale x position based on chart width
      const x = (index / (data.length - 1)) * chartWidth;
      // Calculate y position with padding for better visualization
      const y = chartHeight - ((point.checkups - minValue) / range) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  return (    <div style={{ height, position: 'relative', color: '#e5e7eb', width: '100%' }}>
      <svg 
        width="100%" 
        height={height}
        viewBox={`0 0 ${chartWidth} ${chartHeight + padding}`}
        style={{ overflow: 'visible', maxWidth: '100%', display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      >        {/* Grid lines */}
        {showGrid && (
          <g opacity="0.2">
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = chartHeight - (ratio * chartHeight) + 30;
              return (
                <line
                  key={`h-grid-${i}`}
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#374151"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Vertical grid lines - adjust spacing based on data length */}
            {data.map((_, i) => {
              const verticalLines = Math.min(10, data.length - 1);
              if (i % Math.ceil(data.length / verticalLines) === 0) {
                const x = (i / (data.length - 1)) * chartWidth;
                return (
                  <line
                    key={`v-grid-${i}`}
                    x1={x}
                    y1={30}
                    x2={x}
                    y2={chartHeight + 30}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                );
              }
              return null;
            })}
          </g>
        )}

        {/* Area fill */}
        <defs>
          <linearGradient id="checkupGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
          {data.length > 1 && (
          <path
            d={`${generatePath()} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
            fill="url(#checkupGradient)"
            transform="translate(0, 30)"
          />
        )}

        {/* Main line */}
        {data.length > 1 && (
          <path
            d={generatePath()}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 30)"
          />
        )}        {/* Data points */}
        {showDots && data.map((point, index) => {
          const x = (index / (data.length - 1)) * chartWidth;
          const y = chartHeight - ((point.checkups - minValue) / range) * chartHeight + 30;
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="5" // Slightly larger for better visibility
                fill={color}
                stroke="#fff"
                strokeWidth="2"
              />
              
              {/* Tooltip on hover */}
              <circle
                cx={x}
                cy={y}
                r="12"
                fill="transparent"
                style={{ cursor: 'pointer' }}
              >
                <title>{`${formatDate(point.date)}: ${point.checkups} checkups`}</title>
              </circle>
            </g>
          );
        })}        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = chartHeight - (ratio * chartHeight) + 30;
          const value = Math.round(minValue + (ratio * range));
          return (
            <text
              key={`y-label-${i}`}
              x={-10}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#94a3b8"
              fontWeight="500"
            >
              {value}
            </text>
          );
        })}

        {/* X-axis labels */}
        {data.map((point, index) => {
          // Show fewer x-axis labels on smaller screens, more on larger screens
          const labelsToShow = Math.min(8, Math.ceil(data.length / 4));
          
          if (index % Math.ceil(data.length / labelsToShow) === 0 || index === data.length - 1) {
            const x = (index / (data.length - 1)) * chartWidth;
            return (
              <text
                key={`x-label-${index}`}
                x={x}
                y={height - 5}
                textAnchor="middle"
                fontSize="11"
                fill="#94a3b8"
                fontWeight="500"
              >
                {formatDate(point.date)}
              </text>
            );
          }
          return null;
        })}
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        display: 'flex',
        alignItems: 'center',
        fontSize: 12,
        color: '#94a3b8'
      }}>
        <div 
          style={{
            width: 12,
            height: 3,
            backgroundColor: color,
            marginRight: 6,
            borderRadius: 2
          }}
        />
        Checkups per day
      </div>
    </div>
  );
};

export default CheckupLineChart;
