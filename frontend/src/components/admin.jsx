import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import "./screens/admins.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const navigate = useNavigate();
  const host = process.env.REACT_APP_HOST;
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [error, setError] = useState(null);

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

  const chartData = {
    labels: salesData?.dates || [],
    datasets: [
      {
        label: "Daily Sales (₹)",
        data: salesData?.dailySales || [],
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid analytics-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold text-primary">
          <i className="bi bi-graph-up me-2"></i>
          Sales Dashboard
        </h1>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6>Today's Sales</h6>
                <span className="text-sm">Cash</span>
                <h3 className="text-success">₹{salesData.todaySalesInCash}</h3>
                <span className="text-sm">Online</span>
                <h3 className="text-primary">
                  ₹{salesData.todaySalesInOnline}
                </h3>
              </div>
              <div className="icon-wrapper icon-primary">
                <i className="bi bi-currency-rupee fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6>Weekly Sales</h6>
                <span className="text-sm">Cash</span>
                <h3 className="text-success">
                  ₹{salesData.weekelySalesInCash}
                </h3>
                <span className="text-sm">Online</span>
                <h3 className="text-primary">
                  ₹{salesData.weekelySalesInOnline}
                </h3>
              </div>
              <div className="icon-wrapper icon-success">
                <i className="bi bi-calendar-week fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6>Monthly Sales By Cash</h6>
                <h3>₹{(salesData?.monthlySales || 0).toLocaleString()}</h3>
              </div>
              <div className="icon-wrapper icon-success">
                <i className="bi bi-calendar-week fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6>Monthly Sales By Online</h6>
                <h3>
                  ₹{(salesData?.monthlySalesOnline || 0).toLocaleString()}
                </h3>
              </div>
              <div className="icon-wrapper icon-success">
                <i className="bi bi-calendar-week fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">7-Day Sales Trend</h5>
              <div className="chart-container">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: {
                        mode: "index",
                        intersect: false,
                        callbacks: {
                          label: function (context) {
                            return `₹${context.raw.toLocaleString()}`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        grid: { drawBorder: false },
                        ticks: {
                          callback: function (value) {
                            return `₹${value.toLocaleString()}`;
                          },
                        },
                      },
                      x: {
                        grid: { display: false },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
