
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed"
                );
            }

            // Store authentication token
            localStorage.setItem(
                "token",
                data.token
            );

            // Store user information for SmartFlow UI
            if (data.user) {
                localStorage.setItem(
                    "smartflow_user",
                    JSON.stringify({
                        id: data.user.id,
                        name: data.user.name || "",
                        email:
                            data.user.email ||
                            data.email ||
                            email.trim()
                    })
                );
            }

            navigate("/");

        } catch (error) {
            console.error("Login error:", error);

            setError(
                error.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-brand">
                    <div className="auth-logo">
                        
                    </div>

                    <div>
                        <h1>SmartFlow</h1>
                        <span>
                            Smart Productivity Dashboard
                        </span>
                    </div>
                </div>


                <div className="auth-heading">
                    <h2>Welcome back</h2>

                    <p>
                        Sign in to continue managing your
                        productivity.
                    </p>
                </div>


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <label className="auth-field">
                        <span>Email</span>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </label>


                    <label className="auth-field">
                        <span>Password</span>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </label>


                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>


                <div className="auth-footer">
                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Create account
                    </Link>
                </div>

            </div>

        </div>
    );
}

export default Login;

