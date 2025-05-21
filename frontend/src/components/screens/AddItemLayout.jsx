import React from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div>
      <nav>
        <NavLink to="addItems">Add Items</NavLink> |{" "}
        <NavLink to="deleteItems">Delete Items</NavLink>
      </nav>
      <hr />
      {/* Child routes will be rendered here */}
      <Outlet />
    </div>
  );
}
