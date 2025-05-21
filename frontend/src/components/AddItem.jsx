import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddItems() {
  const host = process.env.REACT_APP_HOST;

  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: null,
    isAvailable: true,
    options: { Half: "", Full: "" },
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get("http://localhost:5000/api/user/foodData");
        setCategories(res.data.foodCategories || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "Half" || name === "Full") {
      setFormData((prev) => ({
        ...prev,
        options: { ...prev.options, [name]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("isAvailable", formData.isAvailable);

    // Add options as JSON string if needed
    data.append("options", JSON.stringify(formData.options));

    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.post(`${host}/api/admin/addfooditem`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Item added successfully!");
      setFormData({
        name: "",
        description: "",
        category: "",
        image: null,
        isAvailable: true,
        options: {},
      });
      setPreview(null);
    } catch (err) {
      console.error("Error adding item:", err.response || err.message || err);
      alert(
        "❌ Failed to add item: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    boxShadow: "0 0 10px #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  };

  const checkboxContainer = {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        Add Food Item
      </h2>

      <label style={labelStyle}>Food Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Enter food name"
        style={inputStyle}
      />

      <label style={labelStyle}>Description</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        rows={3}
        placeholder="Enter description"
        style={inputStyle}
      />

      <label style={labelStyle}>Category</label>
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
        style={inputStyle}
      >
        <option value="">Select a category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <label style={labelStyle}>Upload Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ marginBottom: "15px" }}
      />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "6px",
            marginBottom: "15px",
          }}
        />
      )}

      <div>
        <label style={labelStyle}>Options (Prices)</label>
        <input
          type="text"
          name="Half"
          value={formData.options.Half}
          onChange={handleChange}
          placeholder="Half price"
          style={inputStyle}
        />
        <input
          type="text"
          name="Full"
          value={formData.options.Full}
          onChange={handleChange}
          placeholder="Full price"
          style={inputStyle}
        />
      </div>

      <div style={checkboxContainer}>
        <input
          type="checkbox"
          name="isAvailable"
          checked={formData.isAvailable}
          onChange={handleChange}
          id="availableCheckbox"
        />
        <label htmlFor="availableCheckbox" style={{ marginLeft: "8px" }}>
          Available
        </label>
      </div>

      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "Adding..." : "Add Item"}
      </button>
    </form>
  );
}
