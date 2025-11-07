import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      console.log('Login successful:', user);
      
      // Set authentication data in localStorage
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminEmail', user.email);
      localStorage.setItem('adminUID', user.uid);
      
      // Store token if needed for API calls
      const token = await user.getIdToken();
      localStorage.setItem('adminToken', token);
      
      // Redirect to admin dashboard
      navigate('/admin');
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = 'Login failed. Please try again.';
          break;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setErrors({ submit: 'Please enter your email address first.' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ submit: 'Please enter a valid email address.' });
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, formData.email);
      alert(`Password reset email sent to ${formData.email}. Please check your inbox.`);
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          errorMessage = 'Failed to send reset email. Please try again.';
          break;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
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
                  disabled={loading}
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

            {/* Demo Credentials - Remove or update for production */}
            <div className="demo-credentials">
              <h4>Demo Note:</h4>
              <p>Use your registered admin credentials</p>
              <p>Contact administrator for account access</p>
            </div>
          </form>

          {/* Footer */}
          <div className="login-footer">
            {/* Add any footer content here */}
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