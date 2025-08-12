import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await API.post("/login/", form);
      
      if (res.data.mfa_required) {
        sessionStorage.setItem("mfa_token", res.data.mfa_token);
        navigate("/mfa-login-verify");
      } else {
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          "Login failed. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Sign in to your account</h2>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-fields">
              <div className="form-field">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="Enter your username"
                  disabled={loading}
                />
                {errors.username && (
                  <p className="error-message">{errors.username}</p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="error-message">{errors.password}</p>
                )}
              </div>
            </div>

            {errors.general && (
              <div className="general-error">
                {errors.general}
              </div>
            )}

            <div className="forgot-password-link">
              <Link to="/forgot-password" className="link">
                Forgot your password?
              </Link>
            </div>

            <div className="submit-section">
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="signup-link">
              <span>
                Don't have an account?{" "}
                <Link to="/register" className="link">
                  Sign up here
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .login-card {
          max-width: 400px;
          width: 100%;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h2 {
          font-size: 1.875rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
          line-height: 1.2;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-input {
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
        }

        .form-input.error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .error-message {
          margin-top: 0.25rem;
          font-size: 0.875rem;
          color: #ef4444;
          margin-bottom: 0;
        }

        .general-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .submit-section {
          margin-top: 0.5rem;
        }

        .submit-button {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.75rem 1rem;
          border: none;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 8px;
          color: white;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 48px;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #5b5cf6, #7c3aed);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .signup-link {
          text-align: center;
          margin-top: 0.5rem;
        }

        .signup-link span {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .link {
          font-weight: 600;
          color: #6366f1;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .link:hover {
          color: #5b5cf6;
          text-decoration: underline;
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .login-container {
            padding: 1rem;
          }
          
          .login-card {
            padding: 1.5rem;
          }
          
          .login-header h2 {
            font-size: 1.5rem;
          }
        }

        /* Loading animation */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .submit-button:disabled::after {
          content: '';
          width: 16px;
          height: 16px;
          margin-left: 8px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Focus states for accessibility */
        .form-input:focus-visible,
        .submit-button:focus-visible,
        .link:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }

        /* Smooth animations */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        .forgot-password-link {
          text-align: right;
          margin-top: -0.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </>
  );
}