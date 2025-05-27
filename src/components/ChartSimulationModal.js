import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useCheckupAnalytics } from '../contexts/CheckupAnalyticsContext';

const ChartSimulationModal = ({ show, onHide }) => {
  const { resetTestCheckups, setTestCheckups, lastUpdate, setLastUpdate } = useCheckupAnalytics();
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState(null);
  const [simulationConfig, setSimulationConfig] = useState({
    days: 30,
    pattern: 'random',
    minValue: 0,
    maxValue: 20,
    trend: 'upward',
    variance: 'medium'
  });

  // Handle input changes
  const handleConfigChange = (e) => {
    const { name, value, type } = e.target;
    setSimulationConfig({
      ...simulationConfig,
      [name]: type === 'number' ? Number(value) : value
    });
  };
  // Function to generate test data based on configuration
  const generateTestData = async () => {
    setSimulationLoading(true);
    setSimulationSuccess(null);
    
    try {
      // First, reset existing test data - this returns the reset map
      const resetMap = await resetTestCheckups();
      
      // Create a new map based on the reset map to ensure we have a valid Map structure
      const today = new Date();
      const testData = new Map(resetMap);
        // Generate data for the specified number of days
      for (let i = simulationConfig.days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        let value = 0;
        
        switch(simulationConfig.pattern) {
          case 'random':
            // Random values between min and max
            value = Math.floor(Math.random() * 
              (simulationConfig.maxValue - simulationConfig.minValue + 1)) + 
              simulationConfig.minValue;
            break;
            
          case 'trend':
            // Create a trend pattern
            const progress = i / simulationConfig.days; // 0 to 1
            const range = simulationConfig.maxValue - simulationConfig.minValue;
            
            if (simulationConfig.trend === 'upward') {
              // Upward trend (more recent days have higher values)
              value = Math.floor(simulationConfig.minValue + (range * (1 - progress)));
            } else {
              // Downward trend
              value = Math.floor(simulationConfig.minValue + (range * progress));
            }
            
            // Add variance
            let varianceFactor;
            switch(simulationConfig.variance) {
              case 'low': varianceFactor = 0.1; break;
              case 'high': varianceFactor = 0.3; break;
              default: varianceFactor = 0.2; // medium
            }
            
            const variance = range * varianceFactor;
            value += Math.floor(Math.random() * variance) - (variance / 2);
            
            // Ensure within bounds
            value = Math.max(simulationConfig.minValue, 
                     Math.min(simulationConfig.maxValue, value));
            break;
            
          case 'cyclic':
            // Create a cyclic pattern (e.g., weekends higher than weekdays)
            const dayOfWeek = date.getDay();
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            const baseValue = simulationConfig.minValue + 
                            ((simulationConfig.maxValue - simulationConfig.minValue) / 2);
            
            if (isWeekend) {
              value = baseValue + (baseValue * 0.5); // 50% more on weekends
            } else {
              value = baseValue - (baseValue * 0.2); // 20% less on weekdays
            }
            
            // Add small random variation
            value += Math.floor(Math.random() * 5) - 2; // -2 to +2
            
            // Ensure within bounds
            value = Math.max(simulationConfig.minValue, 
                     Math.min(simulationConfig.maxValue, Math.floor(value)));
            break;
            
          default:
            value = simulationConfig.minValue;
        }
        
        testData.set(dateStr, value);
      }
      
      // Update the test checkups using the context's state setter
      // This will trigger the useEffect that updates localStorage
      setTestCheckups(testData);
        // Update lastUpdate to trigger chart refresh without page reload
      setLastUpdate(Date.now());
      
      setSimulationSuccess({
        status: 'success',
        message: 'Chart simulation data generated successfully!',
        details: `Created ${simulationConfig.days} days of ${simulationConfig.pattern} data with values from ${simulationConfig.minValue} to ${simulationConfig.maxValue}.`
      });
      
    } catch (error) {
      console.error('Error generating test data:', error);
      
      setSimulationSuccess({
        status: 'error',
        message: 'Failed to generate simulation data',
        details: error.message
      });
    } finally {
      setSimulationLoading(false);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={() => !simulationLoading && onHide()}
      backdrop="static"
      centered
      className="dark-modal"
    >
      <Modal.Header closeButton={!simulationLoading} style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <Modal.Title style={{ color: '#e5e7eb' }}>
          <i className="bi bi-graph-up me-2"></i>
          Chart Simulation Configuration
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: '#1e293b', color: '#e5e7eb' }}>
        {simulationSuccess ? (
          <Alert variant={simulationSuccess.status === 'success' ? 'success' : 'danger'} className="d-flex align-items-center">
            <i className={`bi me-2 fs-4 ${simulationSuccess.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <div>
              <strong>{simulationSuccess.message}</strong>
              <p className="mb-0 mt-1">{simulationSuccess.details}</p>
            </div>
          </Alert>
        ) : (
          <>
            <Alert variant="info" className="d-flex align-items-center">
              <i className="bi bi-info-circle-fill me-2 fs-4"></i>
              <div>
                <strong>Chart Simulation</strong>
                <p className="mb-0 mt-1">Generate test data for analytics charts. This will replace existing test data but won't affect actual checkup records.</p>
              </div>
            </Alert>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#38bdf8' }}>Time Range</Form.Label>
                <Form.Control
                  type="number"
                  name="days"
                  value={simulationConfig.days}
                  onChange={handleConfigChange}
                  min={7}
                  max={90}
                  style={{ 
                    background: '#0f172a',
                    color: '#e5e7eb',
                    borderColor: '#334155'
                  }}
                />
                <Form.Text style={{ color: '#94a3b8' }}>
                  Number of days to simulate (7-90)
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#38bdf8' }}>Data Pattern</Form.Label>
                <Form.Select
                  name="pattern"
                  value={simulationConfig.pattern}
                  onChange={handleConfigChange}
                  style={{ 
                    background: '#0f172a',
                    color: '#e5e7eb',
                    borderColor: '#334155'
                  }}
                >
                  <option value="random">Random</option>
                  <option value="trend">Trend</option>
                  <option value="cyclic">Cyclic (weekday/weekend)</option>
                </Form.Select>
              </Form.Group>

              {simulationConfig.pattern === 'trend' && (
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#38bdf8' }}>Trend Direction</Form.Label>
                  <Form.Select
                    name="trend"
                    value={simulationConfig.trend}
                    onChange={handleConfigChange}
                    style={{ 
                      background: '#0f172a',
                      color: '#e5e7eb',
                      borderColor: '#334155'
                    }}
                  >
                    <option value="upward">Upward (Increasing)</option>
                    <option value="downward">Downward (Decreasing)</option>
                  </Form.Select>
                </Form.Group>
              )}

              {simulationConfig.pattern !== 'random' && (
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#38bdf8' }}>Variance</Form.Label>
                  <Form.Select
                    name="variance"
                    value={simulationConfig.variance}
                    onChange={handleConfigChange}
                    style={{ 
                      background: '#0f172a',
                      color: '#e5e7eb',
                      borderColor: '#334155'
                    }}
                  >
                    <option value="low">Low (Smoother)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (More Variation)</option>
                  </Form.Select>
                </Form.Group>
              )}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#38bdf8' }}>Minimum Value</Form.Label>
                    <Form.Control
                      type="number"
                      name="minValue"
                      value={simulationConfig.minValue}
                      onChange={handleConfigChange}
                      min={0}
                      max={100}
                      style={{ 
                        background: '#0f172a',
                        color: '#e5e7eb',
                        borderColor: '#334155'
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#38bdf8' }}>Maximum Value</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxValue"
                      value={simulationConfig.maxValue}
                      onChange={handleConfigChange}
                      min={1}
                      max={100}
                      style={{ 
                        background: '#0f172a',
                        color: '#e5e7eb',
                        borderColor: '#334155'
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </>
        )}
      </Modal.Body>
      <Modal.Footer style={{ background: '#1e293b', borderTop: '1px solid #334155' }}>
        {!simulationSuccess && (
          <>
            <Button 
              variant="secondary" 
              onClick={onHide}
              disabled={simulationLoading}
              style={{ background: '#475569', borderColor: '#475569' }}
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={generateTestData}
              disabled={simulationLoading || 
                simulationConfig.minValue >= simulationConfig.maxValue}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              {simulationLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Generating Data...
                </>
              ) : (
                <>
                  <i className="bi bi-magic me-1"></i>
                  Generate Simulation Data
                </>
              )}
            </Button>
          </>
        )}
        {simulationSuccess && simulationSuccess.status === 'success' && (
          <Button 
            variant="success" 
            onClick={onHide}
          >
            Close
          </Button>
        )}
        {simulationSuccess && simulationSuccess.status === 'error' && (
          <>
            <Button 
              variant="secondary" 
              onClick={onHide}
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={generateTestData}
            >
              Try Again
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ChartSimulationModal;
