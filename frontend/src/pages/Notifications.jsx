// src/pages/Notifications.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import {
  getNotifications,
  markAsRead,
} from "../utils/notificationStorage";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const empId = Number(localStorage.getItem("id"));
  const empDeptId = Number(localStorage.getItem("deptId"));

  // ================= LOAD NOTIFICATIONS =================
  useEffect(() => {
    const all = getNotifications();

    const visible = all.filter((n) => {
      if (n.senderRole === "ADMIN") {
        return role === "EMPLOYEE" && n.departmentId === empDeptId;
      }
      if (n.senderRole === "SUPERADMIN") {
        return role === "ADMIN" || role === "EMPLOYEE";
      }
      return false;
    });

    setNotifications(visible);
  }, [role, empDeptId]);

  // ================= MARK AS READ =================
  const dismiss = (id) => {
    markAsRead(id, empId);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, readBy: [...(n.readBy || []), empId] }
          : n
      )
    );
  };

  return (
    <div>
      <Topbar title="Notifications" />

      {/* === SAME STRUCTURE AS DASHBOARD === */}
      <div className="notifications-container">

        {/* Header / Actions */}
        <div className="notifications-header">
        <button
            className="action-btn blue-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Go to Dashboard
          </button>
          <h5 className="section-title">Your Notifications</h5>

         
        </div>

        {/* Content */}
        {notifications.length === 0 && (
          <div className="placeholder-box">
            🎉 You’re all caught up! No notifications right now.
          </div>
        )}

        <div className="notifications-list">
          {notifications.map((n) => {
            const unread = !n.readBy?.includes(empId);

            return (
              <div
                key={n.id}
                className={`notification-card ${
                  unread ? "unread" : "read"
                }`}
              >
                <div className="notification-content">
                  <p className="notification-message">
                    {n.message}
                  </p>

                  {unread && (
                    <button
                      className="dismiss-btn"
                      onClick={() => dismiss(n.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Notifications;
