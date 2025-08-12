import React, { useState, useEffect, useRef } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function MFALoginVerify() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  
  const mfa_token = sessionStorage.getItem("mfa_token");
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    // Redirect if no MFA token
    if (!mfa_token) {
      navigate("/login");
      return;
    }
    
    // Focus input on mount
    inputRef.current?.focus();
  }, [mfa_token, navigate]);

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
      setError(""); // Clear error when user starts typing
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!code || code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      setError("Too many failed attempts. Please try logging in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/mfa/login/verify/", { 
        code, 
        mfa_token 
      });
      
      // Store tokens
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      
      // Clean up
      sessionStorage.removeItem("mfa_token");
      
      // Navigate to dashboard
      setTimeout(() => {
  navigate("/dashboard", { replace: true });
}, 50);
      
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setError("Too many failed attempts. Redirecting to login...");
        setTimeout(() => {
          sessionStorage.removeItem("mfa_token");
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setError(`Invalid MFA code. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
        setCode("");
        inputRef.current?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      await API.post("/mfa/resend/", { mfa_token });
      alert("New MFA code sent to your device");
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem("mfa_token");
    navigate("/login");
  };

  return (
    <div className="mfa-verify-container">
      <div className="mfa-verify-card">
        <h2>Two-Factor Authentication</h2>
        <p>Enter the 6-digit code from your authenticator app</p>
        
        <form onSubmit={handleSubmit} className="mfa-form">
          <div className="input-group">
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              maxLength={6}
              disabled={loading || attempts >= MAX_ATTEMPTS}
              className={`mfa-input ${error ? 'error' : ''} ${code.length === 6 ? 'complete' : ''}`}
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>
          
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          
          <button 
            type="submit"
            disabled={loading || code.length !== 6 || attempts >= MAX_ATTEMPTS}
            className="verify-button"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
        
        <div className="mfa-actions">
          <button 
            onClick={handleResendCode}
            disabled={loading}
            className="link-button"
          >
            Resend Code
          </button>
          
          <button 
            onClick={handleBackToLogin}
            disabled={loading}
            className="link-button"
          >
            Back to Login
          </button>
        </div>
      </div>

      <style jsx>{`
        .mfa-verify-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 20px;
        }

        .mfa-verify-card {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }

        .mfa-verify-card h2 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 24px;
        }

        .mfa-verify-card p {
          margin: 0 0 30px 0;
          color: #666;
          font-size: 14px;
        }

        .mfa-form {
          margin-bottom: 30px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .mfa-input {
          width: 100%;
          padding: 15px;
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          letter-spacing: 8px;
          border: 2px solid #ddd;
          border-radius: 6px;
          transition: border-color 0.2s ease;
        }

        .mfa-input:focus {
          outline: none;
          border-color: #007bff;
        }

        .mfa-input.complete {
          border-color: #28a745;
        }

        .mfa-input.error {
          border-color: #dc3545;
        }

        .mfa-input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .error-message {
          color: #dc3545;
          font-size: 14px;
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
        }

        .verify-button {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          font-weight: bold;
          color: white;
          background-color: #007bff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .verify-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .verify-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .mfa-actions {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .link-button {
          background: none;
          border: none;
          color: #007bff;
          text-decoration: underline;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
        }

        .link-button:hover:not(:disabled) {
          color: #0056b3;
        }

        .link-button:disabled {
          color: #6c757d;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .mfa-verify-card {
            padding: 30px 20px;
          }
          
          .mfa-actions {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}