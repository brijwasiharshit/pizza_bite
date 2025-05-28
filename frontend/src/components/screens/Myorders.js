import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./myorders.css";

export default function MyOrders() {
  const host = process.env.REACT_APP_HOST;
  const [orders, setOrders] = useState([]);
 
  const { tableId } = useParams();

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${host}/api/user/tableOrders/${tableId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  console.log(orders)

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, [tableId]);

  const totalPrice = orders.reduce((acc, order) => acc + order.price, 0);

  return (
    <div className="orders-container">
      <h2 className="orders-title">📜 Table {tableId} Orders</h2>

      {orders.length === 0 ? (
        <p className="no-orders">😔 No orders placed yet for this table.</p>
      ) : (
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Items</th>
                <th>Quantity</th>
                <th>Portion</th>
                <th>Price (₹)</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id} className="order-row">
                  <td>{index + 1}</td>
                  <td>{order.itemName}</td>
                  <td>{order.quantity}</td>
                  <td>{order.portion}</td>
                  <td>₹{order.price}</td>
                  <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total-price" style={{ textAlign: "right", marginTop: "1rem", fontWeight: "bold", fontSize: "1.1rem" }}>
            Total: ₹{totalPrice}
          </div>
        </div>
      )}
    </div>
  );
}
