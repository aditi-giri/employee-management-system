const KEY = "app_notifications";
const EXPIRY_DAYS = 7;

const now = () => new Date().getTime();

export const saveNotification = ({
  message,
  senderRole,
  departmentId,
  targetRole, // NEW
}) => {

  const existing = JSON.parse(localStorage.getItem(KEY)) || [];

  const notification = {
    id: Date.now(),
    message,
    senderRole,
    targetRole, // "EMPLOYEE" | "ALL"
    departmentId, // null = global
    createdAt: now(),
    readBy: [],
  };
  

  localStorage.setItem(KEY, JSON.stringify([notification, ...existing]));
};

export const getNotifications = () => {
  const all = JSON.parse(localStorage.getItem(KEY)) || [];
  const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  const valid = all.filter(
    (n) => now() - n.createdAt < expiryMs
  );

  localStorage.setItem(KEY, JSON.stringify(valid));
  return valid;
};

export const markAsRead = (notificationId, employeeId) => {
  const all = getNotifications();

  const updated = all.map((n) =>
    n.id === notificationId
      ? { ...n, readBy: [...new Set([...(n.readBy || []), employeeId])] }
      : n
  );

  localStorage.setItem(KEY, JSON.stringify(updated));
};
