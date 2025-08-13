import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMFA, setHasMFA] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem("access");
        if (token) {
          const decoded = jwtDecode(token);
          setUser(decoded);
          
          // Check if user has MFA enabled
          try {
            const mfaResponse = await API.get("/mfa/status/");
            setHasMFA(mfaResponse.data.mfa_enabled);
          } catch (error) {
            console.log("MFA status check not available");
          }
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <>
        <div className="loading-container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Loading...</p>
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

  return (
    <>
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="nav-content">
            <div className="nav-left">
              <h1 className="nav-title">Dashboard</h1>
            </div>
            <div className="nav-right">
              <span className="welcome-text">Welcome, {user?.username || 'User'}!</span>
              <button onClick={handleLogout} className="logout-button">
                <svg className="logout-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <div className="content-wrapper">
            <div className="welcome-card">
              <div className="welcome-header">
                <div className="avatar">
                  <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <h2 className="welcome-title">Welcome to your Dashboard!</h2>
                <p className="welcome-subtitle">
                  You have successfully logged in to your account.
                </p>
              </div>
              
              {!hasMFA && (
                <div className="alert alert-warning">
                  <div className="alert-icon">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="alert-content">
                    <h3 className="alert-title">Security Recommendation</h3>
                    <p className="alert-description">
                      For better security, consider enabling Multi-Factor Authentication (MFA).
                    </p>
                    <Link to="/mfa-setup" className="alert-link">
                      Set up MFA now →
                    </Link>
                  </div>
                </div>
              )}

              {hasMFA && (
                <div className="alert alert-success">
                  <div className="alert-icon">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="alert-content">
                    <h3 className="alert-title">Security Active</h3>
                    <p className="alert-description">
                      Multi-Factor Authentication is enabled on your account.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .navbar {
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid #e5e7eb;
        }

        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 4rem;
        }

        .nav-left {
          display: flex;
          align-items: center;
        }

        .nav-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .welcome-text {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .logout-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-button:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .logout-icon {
          width: 1rem;
          height: 1rem;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .welcome-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeIn 0.6s ease-out;
        }

        .welcome-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
          font-weight: bold;
          color: white;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .welcome-subtitle {
          color: #6b7280;
          font-size: 1.1rem;
          margin: 0;
          line-height: 1.5;
        }

        .alert {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border-width: 1px;
          border-style: solid;
        }

        .alert-warning {
          background-color: #fefce8;
          border-color: #fde047;
          color: #92400e;
        }

        .alert-success {
          background-color: #f0fdf4;
          border-color: #4ade80;
          color: #166534;
        }

        .alert-icon {
          flex-shrink: 0;
          width: 1.25rem;
          height: 1.25rem;
          margin-top: 0.125rem;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .alert-description {
          font-size: 0.875rem;
          margin: 0 0 0.75rem 0;
          line-height: 1.4;
        }

        .alert-link {
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .alert-warning .alert-link {
          color: #92400e;
        }

        .alert-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .nav-content {
            padding: 0 1rem;
          }
          
          .nav-right {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-end;
          }
          
          .welcome-text {
            font-size: 0.8rem;
          }
          
          .logout-button {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
          
          .main-content {
            padding: 1rem;
          }
          
          .welcome-card {
            padding: 1.5rem;
          }
          
          .welcome-title {
            font-size: 1.5rem;
          }
          
          .alert {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .alert-icon {
            align-self: flex-start;
          }
        }

        @media (max-width: 480px) {
          .nav-content {
            height: auto;
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }
          
          .nav-right {
            width: 100%;
            justify-content: space-between;
            flex-direction: row;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
