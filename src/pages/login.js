import React, { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // In Login.js, update the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setLoading(true);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, accept any valid email and password
    console.log('Login successful:', formData);
    
    // Set authentication data in localStorage
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminEmail', formData.email);
    
    // Redirect to admin dashboard
    navigate('/admin');
    
  } catch (error) {
    console.error('Login error:', error);
    setErrors({ submit: 'Login failed. Please try again.' });
  } finally {
    setLoading(false);
  }
};




  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Implement forgot password logic here
    alert('You Are Not Our Head Office Member');
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-content">
        <div className="login-card">
          {/* Header Section */}
          <div className="login-header">
            <div className="logo-section">
              <div className="logo">
                <span>🔒</span>
              </div>
              <h1>Welcome Back</h1>
              <p>Sign in to your RTS Admin account</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-container">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <div className="label-container">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <button 
                  type="button" 
                  className="forgot-password"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="input-container">
                <span className="input-icon">🔑</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>

            {errors.submit && (
              <div className="submit-error">
                ❌ {errors.submit}
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <h4>Demo Credentials:</h4>
              <p>Email: admin@rts.com</p>
              <p>Password: any password with 6+ characters</p>
            </div>
          </form>

          {/* Footer */}
          <div className="login-footer">
            
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="features-section">
          <div className="features-content">
            <h2>RTS Terminal Portal</h2>
            <p>Manage applicant data with powerful tools</p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <div>
                  <h4>Applicant Management</h4>
                  <p>View and manage all applicant records</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <div>
                  <h4>Secure Access</h4>
                  <p>Bank-level security for sensitive data</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <div>
                  <h4>Advanced Analytics</h4>
                  <p>Track application status and metrics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;