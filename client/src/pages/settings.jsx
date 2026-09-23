
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar";
import Header from "../components/header";

import "./settings.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function Settings() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        name: "",
        email: ""
    });

    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const token = localStorage.getItem("token");


    // =========================
    // LOAD PROFILE
    // =========================
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const loadProfile = async () => {
            try {
                setProfileLoading(true);

                const response = await fetch(`${API_URL}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("smartflow_user");
                        navigate("/login");
                        return;
                    }

                    throw new Error(
                        data.message || "Unable to load profile"
                    );
                }

                const user = data.user || {};

                setProfile({
                    name: user.name || "",
                    email: user.email || ""
                });

                localStorage.setItem(
                    "smartflow_user",
                    JSON.stringify({
                        id: user.id,
                        name: user.name || "",
                        email: user.email || ""
                    })
                );

            } catch (error) {
                console.error("Profile loading error:", error);

                setProfileError(
                    error.message || "Unable to load profile"
                );
            } finally {
                setProfileLoading(false);
            }
        };

        loadProfile();
    }, [navigate, token]);


    // =========================
    // PROFILE INPUT
    // =========================
    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value
        }));

        setProfileMessage("");
        setProfileError("");
    };


    // =========================
    // SAVE PROFILE
    // =========================
    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        setProfileMessage("");
        setProfileError("");

        if (!profile.name.trim() || !profile.email.trim()) {
            setProfileError("Name and email are required.");
            return;
        }

        try {
            setProfileSaving(true);

            const response = await fetch(`${API_URL}/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("smartflow_user");
                    navigate("/login");
                    return;
                }

                throw new Error(
                    data.message || "Unable to update profile"
                );
            }

            const user = data.user || {};

            setProfile({
                name: user.name || "",
                email: user.email || ""
            });

            localStorage.setItem(
                "smartflow_user",
                JSON.stringify({
                    id: user.id,
                    name: user.name || "",
                    email: user.email || ""
                })
            );

            setProfileMessage("Profile updated successfully.");

        } catch (error) {
            console.error("Profile update error:", error);

            setProfileError(
                error.message || "Unable to update profile"
            );
        } finally {
            setProfileSaving(false);
        }
    };


    // =========================
    // PASSWORD INPUT
    // =========================
    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordData((previous) => ({
            ...previous,
            [name]: value
        }));

        setPasswordMessage("");
        setPasswordError("");
    };


    // =========================
    // CHANGE PASSWORD
    // =========================
    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError(
                "New password must be at least 6 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        try {
            setPasswordSaving(true);

            const response = await fetch(`${API_URL}/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("smartflow_user");
                    navigate("/login");
                    return;
                }

                throw new Error(
                    data.message || "Unable to change password"
                );
            }

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            setPasswordMessage(
                "Password updated successfully."
            );

        } catch (error) {
            console.error("Password update error:", error);

            setPasswordError(
                error.message || "Unable to change password"
            );
        } finally {
            setPasswordSaving(false);
        }
    };


    // =========================
    // LOGOUT
    // =========================
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("smartflow_user");

        navigate("/login");
    };


    // =========================
    // AVATAR INITIALS
    // =========================
    const getInitials = () => {
        if (!profile.name.trim()) {
            return "U";
        }

        const parts = profile.name
            .trim()
            .split(/\s+/);

        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    };


    return (
        <div className="app-shell">
            <Sidebar />

            <main className="main-content">
                <Header />

                <section className="settings-page">

                    {/* PAGE INTRO */}
                    <div className="settings-intro">
                        <div>
                            <span className="settings-eyebrow">
                                ACCOUNT
                            </span>

                            <h1>Settings</h1>

                            <p>
                                Manage your profile, security and
                                SmartFlow account.
                            </p>
                        </div>
                    </div>


                    {/* PROFILE */}
                    <section className="settings-card">

                        <div className="settings-card-header">
                            <div className="settings-card-icon">
                                👤
                            </div>

                            <div>
                                <h2>Profile</h2>
                                <p>
                                    Update the information connected
                                    to your SmartFlow account.
                                </p>
                            </div>
                        </div>


                        <div className="settings-profile-preview">

                            <div className="settings-avatar">
                                {getInitials()}
                            </div>

                            <div>
                                <strong>
                                    {profile.name || "Your Name"}
                                </strong>

                                <span>
                                    {profile.email || "your@email.com"}
                                </span>
                            </div>

                        </div>


                        {profileLoading ? (
                            <div className="settings-loading">
                                Loading profile...
                            </div>
                        ) : (
                            <form
                                className="settings-form"
                                onSubmit={handleProfileSubmit}
                            >

                                <div className="settings-form-grid">

                                    <label className="settings-field">
                                        <span>Name</span>

                                        <input
                                            type="text"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your name"
                                            autoComplete="name"
                                        />
                                    </label>


                                    <label className="settings-field">
                                        <span>Email</span>

                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                        />
                                    </label>

                                </div>


                                {profileError && (
                                    <div className="settings-message settings-message-error">
                                        {profileError}
                                    </div>
                                )}

                                {profileMessage && (
                                    <div className="settings-message settings-message-success">
                                        {profileMessage}
                                    </div>
                                )}


                                <div className="settings-form-actions">
                                    <button
                                        type="submit"
                                        className="settings-primary-btn"
                                        disabled={profileSaving}
                                    >
                                        {profileSaving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                </div>

                            </form>
                        )}

                    </section>


                    {/* SECURITY */}
                    <section className="settings-card">

                        <div className="settings-card-header">
                            <div className="settings-card-icon">
                                🔒
                            </div>

                            <div>
                                <h2>Security</h2>
                                <p>
                                    Change your password to keep your
                                    account secure.
                                </p>
                            </div>
                        </div>


                        <form
                            className="settings-form"
                            onSubmit={handlePasswordSubmit}
                        >

                            <div className="settings-form-grid">

                                <label className="settings-field">
                                    <span>Current Password</span>

                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={
                                            passwordData.currentPassword
                                        }
                                        onChange={handlePasswordChange}
                                        placeholder="Enter current password"
                                        autoComplete="current-password"
                                    />
                                </label>


                                <label className="settings-field">
                                    <span>New Password</span>

                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={
                                            passwordData.newPassword
                                        }
                                        onChange={handlePasswordChange}
                                        placeholder="Minimum 6 characters"
                                        autoComplete="new-password"
                                    />
                                </label>

                            </div>


                            <label className="settings-field settings-field-full">
                                <span>Confirm New Password</span>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={
                                        passwordData.confirmPassword
                                    }
                                    onChange={handlePasswordChange}
                                    placeholder="Re-enter new password"
                                    autoComplete="new-password"
                                />
                            </label>


                            {passwordError && (
                                <div className="settings-message settings-message-error">
                                    {passwordError}
                                </div>
                            )}

                            {passwordMessage && (
                                <div className="settings-message settings-message-success">
                                    {passwordMessage}
                                </div>
                            )}


                            <div className="settings-form-actions">
                                <button
                                    type="submit"
                                    className="settings-primary-btn"
                                    disabled={passwordSaving}
                                >
                                    {passwordSaving
                                        ? "Updating..."
                                        : "Update Password"}
                                </button>
                            </div>

                        </form>

                    </section>


                    {/* ACCOUNT */}
                    <section className="settings-card settings-danger-card">

                        <div className="settings-card-header">
                            <div className="settings-card-icon settings-danger-icon">
                                ↪
                            </div>

                            <div>
                                <h2>Account</h2>
                                <p>
                                    Sign out of your SmartFlow account
                                    on this device.
                                </p>
                            </div>
                        </div>


                        <div className="settings-account-action">

                            <div>
                                <strong>Sign out</strong>

                                <span>
                                    You can sign back in anytime using
                                    your account credentials.
                                </span>
                            </div>

                            <button
                                type="button"
                                className="settings-danger-btn"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>

                        </div>

                    </section>

                </section>
            </main>
        </div>
    );
}

export default Settings;

