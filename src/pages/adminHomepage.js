import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './AdminHomepage.css';

function AdminHomepage() {
  const [formData, setFormData] = useState({
    name: '',
    passportNumber: '',
    docPassword: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on component mount
  const checkAuthentication = useCallback(() => {
    const userLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const userEmail = localStorage.getItem('adminEmail');
    
    if (userLoggedIn && userEmail) {
      setIsAuthenticated(true);
    } else {
      navigate('/admin/login');
    }
    setLoadingAuth(false);
  }, [navigate]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setMessage('Please select a valid image (JPEG, PNG, JPG) or PDF file');
        return;
      }
      
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setMessage('File size should be less than 10MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setMessage('');
    }
  };

  const generateUrl = (documentId) => {
    return `/employer/document/${documentId}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage('URL copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

 const uploadFileToServer = async (file, passportNumber) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('passportNumber', passportNumber);

  try {
    console.log('🔄 Starting file upload...');
    console.log('📁 File:', file.name);
    console.log('📇 Passport:', passportNumber);
    console.log('🌐 Target URL:', 'https://rts.italyembassy.site/upload');
    console.log('📍 Current origin:', window.location.origin);

    // ADD TIMEOUT and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch('https://rts.italyembassy.site/upload', {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    console.log('📨 Response status:', response.status);
    console.log('📨 Response ok:', response.ok);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Response is not JSON:', text);
      throw new Error(`Server returned non-JSON response: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Upload successful:', result);
    
    if (result.success) {
      return result.filePath;
    } else {
      throw new Error(result.message || 'File upload failed');
    }
  } catch (error) {
    console.error('🔥 File upload error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Upload timeout - server took too long to respond');
    }
    throw new Error('Failed to upload file: ' + error.message);
  }
};




  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.passportNumber || !formData.docPassword || !formData.file) {
      setMessage('Please fill all fields and select a file');
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage('');
    setGeneratedUrl('');

    try {
      // Simulate progress for file upload
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Step 1: Upload file to your server
      const filePath = await uploadFileToServer(formData.file, formData.passportNumber);
      
      // Step 2: Save data to Firestore with file path
      // In your handleSubmit function, update the fileUrl:
const docRef = await addDoc(collection(firestore, 'applicants'), {
  // Basic applicant info
  name: formData.name,
  passportNumber: formData.passportNumber,
  docPassword: formData.docPassword,
  
  // File information stored in Firestore
  filePath: filePath, // Full path to the file: "/uploads/AB1234567/filename.pdf"
  fileName: formData.file.name,
  fileType: formData.file.type,
  fileSize: formData.file.size,
  
  // File access URL (constructed from filePath) - FIXED URL
  fileUrl: `https://rts.italyembassy.site${filePath}`,
  
  // Application metadata
  uploadedAt: serverTimestamp(),
  status: 'Approved',
  createdBy: localStorage.getItem('adminEmail') || 'admin',
  
  // Additional info for easy querying
  searchablePassport: formData.passportNumber.toLowerCase(),
  searchableName: formData.name.toLowerCase()
});




      clearInterval(progressInterval);
      setProgress(100);

      // Generate the application URL for the employer portal
      const applicationUrl = `${window.location.origin}${generateUrl(docRef.id)}`;
      setGeneratedUrl(applicationUrl);
      
      setMessage('Data uploaded successfully! Application URL generated.');

      // Reset form
      setFormData({
        name: '',
        passportNumber: '',
        docPassword: '',
        file: null
      });
      
      // Clear file input
      document.getElementById('fileInput').value = '';

    } catch (error) {
      console.error('Error uploading data:', error);
      setMessage(error.message || 'Error uploading data. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Show loading while checking authentication
  if (loadingAuth) {
    return (
      <div className="admin-homepage">
        <div className="admin-container">
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-homepage">
      <div className="admin-container">
        <div className="admin-header">
          <div className="header-content">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="user-section">
            <div className="user-info">
              <div className="user-details">
                <span className="user-name">Administrator</span>
                <br/>
                <span className="user-email">{localStorage.getItem('adminEmail')}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        <div className="upload-section">
          <div className="upload-card">
            <h2>Upload Applicant Data</h2>
            
            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="passportNumber">Passport Number *</label>
                <input
                  type="text"
                  id="passportNumber"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  placeholder="Enter passport number"
                  required
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="docPassword">Document Password *</label>
                <input
                  type="password"
                  id="docPassword"
                  name="docPassword"
                  value={formData.docPassword}
                  onChange={handleInputChange}
                  placeholder="Set document access password"
                  required
                  disabled={uploading}
                />
                <small>This password will be required to access the application</small>
              </div>

              <div className="form-group">
                <label htmlFor="fileInput">Document File *</label>
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  disabled={uploading}
                  required
                />
                <small>Supported formats: JPG, PNG, PDF (Max: 10MB)</small>
                {formData.file && (
                  <div className="file-info">
                    <span>Selected: {formData.file.name}</span>
                    <span>Size: {(formData.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>Type: {formData.file.type}</span>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{progress}%</span>
                </div>
              )}

              {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}

              {generatedUrl && (
                <div className="url-section">
                  <h4>Application URL:</h4>
                  <div className="url-container">
                    <code className="generated-url">{generatedUrl}</code>
                    <button 
                      type="button" 
                      className="copy-btn"
                      onClick={() => copyToClipboard(generatedUrl)}
                    >
                      Copy
                    </button>
                  </div>
                  <small>Share this URL with the applicant. They'll need the document password to access it.</small>
                </div>
              )}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Data & Generate URL'}
              </button>
            </form>
          </div>

          <div className="info-card">
            <h3>Upload Guidelines</h3>
            <ul>
              <li>Ensure all fields are filled correctly</li>
              <li>Passport number should be unique for each applicant</li>
              <li>Document password will be required to access the application</li>
              <li>Supported file types: JPG, PNG, PDF (Max: 10MB)</li>
              <li>Files are stored on: rts.italyembassy.site/server</li>
              <li>File path format: /uploads/passportNumber/filename</li>
              <li>File URL: https://rts.italyembassy.site/server/uploads/...</li>
              <li>Applicants will be marked as "Approved" status</li>
            </ul>

            <div className="url-example">
              <h4>File Storage Example:</h4>
              <code>
                https://rts.italyembassy.site/server/uploads/AB1234567/document_1234567890.pdf
              </code>
              <p>Where:</p>
              <ul>
                <li><strong>AB1234567</strong> = Passport Number</li>
                <li><strong>document_1234567890.pdf</strong> = Timestamped filename</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button 

              onClick={() => navigate('/admin/media')}
              className="action-btn"
               
              >
                View All Applicants
              </button>
              <button className="action-btn">Export Data</button>
              <button className="action-btn">Manage Users</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHomepage;