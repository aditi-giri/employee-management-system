import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";

// import { getMyProfile } from "../../services/profileService";



import {
  getNotifications,
  markAsRead,
} from "../../utils/notificationStorage";
import { getMyProfile } from "../../services/profileService";

const Topbar = ({ title }) => {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const empId = Number(localStorage.getItem("id"));
  const empDeptId = Number(localStorage.getItem("deptId"));

  const [profileImage, setProfileImage] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // ================= LOAD NOTIFICATIONS =================
  useEffect(() => {
    const all = getNotifications();

    const visible = all.filter((n) => {

      // 🔴 ADMIN notifications → only EMPLOYEES (same dept)
      if (n.senderRole === "ADMIN") {
        return (
          role === "EMPLOYEE" &&
          n.departmentId === empDeptId
        );
      }

      // 🟢 SUPERADMIN notifications → ADMIN + EMPLOYEE
      if (n.senderRole === "SUPERADMIN") {
        return role === "ADMIN" || role === "EMPLOYEE";
      }

      return false;
    });

    getMyProfile()
      .then((res) => {
        setProfileImage(res.data.profileImage || null);
      })
      .catch(() => {
        setProfileImage(null);
      });

    setNotifications(visible);
  }, [role, empDeptId]);




  // ================= UNREAD COUNT =================
  const unreadCount = notifications.filter(
    (n) => !n.readBy?.includes(empId)
  ).length;

  // ================= MARK AS READ =================
  const handleRead = (id) => {
    markAsRead(id, empId);

    // refresh state
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, readBy: [...(n.readBy || []), empId] }
          : n
      )
    );
  };

  // ================= AVATAR =================
  const avatarLetter =
    role === "SUPERADMIN" ? "S" :
      role === "ADMIN" ? "A" :
        role === "EMPLOYEE" ? "E" : "?";

  const roleLabel =
    role === "SUPERADMIN"
      ? "Super Admin"
      : role === "ADMIN"
        ? "Admin"
        : role === "EMPLOYEE"
          ? "Employee"
          : "Unknown";

  // const profileImage = "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="

  return (
    <div className="topbar">
      <h4 className="topbar-title">{title}</h4>

      <div className="topbar-actions">

        {/* 🔔 Notification Bell */}
        {role !== "SUPERADMIN" && (
          <div className="notification-wrapper">
            <button
              className="notification-bell"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Floating dropdown */}
            {showDropdown && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <span>Notifications</span>
                  <button
                    className="close-btn"
                    onClick={() => setShowDropdown(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="dropdown-body">
                  {notifications.length === 0 && (
                    <p className="empty-text">No notifications</p>
                  )}

                  {notifications.map((n) => {
                    const isRead = n.readBy?.includes(empId);

                    return (
                      <div
                        key={n.id}
                        className={`notification-item ${isRead ? "read" : "unread"}`}
                      >
                        <p>{n.message}</p>

                        {!isRead && (
                          <button
                            className="mark-read-btn"
                            onClick={() => handleRead(n.id)}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="dropdown-footer">
                  <button
                    className="view-all-btn"
                    onClick={() => {
                      setShowDropdown(false);   // ✅ close dropdown
                      navigate("/notifications");
                    }}
                  >
                    View All
                  </button>

                </div>
              </div>
            )}
          </div>
        )}

        {/* 👤 Avatar with tooltip */}
        <div
          className="topbar-avatar clickable"
          data-tooltip={roleLabel}
          onClick={() => navigate("/profile")}
        >
          {profileImage ? (
            <img
              src={`http://localhost:8083${profileImage}`}
              alt="Profile"
              className="avatar-img"
            />
          ) : (
            <span>{avatarLetter}</span>
          )}
        </div>






      </div>
    </div>
  );

};

export default Topbar;
