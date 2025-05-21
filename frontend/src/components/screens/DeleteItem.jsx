import React, { useEffect, useState } from "react";
import axios from "axios";

const DeleteItems = () => {
  const [items, setItems] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const [toggleLoading, setToggleLoading] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/foodData");
      setItems(res.data.foodItems || []);
    } catch (err) {
      console.error("Failed to fetch items", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setLoadingIds((prev) => [...prev, id]);

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/deletefooditem/${id}`
      );
      alert("Item deleted successfully");
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Failed to delete item", err);
      alert("Failed to delete item");
    } finally {
      setLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    setToggleLoading((prev) => [...prev, id]);

    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.put(
        `http://localhost:5000/api/admin/updateavailability/${id}`,
        { isAvailable: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isAvailable: !currentStatus } : item
        )
      );
    } catch (err) {
      console.error("Failed to update availability", err);
      alert("Error toggling availability");
    } finally {
      setToggleLoading((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const containerStyle = {
    maxWidth: "700px",
    margin: "40px auto",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 10px #ccc",
  };

  const itemStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #ddd",
    padding: "12px 0",
  };

  const leftSideStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  };

  const imageStyle = {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "6px",
  };

  const nameStyle = {
    fontWeight: "600",
    fontSize: "18px",
  };

  const buttonStyle = {
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Manage Food Items
      </h2>
      {items.length === 0 && (
        <p style={{ textAlign: "center" }}>No items to display.</p>
      )}
      {items.map((item) => (
        <div key={item._id} style={itemStyle}>
          <div style={leftSideStyle}>
            <img src={item.imageUrl} alt={item.name} style={imageStyle} />
            <div>
              <div style={nameStyle}>{item.name}</div>
              <div>
                Status: {item.isAvailable ? "✅ Available" : "❌ Not Available"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() =>
                handleToggleAvailability(item._id, item.isAvailable)
              }
              disabled={toggleLoading.includes(item._id)}
              style={{
                ...buttonStyle,
                backgroundColor: item.isAvailable ? "#f59e0b" : "#10b981",
                color: "#fff",
              }}
            >
              {toggleLoading.includes(item._id)
                ? "Updating..."
                : item.isAvailable
                ? "Mark Unavailable"
                : "Mark Available"}
            </button>
            <button
              onClick={() => handleDelete(item._id)}
              disabled={loadingIds.includes(item._id)}
              style={{
                ...buttonStyle,
                backgroundColor: "#dc2626",
                color: "#fff",
              }}
            >
              {loadingIds.includes(item._id) ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeleteItems;
