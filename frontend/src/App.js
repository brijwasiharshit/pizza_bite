import React, { createContext, useContext, useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { FaShoppingCart } from "react-icons/fa";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./components/screens/Home";
import Login from "./components/screens/Login";
import Signup from "./components/screens/Signup";

import Navbar from "./components/Navbar";

import Myaccount from "./components/screens/Myaccount";
import MyOrders from "./components/screens/Myorders";

import { CartProvider, useCart } from "./components/ContextReducer";
import Front from "./components/front";
import DeleteItems from "./components/screens/DeleteItem";
import Admin from "./components/admin";
import Thanks from "./components/screens/thanks";
import AdminPanel from "./components/screens/kitchen";
import Last from "./components/screens/last";

import AddItems from "./components/AddItem";
// import AddItemNavbar from "./components/AddItemsNavbar";
import AdminLayout from "./components/screens/AddItemLayout";
// ✅ Create Theme Context for Dark Mode
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <CartProvider>
        <Router>
          <div
            className={`app-container ${darkMode ? "dark-mode" : "light-mode"}`}
          >
            <ConditionalNavbar
              toggleDarkMode={toggleDarkMode}
              darkMode={darkMode}
            />
            {/* Page Animations */}
            <div className="page-transition">
              <Routes>
                <Route path="/:tableId/home/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/createuser" element={<Signup />} />
                <Route path="/:tableId/orders" element={<MyOrders />} />
                <Route path="/account" element={<Myaccount />} />
                {/* <Route path="/menu" element={<Menu />} /> */}
                <Route path="/" element={<Front />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/thanks" element={<Thanks />} />
                <Route path="/kitchen" element={<AdminPanel />} />
                <Route path="/last" element={<Last />} />
                <Route path="/kitchen/items" element={<AdminLayout />}>
              
                  <Route index element={<AddItems />} />
                  <Route path="/kitchen/items/deleteItems" element={<DeleteItems />}
                  />
                </Route>
              </Routes>
            </div>
          </div>
        </Router>
      </CartProvider>
    </ThemeContext.Provider>
  );
}

// Floating Cart Button Component

// ✅ Function to conditionally render Navbar
function ConditionalNavbar({ toggleDarkMode, darkMode }) {
  const location = useLocation();
  const showNavbar = ["/", "/cart", "/spin", "/cod"].includes(
    location.pathname
  );

  return showNavbar ? (
    <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
  ) : null;
}

export default App;
