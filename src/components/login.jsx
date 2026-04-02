// components/login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/auth.css';
import kmutnbLogo from '../img/kmutnb.png';
import cedLogo from '../img/ced.png';
import raffyImg from '../img/Raffy.png';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'กรุณาใส่ username';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณาใส่รหัสผ่าน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        navigate('/');
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.message);
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left login-left">
        <h1 className="auth-brand">CodeRaffy</h1>
        <div className="brand-logos-wrapper">
          <div className="brand-logos">
            <img src={kmutnbLogo} alt="KMUTNB" className="brand-logo" />
            <img src={cedLogo} alt="CED" className="brand-logo" />
          </div>
          <img src={raffyImg} alt="CodeRaffy Mascot" className="mascot-outside" />
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-title">Welcome</h2>
          <p className="auth-subtitle">Please sign in to your account</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="auth-button login-button"
              disabled={loading}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;