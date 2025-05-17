import React, { useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { FileText, Calendar, BarChart, PieChart, LineChart, Download, AlertCircle, BarChart2 } from 'lucide-react';
import "../styles/Reports.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  // States for filters
  const [reportType, setReportType] = useState("consultation");
  const [timeFrame, setTimeFrame] = useState("month");
  const [chartType, setChartType] = useState("bar");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Mock data for different report types
  const mockReportData = {
    consultation: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Consultations",
          data: [65, 59, 80, 81, 56, 72],
          backgroundColor: "#38bdf8",
          borderColor: "#0ea5e9",
          borderWidth: 1,
        },
      ],
    },
    diagnosis: {
      labels: [
        "Acute Gastroenteritis",
        "Hypertension",
        "Contraception",
        "Pregnancy",
        "Tuberculosis",
        "UTI",
      ],
      datasets: [
        {
          label: "Diagnoses",
          data: [30, 25, 15, 12, 10, 8],
          backgroundColor: [
            "#38bdf8", "#818cf8", "#a78bfa", "#f472b6", "#fb923c", "#facc15"
          ],
          borderWidth: 1,
        },
      ],
    },
    medication: {
      labels: [
        "Paracetamol",
        "Ferrous Sulfate",
        "Losartan",
        "Amlodipine",
        "Amoxicillin",
        "Metformin",
      ],
      datasets: [
        {
          label: "Medications Prescribed",
          data: [45, 37, 30, 25, 20, 15],
          backgroundColor: "#22c55e",
          borderColor: "#16a34a",
          borderWidth: 1,
        },
      ],
    },
    patientDemographics: {
      labels: ["0-10 yrs", "11-20 yrs", "21-30 yrs", "31-40 yrs", "41-50 yrs", "51-60 yrs", "61+ yrs"],
      datasets: [
        {
          label: "Patient Age Distribution",
          data: [15, 20, 25, 18, 12, 8, 5],
          backgroundColor: "#a78bfa",
          borderColor: "#8b5cf6",
          borderWidth: 1,
        },
      ],
    },
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: '#94a3b8', // Legend text color
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `${generatedReport ? generatedReport.type.charAt(0).toUpperCase() + generatedReport.type.slice(1).replace(/([A-Z])/g, ' $1') : 'Report'} - ${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}`, // Improved title
        color: '#e2e8f0', // Title text color
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8', // X-axis labels color
        },
        grid: {
          color: '#334155' // X-axis grid lines color
        }
      },
      y: {
        ticks: {
          color: '#94a3b8', // Y-axis labels color
        },
        grid: {
          color: '#334155' // Y-axis grid lines color
        }
      }
    }
  };

  // Generate report function
  const generateReport = () => {
    setIsGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setGeneratedReport({
        type: reportType,
        timeFrame: timeFrame,
        chartType: chartType,
        dateRange: dateRange,
        data: mockReportData[reportType],
      });
      setIsGenerating(false);
    }, 1500);
  };

  // Export report function
  const exportReport = () => {
    alert(`Exporting ${reportType} report as ${exportFormat.toUpperCase()}`);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", "#");
    downloadLink.setAttribute("download", `${reportType}_report.${exportFormat}`);
    downloadLink.click();
  };

  // Render correct chart type based on selection
  const renderChart = () => {
    if (!generatedReport) {
      return (
        <div className="no-report-message">
          <BarChart2 size={64} className="icon-muted" />
          <p>Select report options and click "Generate Report" to view data.</p>
        </div>
      );
    }

    const { data } = generatedReport;
    
    switch (chartType) {
      case "bar":
        return <Bar data={data} options={chartOptions} />;
      case "line":
        return <Line data={data} options={chartOptions} />;
      case "pie":
        return <Pie data={data} options={chartOptions} />;
      default:
        return <Bar data={data} options={chartOptions} />;
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="main-title">Generate & Export Reports</h1>
        <p className="subtitle">Generate custom reports and export them in various formats.</p>
      </div>

      <div className="reports-grid">
        <div className="report-options-card">
          <div className="card-header">
            <FileText size={20} className="header-icon" />
            <h3>Report Options</h3>
          </div>
          <div className="card-body">
            <form>
              <div className="form-group">
                <label htmlFor="reportType">Report Type</label>
                <select 
                  id="reportType" 
                  className="form-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="consultation">Consultation Trends</option>
                  <option value="diagnosis">Diagnosis Distribution</option>
                  <option value="medication">Medication Usage</option>
                  <option value="patientDemographics">Patient Demographics</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="timeFrame">Time Frame</label>
                <select 
                  id="timeFrame" 
                  className="form-select"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                  <option value="year">Yearly</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {timeFrame === 'custom' && (
                <div className="date-range-group">
                  <div className="form-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input 
                      type="date" 
                      id="startDate" 
                      className="form-control" 
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate">End Date</label>
                    <input 
                      type="date" 
                      id="endDate" 
                      className="form-control" 
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    />
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="chartType">Chart Type</label>
                <select 
                  id="chartType" 
                  className="form-select"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>

              <button 
                type="button" 
                className="btn generate-btn" 
                onClick={generateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart size={18} style={{ marginRight: '8px' }} /> Generate Report
                  </>
                )}
              </button>
              
              <hr className="divider" />

              <div className="form-group">
                <label htmlFor="exportFormat">Export Format</label>
                <select 
                  id="exportFormat" 
                  className="form-select"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  disabled={!generatedReport}
                >
                  <option value="pdf">PDF Document</option>
                  <option value="csv">CSV File</option>
                  <option value="png">PNG Image</option>
                </select>
              </div>

              <button 
                type="button" 
                className="btn export-btn" 
                onClick={exportReport}
                disabled={!generatedReport || isGenerating}
              >
                <Download size={18} style={{ marginRight: '8px' }} /> Export Report
              </button>
            </form>
          </div>
        </div>

        <div className="report-preview-card">
          <div className="card-header">
            {chartType === 'bar' && <BarChart size={20} className="header-icon" />}
            {chartType === 'line' && <LineChart size={20} className="header-icon" />}
            {chartType === 'pie' && <PieChart size={20} className="header-icon" />}
            {!generatedReport && chartType !=='bar' && chartType !=='line' && chartType !=='pie' && <BarChart2 size={20} className="header-icon" />}
            <h3>Report Preview</h3>
          </div>
          <div className="card-body chart-container">
            {isGenerating ? (
              <div className="loading-overlay">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Generating report, please wait...</p>
              </div>
            ) : renderChart()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;