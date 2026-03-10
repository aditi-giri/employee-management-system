// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";


import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetails from "./pages/EmployeeDetails";
import Departments from "./pages/Departments";
import DepartmentDetails from "./pages/DepartmentDetails";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import MyProfile from "./pages/MyProfile";

// ✅ NEW IMPORTS
import CreateTask from "./pages/CreateTask";
import EditTask from "./pages/EditTask";

import ProtectedRoute from "./routes/ProtectedRoute";
import Sidebar from "./components/layout/Sidebar";
import { logout } from "./services/authService";

const AppLayout = ({ children }) => {
  const role = localStorage.getItem("role") || "EMPLOYEE";

  return (
    <div className="app-container">
      <div className="sidebar-container">
        <Sidebar role={role} onLogout={logout} />
      </div>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>


        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* DEFAULT REDIRECT */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Notifications />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* My Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MyProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* EMPLOYEES */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Employees />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EmployeeDetails />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* DEPARTMENTS */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Departments />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DepartmentDetails />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* TASKS */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Tasks />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* TASK DETAILS */}
        <Route
          path="/tasks/:taskId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TaskDetails />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ✅ CREATE TASK */}
        <Route
          path="/tasks/create"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateTask />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ✅ EDIT TASK */}
        <Route
          path="/tasks/edit/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EditTask />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
