import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function MFASetup() {
  const [qrCode, setQrCode] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const setupMFA = async () => {
      try {
        const res = await API.get("/mfa/setup/");
        setQrCode(res.data.qr_code);
        setSecretKey(res.data.secret_key);
      } catch (err) {
        setError("Failed to load MFA setup. Please try again.");
        console.error("MFA setup error:", err);
      } finally {
        setLoading(false);
      }
    };

    setupMFA();
  }, []);

  const handleVerify = async () => {
    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      await API.post("/mfa/setup/verify/", { code: code.trim() });
      setStep(3); // Success step
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          "Invalid verification code. Please try again.";
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
      if (error) setError("");
    }
  };

  const handleSkip = () => {
    if (window.confirm("Are you sure you want to skip MFA setup? This will reduce your account security.")) {
      navigate("/dashboard");
    }
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey);
    // Could add a toast notification here
  };

  if (loading) {
    return (
      <>
        <div className="loading-container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Setting up MFA...</p>
          </div>
        </div>
        
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .loading-content {
            text-align: center;
            color: white;
          }
          
          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            margin: 0 auto 1rem;
            animation: spin 1s linear infinite;
          }
          
          .loading-content p {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 500;
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  if (step === 3) {
    return (
      <>
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2>MFA Successfully Enabled!</h2>
            <p>Your account is now protected with multi-factor authentication.</p>
            <div className="success-loader">
              <div className="success-progress"></div>
            </div>
            <p className="redirect-text">Redirecting to dashboard...</p>
          </div>
        </div>

        <style jsx>{`
          .success-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
          }

          .success-card {
            background: white;
            padding: 3rem 2rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
          }

          .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            color: white;
            animation: successBounce 0.6s ease-out;
          }

          .success-icon svg {
            width: 40px;
            height: 40px;
          }

          .success-card h2 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 1rem 0;
          }

          .success-card p {
            color: #6b7280;
            margin: 0 0 2rem 0;
            line-height: 1.5;
          }

          .success-loader {
            width: 100%;
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 1rem;
          }

          .success-progress {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            border-radius: 2px;
            animation: progressBar 2s ease-out;
          }

          .redirect-text {
            font-size: 0.875rem;
            color: #9ca3af;
            margin: 0;
          }

          @keyframes successBounce {
            0% {
              transform: scale(0);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes progressBar {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="mfa-setup-container">
        <div className="setup-card">
          <div className="setup-header">
            <div className="security-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2>Set up Multi-Factor Authentication</h2>
            <p>Enhance your account security with an extra layer of protection</p>
          </div>

          <div className="setup-steps">
            <div className="step-indicator">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className="step-line"></div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
            </div>
            <div className="step-labels">
              <span>Scan QR Code</span>
              <span>Verify Code</span>
            </div>
          </div>

          <div className="setup-content">
            <div className="qr-section">
              {qrCode && (
                <div className="qr-container">
                  <div className="qr-frame">
                    <img 
                      src={qrCode} 
                      alt="QR Code for MFA setup"
                      className="qr-image"
                    />
                  </div>
                  
                  {secretKey && (
                    <div className="manual-setup">
                      <p className="manual-label">Can't scan? Enter manually:</p>
                      <div className="secret-key-container">
                        <code className="secret-key">{secretKey}</code>
                        <button 
                          onClick={copySecretKey}
                          className="copy-button"
                          title="Copy to clipboard"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="verification-section">
              <div className="input-group">
                <label htmlFor="code" className="input-label">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  maxLength={6}
                  className={`verification-input ${error ? 'error' : ''} ${code.length === 6 ? 'complete' : ''}`}
                  disabled={verifying}
                />
                <p className="input-help">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {error && (
                <div className="error-alert">
                  <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="button-group">
                <button
                  onClick={handleVerify}
                  disabled={verifying || !code || code.length !== 6}
                  className="verify-button"
                >
                  {verifying ? (
                    <>
                      <span className="button-spinner"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify and Enable MFA'
                  )}
                </button>

                <button
                  onClick={handleSkip}
                  disabled={verifying}
                  className="skip-button"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>

          <div className="app-recommendations">
            <p className="recommendations-title">Recommended Authenticator Apps:</p>
            <div className="app-list">
              <span className="app-badge">Google Authenticator</span>
              <span className="app-badge">Authy</span>
              <span className="app-badge">Microsoft Authenticator</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mfa-setup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .setup-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          padding: 2.5rem;
          width: 100%;
          max-width: 500px;
          animation: slideUp 0.6s ease-out;
        }

        .setup-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .security-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .security-icon svg {
          width: 40px;
          height: 40px;
        }

        .setup-header h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .setup-header p {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
        }

        .setup-steps {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .step {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          background: #e5e7eb;
          color: #6b7280;
          transition: all 0.3s ease;
        }

        .step.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .step-line {
          width: 60px;
          height: 2px;
          background: #e5e7eb;
          margin: 0 1rem;
        }

        .step-labels {
          display: flex;
          justify-content: space-between;
          width: 180px;
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .setup-content {
          margin-bottom: 2rem;
        }

        .qr-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .qr-container {
          display: inline-block;
        }

        .qr-frame {
          padding: 1rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .qr-image {
          max-width: 200px;
          height: auto;
          display: block;
        }

        .manual-setup {
          max-width: 280px;
          margin: 0 auto;
        }

        .manual-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0 0.5rem 0;
        }

        .secret-key-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .secret-key {
          flex: 1;
          font-size: 0.75rem;
          font-family: 'Courier New', monospace;
          word-break: break-all;
          color: #374151;
        }

        .copy-button {
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        .copy-button:hover {
          color: #6366f1;
        }

        .copy-button svg {
          width: 1rem;
          height: 1rem;
        }

        .verification-section {
          margin-top: 1.5rem;
        }

        .input-group {
          margin-bottom: 1.5rem;
        }

        .input-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .verification-input {
          width: 100%;
          padding: 1rem;
          font-size: 1.25rem;
          font-weight: 600;
          text-align: center;
          letter-spacing: 0.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.2s ease;
          background: white;
        }

        .verification-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .verification-input.complete {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .verification-input.error {
          border-color: #ef4444;
        }

        .verification-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .input-help {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
          text-align: center;
          margin-bottom: 0;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .error-icon {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .verify-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 48px;
        }

        .verify-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #5b5cf6, #7c3aed);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .verify-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .skip-button {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .skip-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
          color: #374151;
        }

        .skip-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .app-recommendations {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .recommendations-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 1rem 0;
        }

        .app-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
        }

        .app-badge {
          background: #f3f4f6;
          color: #6b7280;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .mfa-setup-container {
            padding: 1rem;
          }
          
          .setup-card {
            padding: 2rem 1.5rem;
          }
          
          .setup-header h2 {
            font-size: 1.5rem;
          }
          
          .qr-image {
            max-width: 160px;
          }
          
          .app-list {
            flex-direction: column;
            align-items: center;
          }
        }

        /* Animations */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}