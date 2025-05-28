import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  CookingPot,
  Utensils,
  Trash2,
} from "lucide-react";
import "./kitchen.css";
import io from "socket.io-client";

const KitchenDashboard = () => {
  const [orders, setOrders] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const navigate = useNavigate();
  const host = process.env.REACT_APP_HOST;

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch((e) => console.error("Audio playback error:", e));
  };

  // Socket connection for real-time updates
  useEffect(() => {
    const socket = io(host);

    socket.on("newOrder", (newOrder) => {
      const audio = new Audio("/notification.mp3");
      audio.play().catch((e) => console.error("Audio playback error:", e));

      setOrders((prevOrders) => {
        const updatedOrders = { ...prevOrders };
        const tableNo = newOrder.tableNo;

        if (!updatedOrders[tableNo]) {
          updatedOrders[tableNo] = [];
        }

        updatedOrders[tableNo].push(newOrder);
        return updatedOrders;
      });

      const notificationId = Date.now();
      setNotifications((prev) => [
        ...prev,
        {
          message: `New order placed at Table ${newOrder.tableNo}`,
          id: notificationId,
        },
      ]);

      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
      }, 3000);
    });

    return () => socket.disconnect();
  }, [host]);

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${host}/api/kitchen/allOrders`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [host]);

  const toggleTableExpanded = (tableNumber) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableNumber]: !prev[tableNumber],
    }));
  };

  const handleClearTable = async (tableNumber, method) => {
    const notificationId = Date.now();

    try {
      const response = await fetch(
        `${host}/api/kitchen/clearTable/${tableNumber}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payment: method }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrders((prevOrders) => {
          const newOrders = { ...prevOrders };
          delete newOrders[tableNumber];
          return newOrders;
        });

        setNotifications((prev) => [
          ...prev,
          {
            message: `Great done! Table ${tableNumber} cleared successfully`,
            id: notificationId,
            type: "success",
          },
        ]);
      } else {
        setNotifications((prev) => [
          ...prev,
          {
            message: `Failed to clear Table ${tableNumber}: ${data.error}`,
            id: notificationId,
            type: "error",
          },
        ]);
      }
    } catch (err) {
      console.error("Error clearing table:", err);
      setNotifications((prev) => [
        ...prev,
        {
          message: `Error clearing Table ${tableNumber}`,
          id: notificationId,
          type: "error",
        },
      ]);
    }

    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    }, 3000);
  };

  const handleDeleteOrder = async (tableNo, orderId) => {
    try {
      const response = await fetch(
        `${host}/api/kitchen/cancelOrder/${tableNo}/${orderId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setOrders((prevOrders) => {
          const updatedOrders = { ...prevOrders };
          updatedOrders[tableNo] = updatedOrders[tableNo].filter(
            (order) => order._id !== orderId
          );
          return updatedOrders;
        });
      }
    } catch (err) {
      console.error("Delete order error:", err);
    }
  };

  const calculateTableTotal = (tableOrders) => {
    return tableOrders.reduce(
      (total, order) => total + order.price * order.quantity,
      0
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "created":
        return <Clock size={16} className="text-yellow-500" />;
      case "preparing":
        return <CookingPot size={16} className="text-orange-500" />;
      case "ready":
        return <Check size={16} className="text-green-500" />;
      case "served":
        return <Utensils size={16} className="text-blue-500" />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="kitchen-container">
      <div className="notifications">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notification ${notif.type || ""}`}>
            <span>{notif.message}</span>
          </div>
        ))}
      </div>

      <header className="kitchen-header">
        <h1>Kitchen Dashboard</h1>
      </header>

      <div className="tables-grid">
        {Object.keys(orders)
          .sort((a, b) => a - b)
          .map((tableNumber) => (
            <div key={tableNumber} className="table-card">
              <div
                className="table-header"
                onClick={() => toggleTableExpanded(tableNumber)}>
                <div className="table-info">
                  <span className="table-number">Table {tableNumber}</span>
                  <span className="order-count">
                    {orders[tableNumber].length}{" "}
                    {orders[tableNumber].length === 1 ? "order" : "orders"}
                  </span>
                </div>

                <div className="table-actions">
                  <button
                    className="clear-table-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTable(tableNumber);
                      setShowPayment(true);
                    }}
                    title="Mark Table as Cleared">
                    <Check size={18} style={{ color: "green" }} />
                  </button>

                  {expandedTables[tableNumber] ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {expandedTables[tableNumber] && (
                <div className="orders-list">
                  {orders[tableNumber].length === 0 ? (
                    <div className="empty-orders">No active orders</div>
                  ) : (
                    orders[tableNumber].map((order) => (
                      <div key={order._id} className="order-item">
                        <div className="order-header">
                          <span className="order-time">
                            {formatTime(order.createdAt)}
                          </span>
                          <div className="order-status">
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </div>
                        <div className="order-details">
                          <div className="item-name">
                            {order.itemName} ({order.portion})
                          </div>
                          <div className="item-quantity">×{order.quantity}</div>
                          <div className="item-price">₹{order.price}</div>
                        </div>

                        <div className="order-actions">
                          <button
                            className="delete-order-btn"
                            onClick={() =>
                              handleDeleteOrder(tableNumber, order._id)
                            }
                            title="Delete Order">
                            <Trash2 size={16} color="red" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="table-total">
                Total: ₹{calculateTableTotal(orders[tableNumber])}
              </div>
            </div>
          ))}
      </div>

      {/* Payment modal */}
      {showPayment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}>
          <div
            style={{
              backgroundColor: "#FFFDD0",
              padding: "30px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              position: "relative",
              width: "300px",
              textAlign: "center",
            }}>
            <h2 style={{ marginBottom: "20px" }}>Choose Payment Method</h2>

            <button
              onClick={() => {
                handleClearTable(selectedTable, "cash");
                setShowPayment(false);
              }}
              style={{
                padding: "10px 15px",
                margin: "10px",
                fontSize: "14px",
                cursor: "pointer",
                border: "none",
                borderRadius: "5px",
                backgroundColor: "orange",
                color: "white",
              }}>
              Pay by Cash
            </button>

            <button
              onClick={() => {
                handleClearTable(selectedTable, "online");
                setShowPayment(false);
              }}
              style={{
                padding: "10px 15px",
                margin: "10px",
                fontSize: "14px",
                cursor: "pointer",
                border: "none",
                borderRadius: "5px",
                backgroundColor: "orange",
                color: "white",
              }}>
              Pay Online
            </button>

            <button
              onClick={() => {
                setShowPayment(false);
                setSelectedTable(null);
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                border: "none",
                background: "transparent",
                fontSize: "18px",
                cursor: "pointer",
              }}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;
