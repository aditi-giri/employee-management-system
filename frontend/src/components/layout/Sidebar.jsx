import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ role, onLogout }) => {
  return (
    <div className="sidebar">

      <div className="sidebar-header">
        <h4>Employee System</h4>
      </div>

      <ul className="sidebar-menu">

        <li>
          <NavLink to="/dashboard" className="sidebar-link">
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/profile" className="sidebar-link">
            My Profile
          </NavLink>
        </li>


        {role === "SUPERADMIN" && (
          <>
            <li>
              <NavLink to="/employees" className="sidebar-link">
                Employees
              </NavLink>
            </li>

            <li>
              <NavLink to="/departments" className="sidebar-link">
                Departments
              </NavLink>
            </li>

            <li>
              <NavLink to="/tasks" className="sidebar-link">
                Tasks
              </NavLink>
            </li>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <li>
              <NavLink to="/employees" className="sidebar-link">
                Employees
              </NavLink>
            </li>

            <li>
              <NavLink to="/tasks" className="sidebar-link">
                Tasks
              </NavLink>
            </li>
          </>
        )}

        {role === "EMPLOYEE" && (
          <>


            <li>
              <NavLink to="/tasks" className="sidebar-link">
                My Tasks
              </NavLink>
            </li>
          </>
        )}

      </ul>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
