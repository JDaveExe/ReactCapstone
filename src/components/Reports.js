import React, { useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import "../styles/Reports.css";

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
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    diagnosis: {
      labels: [
        "ACUTE GASTROENTERITY",
        "HYPERTENSION",
        "CONTRACEPTION",
        "PREGNANCY",
        "TUBERCULOSIS",
        "UTI",
      ],
      datasets: [
        {
          label: "Diagnoses",
          data: [30, 25, 15, 12, 10, 8],
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
          borderWidth: 1,
        },
      ],
    },
    medication: {
      labels: [
        "PARACETAMOL",
        "FERROUS SULFATE",
        "LOSARTAN",
        "AMLODIPINE",
        "AMOXICILLIN",
        "METFORMIN",
      ],
      datasets: [
        {
          label: "Medications",
          data: [45, 37, 30, 25, 20, 15],
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    patientDemographics: {
      labels: ["0-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61+"],
      datasets: [
        {
          label: "Age Distribution",
          data: [15, 20, 25, 18, 12, 8, 5],
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          borderColor: "rgba(153, 102, 255, 1)",
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
      },
      title: {
        display: true,
        text: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      },
    },
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
    // This would be replaced with actual export functionality
    alert(`Exporting ${reportType} report as ${exportFormat.toUpperCase()}`);
    
    // In a real implementation, you would:
    // 1. Format the data appropriately for the export format
    // 2. Use libraries like jsPDF, xlsx, or API calls to generate the file
    // 3. Trigger download or send to server
    
    // Example:
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", "#");
    downloadLink.setAttribute("download", `${reportType}_report.${exportFormat}`);
    downloadLink.click();
  };

  // Render correct chart type based on selection
  const renderChart = () => {
    if (!generatedReport) return null;

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
        <h2>Generate & Export Reports</h2>
        <p className="text-muted">Generate custom reports and export them in various formats</p>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card report-filters">
            <div className="card-header">
              <h5>Report Options</h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="reportType" className="form-label">Report Type</label>
                  <select 
                    id="reportType" 
                    className="form-select" 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="consultation">Consultation Reports</option>
                    <option value="diagnosis">Diagnosis Distribution</option>
                    <option value="medication">Medication Usage</option>
                    <option value="patientDemographics">Patient Demographics</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="timeFrame" className="form-label">Time Frame</label>
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
                
                {timeFrame === "custom" && (
                  <div className="mb-3">
                    <div className="row">
                      <div className="col-6">
                        <label htmlFor="startDate" className="form-label">Start Date</label>
                        <input 
                          type="date" 
                          id="startDate" 
                          className="form-control"
                          value={dateRange.startDate}
                          onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                        />
                      </div>
                      <div className="col-6">
                        <label htmlFor="endDate" className="form-label">End Date</label>
                        <input 
                          type="date" 
                          id="endDate" 
                          className="form-control"
                          value={dateRange.endDate}
                          onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <label htmlFor="chartType" className="form-label">Chart Type</label>
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
                  className="btn btn-primary w-100 mb-3"
                  onClick={generateReport}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : "Generate Report"}
                </button>
                
                <hr className="my-4" />
                
                <div className="mb-3">
                  <label htmlFor="exportFormat" className="form-label">Export Format</label>
                  <select 
                    id="exportFormat" 
                    className="form-select"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="xlsx">Excel Spreadsheet</option>
                    <option value="csv">CSV File</option>
                    <option value="png">PNG Image</option>
                  </select>
                </div>
                
                <button 
                  type="button" 
                  className="btn btn-success w-100"
                  onClick={exportReport}
                  disabled={!generatedReport}
                >
                  <i className="bi bi-download me-2"></i>
                  Export Report
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card chart-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>
                {generatedReport 
                  ? `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report` 
                  : "Report Preview"}
              </h5>
              {generatedReport && (
                <div className="report-meta text-muted">
                  <small>
                    {timeFrame === "custom" 
                      ? `${dateRange.startDate} - ${dateRange.endDate}` 
                      : `${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}ly`}
                  </small>
                </div>
              )}
            </div>
            <div className="card-body chart-container">
              {generatedReport ? (
                renderChart()
              ) : (
                <div className="no-report-message">
                  <i className="bi bi-bar-chart-line-fill"></i>
                  <p>Select report options and click "Generate Report" to view data</p>
                </div>
              )}
            </div>
          </div>
          
          {generatedReport && (
            <div className="card mt-4">
              <div className="card-header">
                <h5>Report Summary</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="summary-item">
                      <h6>Total Records</h6>
                      <p className="summary-value">
                        {generatedReport.data.datasets[0].data.reduce((a, b) => a + b, 0)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="summary-item">
                      <h6>Average Value</h6>
                      <p className="summary-value">
                        {(generatedReport.data.datasets[0].data.reduce((a, b) => a + b, 0) / 
                          generatedReport.data.datasets[0].data.length).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="summary-item">
                      <h6>Highest Value</h6>
                      <p className="summary-value">
                        {Math.max(...generatedReport.data.datasets[0].data)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="summary-item">
                      <h6>Lowest Value</h6>
                      <p className="summary-value">
                        {Math.min(...generatedReport.data.datasets[0].data)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;