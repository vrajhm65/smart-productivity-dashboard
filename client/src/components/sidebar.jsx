
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Icon = ({ children }) => (
  <span aria-hidden="true" className="sidebar-icon">
    {children}
  </span>
);

function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("smartflow_user");
    setIsOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () =>
      window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        className="sidebar-menu-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M4 7h16M4 12h16M4 17h16"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        className={`sidebar-backdrop ${
          isOpen ? "is-visible" : ""
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${isOpen ? "is-open" : ""}`}
      >
        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={closeMenu}
          aria-label="Close navigation menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* SMARTFLOW BRAND */}
        <div className="logo sidebar-brand">
          <div>
            <span className="sidebar-brand-name">
              SmartFlow
            </span>

            <span className="sidebar-brand-subtitle">
              Personal productivity
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav
          className="sidebar-nav"
          aria-label="Primary navigation"
        >
          <NavLink
            to="/"
            className="sidebar-item"
            onClick={closeMenu}
            end
          >
            <Icon>⌂</Icon>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className="sidebar-item"
            onClick={closeMenu}
          >
            <Icon>✓</Icon>
            <span>Tasks</span>
          </NavLink>

          <NavLink
            to="/daily"
            className="sidebar-item"
            onClick={closeMenu}
          >
            <Icon>☀</Icon>
            <span>Daily</span>
          </NavLink>

          <NavLink
            to="/calendar"
            className="sidebar-item"
            onClick={closeMenu}
          >
            <Icon>▣</Icon>
            <span>Calendar</span>
          </NavLink>
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">

          <NavLink
            to="/settings"
            className="help-button"
            onClick={closeMenu}
          >
            <span>?</span>
            Help &amp; Tips
          </NavLink>

          {/* VR DEVELOPER BRAND */}
          <div className="sidebar-developer-brand">
            <div className="sidebar-vr-mark">
              VR
            </div>

            <div className="sidebar-developer-text">
              <span>Built by</span>
              <strong>VR</strong>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span className="logout-label">
              Logout
            </span>
          </button>

        </div>
      </aside>
    </>
  );
}

export default Sidebar;

