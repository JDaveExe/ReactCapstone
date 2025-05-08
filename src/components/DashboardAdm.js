import React, { useState } from "react";
import "../styles/DashboardAdm.css";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardAdm = () => {
  // State for tracking which chart is zoomed, null means no chart is zoomed
  const [zoomedChart, setZoomedChart] = useState(null);
  // State to track fold/unfold state of charts
  const [foldedCharts, setFoldedCharts] = useState({});

  // Handle zoom for specific chart
  const handleZoom = (chartId) => {
    setZoomedChart(zoomedChart === chartId ? null : chartId);
  };

  // Handle fold/unfold for specific chart
  const handleFoldToggle = (chartId) => {
    setFoldedCharts({
      ...foldedCharts,
      [chartId]: !foldedCharts[chartId]
    });
  };

  // Mock data for organization diagnoses pie chart
  const orgDiagnosisData = {
    labels: [
      'ACUTE GASTROENTERITY INFECTION',
      'HYPERTENSION',
      'CONTRACEPTION',
      'ESSENTIAL PREGNANCY',
      'PTB PULMONARY TUBERCULOSIS',
      'URINARY TRACT INFECTION'
    ],
    datasets: [
      {
        data: [30, 25, 15, 12, 10, 8],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for diagnostic test pie chart
  const diagnosticTestData = {
    labels: [
      'URINALYSIS(UTEST)',
      'HEMATOLOGY(MICROSCOPY)',
      'COMPLETE BLOOD COUNT',
      'CLINICAL BLOOD CHEMISTRY',
      'HEMATINIC PANEL',
      'OTHER BLOOD CHEMISTRY'
    ],
    datasets: [
      {
        data: [35, 20, 15, 12, 10, 8],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for laboratory test pie chart
  const laboratoryTestData = {
    labels: [
      'LEADING 200 MCG/ML',
      'FERROUS SULFATE',
      'PARACETAMOL 500 MG',
      'LOSARTAN POTASSIUM',
      'AMLODIPINE',
      'AMOXICILLIN + CLAVULANIC ACID'
    ],
    datasets: [
      {
        data: [25, 22, 18, 15, 12, 8],
        backgroundColor: [
          '#4BC0C0',
          '#FF6384',
          '#FFCE56',
          '#36A2EB',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data for consultations
  const consultationData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Consultations',
        data: [65, 59, 80, 81, 56, 72],
        backgroundColor: '#36A2EB',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        enabled: true
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Function to render chart with zoom and fold functionality
  const renderChart = (chartId, chartType, chartData, chartOptions, title, subtitle, footer) => {
    const isFolded = foldedCharts[chartId];
    const isZoomed = zoomedChart === chartId;
    
    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">{title}</h5>
            <small className="text-muted">{subtitle}</small>
          </div>
          <div className="chart-controls">
            {/* Zoom button */}
            <button 
              className="btn btn-sm btn-outline-primary zoom-btn me-2"
              onClick={() => handleZoom(chartId)}
              title="Zoom"
            >
              <i className="bi bi-zoom-in"></i>
            </button>
            
            {/* Fold/Unfold button */}
            <button 
              className="btn btn-sm btn-outline-secondary fold-btn"
              onClick={() => handleFoldToggle(chartId)}
              title={isFolded ? "Expand" : "Collapse"}
            >
              <i className={`bi ${isFolded ? 'bi-arrows-angle-expand' : 'bi-arrows-angle-contract'}`}></i>
            </button>
          </div>
        </div>
        
        {!isFolded && (
          <div className="card-body">
            <div className={`chart-container ${isZoomed ? 'd-none' : ''}`}>
              {chartType === 'pie' && <Pie data={chartData} options={chartOptions} />}
              {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
            </div>
          </div>
        )}
        
        <div className="card-footer text-center">
          <small>{footer}</small>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-admin">
      {/* Zoom Modal for any chart when zoomed */}
      {zoomedChart && (
        <div className="zoom-modal-overlay">
          <div className="zoom-modal">
            <div className="zoom-modal-header">
              <h5>Expanded View</h5>
              <button 
                className="btn btn-sm btn-outline-secondary close-zoom-btn"
                onClick={() => setZoomedChart(null)}
              >
                <i className="bi bi-x-lg"></i> Close
              </button>
            </div>
            <div className="zoom-modal-body">
              <div className="zoomed-chart-container">
                {zoomedChart === 'diagnosticTest' && <Pie data={diagnosticTestData} options={chartOptions} />}
                {zoomedChart === 'orgDiagnosis' && <Pie data={orgDiagnosisData} options={chartOptions} />}
                {zoomedChart === 'consultations' && <Bar data={consultationData} options={barOptions} />}
                {zoomedChart === 'laboratoryTest' && <Pie data={laboratoryTestData} options={chartOptions} />}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid p-4">
        <h2 className="mb-4 dashboard-title">Statistics</h2>
        
        <div className="row">
          <div className="col-md-6 col-xl-3 mb-4">
            <div className="card stat-card">
              <div className="card-body">
                <h5 className="card-title">MTD</h5>
                <p className="stat-label">Consultations to Date</p>
                <h2 className="stat-value">487</h2>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-xl-3 mb-4">
            <div className="card stat-card">
              <div className="card-body">
                <h5 className="card-title">YTD</h5>
                <p className="stat-label">Consultations to Date</p>
                <h2 className="stat-value">3,852</h2>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-xl-3 mb-4">
            <div className="card stat-card">
              <div className="card-body">
                <h5 className="card-title">Total</h5>
                <p className="stat-label">Consultations to Date</p>
                <h2 className="stat-value">12,487</h2>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-xl-3 mb-4">
            <div className="card stat-card">
              <div className="card-body">
                <h5 className="card-title">Active</h5>
                <p className="stat-label">Patient Records</p>
                <h2 className="stat-value">5,248</h2>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-4">
            {renderChart(
              'diagnosticTest',
              'pie',
              diagnosticTestData,
              chartOptions,
              'MTD',
              '10 Diagnoses Test (Month to Date)',
              'Top 10 Diagnostic Tests'
            )}
          </div>
          
          <div className="col-md-6 mb-4">
            {renderChart(
              'orgDiagnosis',
              'pie',
              orgDiagnosisData,
              chartOptions,
              'YTD',
              '10 Diagnoses Test (Year to Date)',
              'Top 10 Diagnoses'
            )}
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-4">
            {renderChart(
              'consultations',
              'bar',
              consultationData,
              barOptions,
              'MTD',
              'Monthly Consultations (Month to Date)',
              'Monthly Consultations'
            )}
          </div>
          
          <div className="col-md-6 mb-4">
            {renderChart(
              'laboratoryTest',
              'pie',
              laboratoryTestData,
              chartOptions,
              'YTD',
              'Top Medicine Released/Given (Year to Date)',
              'Top Medicine Released/Given'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdm;