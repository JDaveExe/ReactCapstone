import React, { useState } from 'react';

const SimplePieChart = ({ data, width = 300, height = 300, title }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;

  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle += angle;

    return {
      ...item,
      pathData,
      percentage: percentage.toFixed(1),
      startAngle,
      endAngle,
      index
    };
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseEnter = (segment) => {
    setHoveredSegment(segment);
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg 
        width={width} 
        height={height}
        onMouseMove={handleMouseMove}
        style={{ cursor: 'pointer' }}
      >
        {segments.map((segment) => (
          <path
            key={segment.index}
            d={segment.pathData}
            fill={segment.color}
            stroke="#1e293b"
            strokeWidth="2"
            onMouseEnter={() => handleMouseEnter(segment)}
            onMouseLeave={handleMouseLeave}
            style={{
              opacity: hoveredSegment && hoveredSegment.index !== segment.index ? 0.6 : 1,
              transition: 'opacity 0.2s ease'
            }}
          />
        ))}
      </svg>
      
      {/* Tooltip */}
      {hoveredSegment && (
        <div
          style={{
            position: 'absolute',
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            background: '#1e293b',
            color: '#e5e7eb',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid #374151',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            maxWidth: '200px',
            wordWrap: 'break-word',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            {hoveredSegment.fullName}
          </div>
          <div>
            Units used: {hoveredSegment.value}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>
            {hoveredSegment.percentage}% of total
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div style={{ 
        marginTop: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px',
        maxHeight: '120px',
        overflowY: 'auto'
      }}>
        {segments.map((segment) => (
          <div
            key={segment.index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#e5e7eb'
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: segment.color,
                borderRadius: '2px',
                flexShrink: 0
              }}
            />
            <span style={{ 
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {segment.name}
            </span>
            <span style={{ 
              color: '#94a3b8',
              fontWeight: '500',
              flexShrink: 0
            }}>
              {segment.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimplePieChart;
