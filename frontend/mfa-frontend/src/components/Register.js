import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
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
    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      const { confirmPassword, ...registerData } = form;
      await API.post("/register/", registerData);
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const newErrors = {};
        Object.keys(errorData).forEach((key) => {
          newErrors[key] = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .register-box {
          background: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .register-title {
          font-size: 1.8rem;
          font-weight: bold;
          text-align: center;
          color: #111827;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        label {
          font-size: 0.9rem;
          color: #374151;
          display: block;
          margin-bottom: 6px;
        }
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
        }
        input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
        }
        .error {
          color: #dc2626;
          font-size: 0.85rem;
          margin-top: 4px;
        }
        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 12px;
        }
        .submit-btn {
          width: 100%;
          padding: 10px;
          background: #4f46e5;
          color: white;
          font-size: 1rem;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .submit-btn:hover {
          background: #4338ca;
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-link {
          display: block;
          text-align: center;
          font-size: 0.9rem;
          color: #6b7280;
          margin-top: 14px;
        }
        .login-link a {
          color: #4f46e5;
          font-weight: 500;
          text-decoration: none;
        }
        .login-link a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="register-container">
        <div className="register-box">
          <h2 className="register-title">Create your account</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                disabled={loading}
                style={{ borderColor: errors.username ? "#fca5a5" : "#d1d5db" }}
              />
              {errors.username && <p className="error">{errors.username}</p>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                style={{ borderColor: errors.email ? "#fca5a5" : "#d1d5db" }}
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                style={{ borderColor: errors.password ? "#fca5a5" : "#d1d5db" }}
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                style={{ borderColor: errors.confirmPassword ? "#fca5a5" : "#d1d5db" }}
              />
              {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
            </div>

            {errors.general && <div className="error-box">{errors.general}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>

            <div className="login-link">
              Already have an account?{" "}
              <Link to="/login">Sign in here</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
