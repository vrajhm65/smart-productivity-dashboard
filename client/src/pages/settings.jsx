
import { useEffect, useState } from "react";

function Settings() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load profile"
          );
        }

        setProfile({
          name: data.name || "",
          email: data.email || "",
        });
      } catch (error) {
        console.error("Profile loading error:", error);
        setProfileError(
          error.message || "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProfile();
    } else {
      setLoading(false);
      setProfileError("You are not logged in.");
    }
  }, [API_URL, token]);

  const handleProfileChange = (event) => {
    setProfile({
      ...profile,
      [event.target.name]: event.target.value,
    });
  };

  const handlePasswordChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    try {
      setSavingProfile(true);

      const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update profile"
        );
      }

      setProfile({
        name: data.name || profile.name,
        email: data.email || profile.email,
      });

      localStorage.setItem(
        "smartflow_user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
        })
      );

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      setProfileError(
        error.message || "Unable to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    try {
      setChangingPassword(true);

      const response = await fetch(
        `${API_URL}/api/auth/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passwordData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to change password"
        );
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });

      setPasswordMessage(
        "Password changed successfully."
      );
    } catch (error) {
      console.error("Password change error:", error);

      setPasswordError(
        error.message || "Unable to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-card">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <span className="page-eyebrow">ACCOUNT</span>
          <h1>Settings</h1>
          <p>
            Manage your SmartFlow account and security.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Profile</h2>
              <p>Update your personal information.</p>
            </div>
          </div>

          {profileError && (
            <div className="auth-error">
              {profileError}
            </div>
          )}

          {profileMessage && (
            <div className="settings-success">
              {profileMessage}
            </div>
          )}

          <form
            className="settings-form"
            onSubmit={handleProfileSubmit}
          >
            <label>
              <span>Name</span>

              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Your name"
                required
              />
            </label>

            <label>
              <span>Email</span>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="Email address"
                required
              />
            </label>

            <button
              type="submit"
              className="settings-button"
              disabled={savingProfile}
            >
              {savingProfile
                ? "Saving..."
                : "Save Changes"}
            </button>
          </form>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Security</h2>
              <p>Change your account password.</p>
            </div>
          </div>

          {passwordError && (
            <div className="auth-error">
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div className="settings-success">
              {passwordMessage}
            </div>
          )}

          <form
            className="settings-form"
            onSubmit={handlePasswordSubmit}
          >
            <label>
              <span>Current Password</span>

              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                required
              />
            </label>

            <label>
              <span>New Password</span>

              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                minLength="6"
                required
              />
            </label>

            <button
              type="submit"
              className="settings-button"
              disabled={changingPassword}
            >
              {changingPassword
                ? "Changing..."
                : "Change Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Settings;

