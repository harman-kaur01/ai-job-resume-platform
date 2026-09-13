
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications"
        );
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);

    } catch (error) {
      console.error(
        "Notification loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read"
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true
              }
            : notification
        )
      );

      setUnreadCount((count) =>
        Math.max(count - 1, 0)
      );

    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/notifications/read-all",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notifications as read"
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map(
          (notification) => ({
            ...notification,
            isRead: true
          })
        )
      );

      setUnreadCount(0);

    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    }
  };

  const deleteNotification = async (
    notificationId
  ) => {
    try {
      const token = localStorage.getItem("token");

      const notification =
        notifications.find(
          (item) =>
            item._id === notificationId
        );

      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete notification"
        );
      }

      setNotifications(
        (currentNotifications) =>
          currentNotifications.filter(
            (item) =>
              item._id !== notificationId
          )
      );

      if (
        notification &&
        !notification.isRead
      ) {
        setUnreadCount((count) =>
          Math.max(count - 1, 0)
        );
      }

    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    // Mark unread notification as read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Close dropdown
    setOpen(false);

    // Get current user role
    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    /*
      Recruiter:
      Application notification
      → Applicants page
    */
    if (
  notification.type === "application" &&
  user.role === "recruiter"
) {
  if (notification.relatedJobId) {
    navigate(
      `/recruiter/jobs/${notification.relatedJobId}/applicants`
    );
  } else {
    navigate("/recruiter/jobs");
  }

  return;
}

    /*
      Job seeker:
      Status update notification
      → My Applications
    */
    if (
      notification.type === "status-update" &&
      user.role === "job-seeker"
    ) {
      navigate("/job-seeker/applications");

      return;
    }

    /*
      Job notification
      → Jobs page
    */
    if (
      notification.type === "job"
    ) {
      navigate("/jobs");

      return;
    }
  };

  const toggleNotifications = () => {
    setOpen((current) => !current);
  };

  return (
    <div className="notification-wrapper">

      <button
        type="button"
        className="notification-bell-button"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">

          <div className="notification-header">

            <div>
              <h3>
                Notifications
              </h3>

              {unreadCount > 0 && (
                <span>
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-read-all"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}

          </div>

          <div className="notification-list">

            {loading ? (

              <div className="notification-empty">
                Loading notifications...
              </div>

            ) : notifications.length === 0 ? (

              <div className="notification-empty">

                <div className="notification-empty-icon">
                  🔔
                </div>

                <p>
                  No notifications yet
                </p>

                <span>
                  You're all caught up.
                </span>

              </div>

            ) : (

              notifications.map(
                (notification) => (

                  <div
                    key={notification._id}
                    className={`notification-item ${
                      notification.isRead
                        ? "notification-read"
                        : "notification-unread"
                    }`}
                  >

                    <button
                      type="button"
                      className="notification-content"
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                    >

                      <div className="notification-item-icon">

                        {notification.type ===
                        "application"
                          ? "📩"
                          : notification.type ===
                            "status-update"
                          ? "📋"
                          : notification.type ===
                            "job"
                          ? "💼"
                          : "🔔"}

                      </div>

                      <div className="notification-item-text">

                        <p>
                          {notification.message}
                        </p>

                        <span>
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </span>

                      </div>

                    </button>

                    <button
                      type="button"
                      className="notification-delete"
                      onClick={() =>
                        deleteNotification(
                          notification._id
                        )
                      }
                      aria-label="Delete notification"
                    >
                      ×
                    </button>

                  </div>

                )
              )

            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default NotificationBell;

