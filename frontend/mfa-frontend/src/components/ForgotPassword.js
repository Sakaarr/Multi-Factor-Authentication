import React, { useState } from "react";
import API from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      await API.post("/password-reset/request/", { email });
      setMessage("If an account with that email exists, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to receive a reset link</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="auth-input"
          />
          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .auth-card {
          background: #fff;
          padding: 2rem;
          border-radius: 16px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .auth-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .auth-subtitle {
          font-size: 0.95rem;
          color: #777;
          margin-bottom: 1.5rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .auth-input {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .auth-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .auth-error {
          color: #dc2626;
          font-size: 0.85rem;
        }
        .auth-success {
          color: #16a34a;
          font-size: 0.85rem;
        }
        .auth-button {
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          color: #fff;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .auth-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #5b5cf6, #7c3aed);
          transform: translateY(-1px);
        }
        .auth-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
