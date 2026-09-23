
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date());
}

function getUserData() {
  try {
    const savedUser = localStorage.getItem("smartflow_user");

    if (savedUser) {
      const user = JSON.parse(savedUser);

      return {
        name: user.name || "",
        email: user.email || "",
      };
    }
  } catch (error) {
    console.error("User data error:", error);
  }

  try {
    const token = localStorage.getItem("token");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));

      return {
        name:
          payload.name ||
          payload.username ||
          payload.userName ||
          "",
        email: payload.email || "",
      };
    }
  } catch (error) {
    console.error("Token decode error:", error);
  }

  return {
    name: "",
    email: "",
  };
}

function getInitials(name, email) {
  const source = name?.trim() || email?.split("@")[0] || "U";

  const words = source
    .split(" ")
    .filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function Header() {
  const navigate = useNavigate();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState([]);

  const headerRef = useRef(null);

  const user = getUserData();

  const displayName = user.name || "User";
  const initials = getInitials(user.name, user.email);

  /* -----------------------------------------
     FETCH CURRENT PRODUCTIVITY DATA
  ----------------------------------------- */

  useEffect(() => {
    const fetchHeaderData = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [tasksResponse, plansResponse] = await Promise.all([
          fetch(`${API_URL}/api/tasks`, { headers }),
          fetch(`${API_URL}/api/plans`, { headers }),
        ]);

        if (tasksResponse.ok) {
          const taskData = await tasksResponse.json();
          setTasks(Array.isArray(taskData) ? taskData : []);
        }

        if (plansResponse.ok) {
          const planData = await plansResponse.json();
          setPlans(Array.isArray(planData) ? planData : []);
        }
      } catch (error) {
        console.error("Header data error:", error);
      }
    };

    fetchHeaderData();
  }, []);

  /* -----------------------------------------
     CLOSE POPUPS WHEN CLICKING OUTSIDE
  ----------------------------------------- */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* -----------------------------------------
     COUNTS
  ----------------------------------------- */

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  );

  const todayPlans = plans.filter((plan) => !plan.completed);

  const notificationCount =
    pendingTasks.length + todayPlans.length;

  /* -----------------------------------------
     TOGGLE NOTIFICATIONS
  ----------------------------------------- */

  const handleNotificationClick = () => {
    setNotificationOpen((previous) => !previous);
    setAccountOpen(false);
  };

  /* -----------------------------------------
     TOGGLE ACCOUNT
  ----------------------------------------- */

  const handleAccountClick = () => {
    setAccountOpen((previous) => !previous);
    setNotificationOpen(false);
  };

  /* -----------------------------------------
     LOGOUT
  ----------------------------------------- */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("smartflow_user");

    setAccountOpen(false);

    navigate("/login");
  };

  return (
    <header className="sf-header" ref={headerRef}>

      {/* LEFT SIDE */}
      <div className="sf-header-left">
        <p className="sf-header-label">
          YOUR PRODUCTIVITY
        </p>

        <h2 className="sf-header-greeting">
          {getGreeting()}, {displayName} <span>👋</span>
        </h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="sf-header-right">

        <div className="sf-header-date">
          {getFormattedDate()}
        </div>

        {/* NOTIFICATION */}
        <div className="sf-header-menu">

          <button
            type="button"
            className={`sf-header-icon-button ${
              notificationOpen ? "is-active" : ""
            }`}
            onClick={handleNotificationClick}
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >
            <span className="sf-bell-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </span>

            {notificationCount > 0 && (
              <span className="sf-notification-badge">
                {notificationCount > 9
                  ? "9+"
                  : notificationCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="sf-header-dropdown sf-notification-dropdown">

              <div className="sf-dropdown-header">
                <div>
                  <p className="sf-dropdown-eyebrow">
                    SMARTFLOW
                  </p>

                  <h3>Notifications</h3>
                </div>

                {notificationCount > 0 && (
                  <span className="sf-dropdown-count">
                    {notificationCount}
                  </span>
                )}
              </div>

              <div className="sf-notification-list">

                {pendingTasks.length > 0 && (
                  <div className="sf-notification-group">

                    <p className="sf-notification-group-title">
                      Tasks
                    </p>

                    {pendingTasks.slice(0, 3).map((task) => (
                      <button
                        type="button"
                        className="sf-notification-item"
                        key={task._id || task.id}
                        onClick={() => navigate("/tasks")}
                      >
                        <span className="sf-notification-item-icon">
                          ✓
                        </span>

                        <span className="sf-notification-item-content">
                          <strong>{task.title}</strong>
                          <small>Task still pending</small>
                        </span>
                      </button>
                    ))}

                  </div>
                )}

                {todayPlans.length > 0 && (
                  <div className="sf-notification-group">

                    <p className="sf-notification-group-title">
                      Plans
                    </p>

                    {todayPlans.slice(0, 3).map((plan) => (
                      <button
                        type="button"
                        className="sf-notification-item"
                        key={plan._id || plan.id}
                        onClick={() => navigate("/daily")}
                      >
                        <span className="sf-notification-item-icon">
                          ◷
                        </span>

                        <span className="sf-notification-item-content">
                          <strong>{plan.title}</strong>
                          <small>Planned activity</small>
                        </span>
                      </button>
                    ))}

                  </div>
                )}

                {notificationCount === 0 && (
                  <div className="sf-notification-empty">
                    <div className="sf-empty-check">
                      ✓
                    </div>

                    <strong>You're all caught up</strong>

                    <span>
                      No pending tasks or plans right now.
                    </span>
                  </div>
                )}

              </div>

              <button
                type="button"
                className="sf-notification-footer"
                onClick={() => {
                  setNotificationOpen(false);
                  navigate("/tasks");
                }}
              >
                View your tasks
                <span>→</span>
              </button>

            </div>
          )}
        </div>

        {/* ACCOUNT */}
        <div className="sf-header-menu">

          <button
            type="button"
            className={`sf-profile-button ${
              accountOpen ? "is-active" : ""
            }`}
            onClick={handleAccountClick}
            aria-label="Account"
            aria-expanded={accountOpen}
          >
            <span className="sf-profile-avatar">
              {initials}
            </span>
          </button>

          {accountOpen && (
            <div className="sf-header-dropdown sf-account-dropdown">

              {/* PROFILE SUMMARY */}
              <div className="sf-account-summary">

                <div className="sf-account-avatar">
                  {initials}
                </div>

                <div className="sf-account-info">
                  <strong>{displayName}</strong>

                  <span>
                    {user.email || "Account"}
                  </span>
                </div>

              </div>

              <div className="sf-dropdown-divider" />

              {/* SETTINGS */}
              <Link
                to="/settings"
                className="sf-account-menu-item"
                onClick={() => setAccountOpen(false)}
              >
                <span className="sf-menu-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.5v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4.5v-2.5h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4.5h2.5v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 .3 1.9 1.7 1.7 0 0 0 1.5 1h.2v2.5h-.2a1.7 1.7 0 0 0-1.5 1Z" />
                  </svg>
                </span>

                <span>
                  <strong>Settings</strong>
                  <small>Manage your account</small>
                </span>

                <span className="sf-menu-arrow">
                  →
                </span>
              </Link>

              {/* LOGOUT */}
              <button
                type="button"
                className="sf-account-menu-item sf-logout-item"
                onClick={handleLogout}
              >
                <span className="sf-menu-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                  </svg>
                </span>

                <span>
                  <strong>Logout</strong>
                  <small>Sign out of SmartFlow</small>
                </span>
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;

