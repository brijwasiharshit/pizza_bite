import { NavLink } from "react-router-dom";
import "./Navbar.css"; // Import the CSS

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink
        to="/admin/items/addItems"
        className={({ isActive }) => (isActive ? "navlink active" : "navlink")}
      >
        Add Items
      </NavLink>
      <NavLink
        to="/admin/items/deleteItems"
        className={({ isActive }) => (isActive ? "navlink active" : "navlink")}
      >
        Delete Items
      </NavLink>
    </nav>
  );
}
