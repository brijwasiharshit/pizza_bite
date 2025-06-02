import React, { useEffect, useState } from "react";
import axios from "axios";

const DeleteItems = () => {
  const [items, setItems] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const [toggleLoading, setToggleLoading] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/foodData", {
        withCredentials: true,
      });
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
        `http://localhost:5000/api/kitchen/deletefooditem/${id}`,
        {
          withCredentials: true,
        }
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
    if (toggleLoading.includes(id)) return;
    setToggleLoading((prev) => [...prev, id]);

    try {
      await axios.put(
        // changed PATCH to PUT to match backend
        `http://localhost:5000/api/kitchen/updateavailability/${id}`,
        { isAvailable: !currentStatus },
        { withCredentials: true }
      );

      const newItems = items.map((item) =>
        item._id === id ? { ...item, isAvailable: !currentStatus } : item
      );
      setItems(newItems);

      alert(
        `Item is now ${!currentStatus ? "✅ Available" : "❌ Not Available"}`
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

  const getToggleStyle = (isAvailable, isLoading) => ({
    display: "inline-flex",
    alignItems: "center",
    cursor: isLoading ? "not-allowed" : "pointer",
    position: "relative",
    width: "50px",
    height: "26px",
    backgroundColor: isAvailable ? "#10b981" : "#ccc",
    borderRadius: "50px",
    transition: "background-color 0.3s ease",
    opacity: isLoading ? 0.5 : 1,
  });

  const getToggleCircleStyle = (isAvailable) => ({
    position: "absolute",
    top: "3px",
    left: isAvailable ? "26px" : "3px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    transition: "left 0.3s ease",
    boxShadow: "0 0 2px rgba(0,0,0,0.3)",
  });

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Manage Food Items
      </h2>

      <input
        type="text"
        placeholder="Search food..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {items.length === 0 && (
        <p style={{ textAlign: "center" }}>No items to display.</p>
      )}

      {items
        .filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((item) => (
          <div key={item._id} style={itemStyle}>
            <div style={leftSideStyle}>
              {/* fallback if imageUrl missing */}
              <img
                src={item.imageUrl || "https://via.placeholder.com/80"}
                alt={item.name}
                style={imageStyle}
              />
              <div>
                <div style={nameStyle}>{item.name}</div>
                <div>
                  Status:{" "}
                  {item.isAvailable ? "✅ Available" : "❌ Not Available"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div
                onClick={() =>
                  handleToggleAvailability(item._id, item.isAvailable)
                }
                style={getToggleStyle(
                  item.isAvailable,
                  toggleLoading.includes(item._id)
                )}
                aria-label="Toggle Availability"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleToggleAvailability(item._id, item.isAvailable);
                  }
                }}
              >
                <div style={getToggleCircleStyle(item.isAvailable)}></div>
              </div>

              <button
                onClick={() => handleDelete(item._id)}
                disabled={loadingIds.includes(item._id)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  opacity: loadingIds.includes(item._id) ? 0.6 : 1,
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
