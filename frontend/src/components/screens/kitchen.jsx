import React, { useState, useEffect, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
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
import PrintBill from "./PrintBill";
import PrintPOSBill from "./PrintBill";
import { useReactToPrint } from "react-to-print";

const KitchenDashboard = () => {
  const [printBill, setPrintBill] = useState(false);
  const [printPOSBill, setPrintPOSBill] = useState(false);
  const [showPaymentNote, setShowPaymentNote] = useState(false);
  const [countryCOde, setCountryCode] = useState("+91");
  const [showPopup, setShowPopup] = useState(false);
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const navigate = useNavigate();
  const host = process.env.REACT_APP_HOST;
  const posBillRef = useRef();

  const handlePrintPOSBill = useReactToPrint({
    content: () => posBillRef.current,
    onAfterPrint: () => setPrintPOSBill(false),
    pageStyle: `
      @page { size: 80mm; margin: 0; }
      @media print { 
        body { width: 80mm; }
        html, body { margin: 0; padding: 0; }
      }
    `,
  });

  useEffect(() => {
    if (printPOSBill) {
      handlePrintPOSBill();
    }
  }, [printPOSBill, handlePrintPOSBill]);

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch((e) => console.error("Audio playback error:", e));
  };

  useEffect(() => {
    const socket = io(host);

    socket.on("newOrder", (newOrder) => {
      playNotificationSound();

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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${host}/api/kitchen/allOrders`, {
          credentials: "include",
        });
        const data = await response.json();
        console.log(data);
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
    console.log("tableOrders", tableOrders);
    return tableOrders.reduce(
      (total, order) => total + order.price ,
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

  const generateBill = (tableNo) => {
    const tableOrder = orders[tableNo];
    if (!tableOrder || tableOrder.length === 0) {
      return `No orders found for Table ${tableNo}.`;
    }
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let message = `🟢 *Baba Neeb Karori Restro & Cafe* 🟢\n`;
    message += `📍 Mehra Gaon, Bhimtal, Uttarakhand\n\n`;
    message += `🧾 *BILL RECEIPT* 🧾\n`;
    message += `📅 Date: ${dateStr}\n`;
    message += `⏰ Time: ${timeStr}\n`;
    message += `🪑 Table: ${tableNo}\n\n`;
    message += `--------------------------------\n`;
    message += `*Item*             Qty    Amount\n`;
    message += `--------------------------------\n`;
    
    let total = 0;
    tableOrder.forEach((order, index) => {
      const itemLineSum =  order.price;
      const itemName = (order.itemName.length > 15 ? 
                       order.itemName.substring(0, 12) + '...' : 
                       order.itemName).padEnd(15);
      const portion = order.portion ? `(${order.portion})` : '';
      
      message += `${index + 1}. ${itemName} ${order.quantity.toString().padStart(3)}    ₹${itemLineSum.toFixed(2)}\n`;
      total += itemLineSum;
    });
    
    const grandTotal = total
    
    message += `--------------------------------\n`;
    message += `Sub Total:        ₹${total.toFixed(2)}\n`;
    
    message += `*Grand Total:     ₹${grandTotal.toFixed(2)}*\n\n`;
    message += `💵 Payment Method: Cash/UPI\n\n`;
    message += `🙏 *Thank you for dining with us!*\n`;
    message += `We hope to serve you again soon.\n\n`;

    message += `📞 *Contact*: +91 9411336893\n`;
    message += `⏰ *Open*: 09AM - 11PM Daily\n\n`;
    message += `🌟 *Please share your feedback with us!* 🌟`;

    return message;
  };

  const handleSendBill = (selectedTable) => {
    const mobileNo = countryCOde + phone;
    const messageForBill = generateBill(selectedTable);
    const url = `https://wa.me/${mobileNo}?text=${encodeURIComponent(
      messageForBill
    )}`;
    window.open(url, "_blank");
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold text-primary">
          <i className="bi bi-graph-up me-2"></i>
          Kitchen Dashboard
        </h1>
        <NavLink to="/kitchen/items" className="btn btn-outline-primary">
          Items
        </NavLink>
      </div>

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
                      setSelectedTable(tableNumber);
                      setShowPopup(true);
                      setPhone("");
                    }}
                    title="send bill on whatsapp">
                    <FaWhatsapp size={18} style={{ color: "green" }} />
                  </button>
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
                  {printBill && <PrintBill data={orders[tableNumber]} />}

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
        <div className="payment-modal-overlay">
          <div className="payment-modal-container">
            <div className="payment-modal-header">
              <h2 className="payment-modal-title">Complete Payment</h2>
              <button
                className="payment-close-btn"
                onClick={() => {
                  setShowPayment(false);
                  setSelectedTable(null);
                }}
                aria-label="Close payment modal">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="payment-options">
              <button
                className="payment-option cash-option"
                onClick={() => {
                  setPrintPOSBill(true);
                  handleClearTable(selectedTable, "cash");
                  setShowPayment(false);
                }}>
                <div className="payment-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="payment-details">
                  <h3>Cash Payment</h3>
                  <p>Pay with physical currency</p>
                </div>
                <div className="payment-arrow">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              <div className="payment-divider">or</div>

              <button
                className="payment-option online-option"
                onClick={() => {
                  setPrintPOSBill(true);
                  handleClearTable(selectedTable, "online");
                  setShowPayment(false);
                }}>
                <div className="payment-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div className="payment-details">
                  <h3>Digital Payment</h3>
                  <p>UPI, Card, or Wallet</p>
                </div>
                <div className="payment-arrow">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp bill sending modal */}
      {showPopup && (
        <div className="whatsapp-modal-overlay">
          <div className="whatsapp-modal-card">
            <button
              className="close-button"
              onClick={() => setShowPopup(false)}
              aria-label="Close">
              &times;
            </button>

            <div className="modal-header">
              <FaWhatsapp size={24} style={{ color: "#25D366" }} />
              <h2 className="modal-title">Send Bill via WhatsApp</h2>
            </div>

            <div className="input-container">
              <div className="country-code-wrapper">
                <span className="country-flag">🇮🇳</span>
                <input
                  className="country-code-input"
                  type="text"
                  placeholder="+91"
                  value={countryCOde}
                  onChange={(e) => setCountryCode(e.target.value)}
                  maxLength="4"
                />
                <span className="input-divider"></span>
              </div>
              <input
                className="phone-number-input"
                type="tel"
                value={phone}
                placeholder="98765 43210"
                onChange={(e) => setPhone(e.target.value)}
                pattern="[0-9]{10}"
              />
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  handleSendBill(selectedTable);
                  setShowPopup(false);
                }}
                className="send-button"
                disabled={!phone}
                aria-label="Send Bill">
                <span>Send Bill</span>
                <FaWhatsapp size={18} style={{ marginLeft: "8px" }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden POS bill for printing */}
      {printPOSBill && selectedTable && (
        <div style={{ display: "none" }}>
          <PrintPOSBill 
            ref={posBillRef} 
            tableOrders={orders[selectedTable]} 
            tableNo={selectedTable} 
          />
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;