import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const navigate = useNavigate();
  const host = process.env.REACT_APP_HOST;
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("week"); // 'day', 'week', or 'month'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          salesTodayRes,
          weeklySales,
          totalMonthlySales,
          totalMonthlySalesOnline,
        ] = await Promise.all([
          axios.get(`${host}/api/admin/salesToday`, { withCredentials: true }),
          axios.get(`${host}/api/admin/weeklySales`, { withCredentials: true }),
          axios.get(`${host}/api/admin/monthlySales`, {
            withCredentials: true,
          }),
          axios.get(`${host}/api/admin/monthlySalesOnline`, {
            withCredentials: true,
          }),
        ]);

        const weekelySalesInCash = weeklySales.data.weekelySalesInCash;
        const weekelySalesInOnline = weeklySales.data.weekelySalesInOnline;
        const monthlySales = totalMonthlySales.data.totalSalesMonthly;
        const monthlySalesOnline =
          totalMonthlySalesOnline.data.totalSalesMonthlyonline;

        setSalesData({
          weekelySalesInCash,
          weekelySalesInOnline,
          monthlySales,
          monthlySalesOnline,
          todaySalesInCash: salesTodayRes.data.totalSalesTodayInCash,
          todaySalesInOnline: salesTodayRes.data.totalSalesTodayInOnline,
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, host]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading Dashboard...</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-3 bg-light" style={{minHeight: '100vh'}}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pt-3">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">
            <i className="bi bi-graph-up me-2"></i>
            Sales Analytics
          </h1>
          <p className="text-muted small mb-0">Track and analyze your sales performance</p>
        </div>
    
      </div>

      {/* Summary Cards */}
      <div className="row g-4">
        {/* Today's Sales */}
        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-uppercase text-muted mb-3 fw-bold small">Today's Sales</h6>
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge bg-success bg-opacity-10 text-success p-2 me-2">
                      <i className="bi bi-cash-coin"></i>
                    </span>
                    <div>
                      <p className="text-muted small mb-0">Cash</p>
                      <h4 className="mb-0 text-success">{formatCurrency(salesData.todaySalesInCash)}</h4>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary p-2 me-2">
                      <i className="bi bi-credit-card"></i>
                    </span>
                    <div>
                      <p className="text-muted small mb-0">Online</p>
                      <h4 className="mb-0 text-primary">{formatCurrency(salesData.todaySalesInOnline)}</h4>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-top">
                    <p className="text-muted small mb-1">Total Sales</p>
                    <h3 className="mb-0">
                      {formatCurrency(salesData.todaySalesInCash + salesData.todaySalesInOnline)}
                    </h3>
                  </div>
                </div>
                <div className="icon-shape bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                  <i className="bi bi-currency-rupee fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Sales */}
        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-uppercase text-muted mb-3 fw-bold small">Weekly Sales</h6>
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge bg-success bg-opacity-10 text-success p-2 me-2">
                      <i className="bi bi-cash-coin"></i>
                    </span>
                    <div>
                      <p className="text-muted small mb-0">Cash</p>
                      <h4 className="mb-0 text-success">{formatCurrency(salesData.weekelySalesInCash)}</h4>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary p-2 me-2">
                      <i className="bi bi-credit-card"></i>
                    </span>
                    <div>
                      <p className="text-muted small mb-0">Online</p>
                      <h4 className="mb-0 text-primary">{formatCurrency(salesData.weekelySalesInOnline)}</h4>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-top">
                    <p className="text-muted small mb-1">Total Sales</p>
                    <h3 className="mb-0">
                      {formatCurrency(salesData.weekelySalesInCash + salesData.weekelySalesInOnline)}
                    </h3>
                  </div>
                </div>
                <div className="icon-shape bg-success bg-opacity-10 text-success rounded-3 p-3">
                  <i className="bi bi-calendar-week fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-uppercase text-muted mb-3 fw-bold small">Monthly Sales</h6>
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge bg-success bg-opacity-10 text-success p-2 me-2">
                      <i className="bi bi-cash-coin"></i>
                    </span>
                    <div>
                      <p className="text-muted small mb-0">Cash</p>
                      <h4 className="mb-0 text-success">{formatCurrency(salesData.monthlySales)}</h4>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary p-2 me-2">
                      <i className="bi bi-credit-card"></i>
                    </span>
                    <div>
                      <p className="text-muted small mb-0">Online</p>
                      <h4 className="mb-0 text-primary">{formatCurrency(salesData.monthlySalesOnline)}</h4>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-top">
                    <p className="text-muted small mb-1">Total Sales</p>
                    <h3 className="mb-0">
                      {formatCurrency(salesData.monthlySales + salesData.monthlySalesOnline)}
                    </h3>
                  </div>
                </div>
                <div className="icon-shape bg-warning bg-opacity-10 text-warning rounded-3 p-3">
                  <i className="bi bi-calendar-month fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Card - Full width since chart is removed */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-3 pb-2">
              <h5 className="mb-0 fw-bold">Payment Methods Summary</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-4 mb-md-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="badge bg-success bg-opacity-10 text-success p-2 me-3">
                        <i className="bi bi-cash-coin"></i>
                      </span>
                      <div>
                        <h6 className="mb-1">Cash Payments</h6>
                        <span className="text-muted small">This month</span>
                      </div>
                    </div>
                    <h4 className="text-success">{formatCurrency(salesData.monthlySales)}</h4>
                  </div>
                </div>
                
                <div className="col-md-4 mb-4 mb-md-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="badge bg-primary bg-opacity-10 text-primary p-2 me-3">
                        <i className="bi bi-credit-card"></i>
                      </span>
                      <div>
                        <h6 className="mb-1">Online Payments</h6>
                        <span className="text-muted small">This month</span>
                      </div>
                    </div>
                    <h4 className="text-primary">{formatCurrency(salesData.monthlySalesOnline)}</h4>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Total Revenue</h6>
                      <span className="text-muted small">This month</span>
                    </div>
                    <h3 className="text-dark">
                      {formatCurrency(salesData.monthlySales + salesData.monthlySalesOnline)}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Cash: {Math.round((salesData.monthlySales / (salesData.monthlySales + salesData.monthlySalesOnline)) * 100)}%</span>
                  <span className="text-muted small">Online: {Math.round((salesData.monthlySalesOnline / (salesData.monthlySales + salesData.monthlySalesOnline)) * 100)}%</span>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ 
                      width: `${(salesData.monthlySales / (salesData.monthlySales + salesData.monthlySalesOnline)) * 100}%` 
                    }} 
                  ></div>
                  <div 
                    className="progress-bar bg-primary" 
                    role="progressbar" 
                    style={{ 
                      width: `${(salesData.monthlySalesOnline / (salesData.monthlySales + salesData.monthlySalesOnline)) * 100}%` 
                    }} 
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;