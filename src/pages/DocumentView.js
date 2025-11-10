// pages/DocumentView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import './DocumentView.css';

function DocumentView() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordAttempted, setPasswordAttempted] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        setLoading(true);
        const docRef = doc(firestore, 'applicants', documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setApplicant({
            id: docSnap.id,
            ...docSnap.data()
          });
        } else {
          setAuthError('Document not found');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        setAuthError('Error loading document');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchApplicant();
    }
  }, [documentId]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordAttempted(true);
    
    if (!password) {
      setAuthError('Please enter the document password');
      return;
    }

    if (applicant && password === applicant.docPassword) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid password. Please try again.');
    }
  };

  const handleGoBack = () => {
    navigate('/employer');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', label: 'Pending' },
      approved: { class: 'status-approved', label: 'Approved' },
      rejected: { class: 'status-rejected', label: 'Rejected' },
      review: { class: 'status-review', label: 'Under Review' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getFileType = (filename) => {
    if (!filename) return 'document';
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image';
    return 'document';
  };

  const getFileIcon = (filename) => {
    const fileType = getFileType(filename);
    const icons = {
      pdf: '📕',
      word: '📘',
      image: '🖼️',
      document: '📄'
    };
    return icons[fileType] || '📄';
  };

  const handleDownload = () => {
    if (applicant?.fileUrl) {
      const link = document.createElement('a');
      link.href = applicant.fileUrl;
      link.download = applicant.fileName || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewInNewTab = () => {
    if (applicant?.fileUrl) {
      window.open(applicant.fileUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="document-view-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="document-view-container">
        <div className="error-section">
          <h2>Document Not Found</h2>
          <p>The requested document could not be found.</p>
          <button onClick={handleGoBack} className="back-btn">
            ← Back to Applicants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-view-container">
      <div className="document-header">
        <button onClick={handleGoBack} className="back-btn">
          ← Back to Applicants
        </button>
        <h1>Document Viewer</h1>
        <div className="header-actions">
          <span className="document-id">ID: {applicant.id}</span>
        </div>
      </div>

      {!authenticated ? (
        <div className="authentication-section">
          <div className="auth-card">
            <div className="auth-header">
              <div className="lock-icon">🔒</div>
              <h2>Secure Document Access</h2>
              <p>This document is password protected</p>
            </div>

            <div className="applicant-preview">
              <h3>Document Preview</h3>
              <div className="preview-info">
                <div className="preview-item">
                  <label>Applicant Name:</label>
                  <span>{applicant.name}</span>
                </div>
                <div className="preview-item">
                  <label>Passport Number:</label>
                  <span>{applicant.passportNumber}</span>
                </div>
                <div className="preview-item">
                  <label>Status:</label>
                  {getStatusBadge(applicant.status)}
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="docPassword">Enter Document Password</label>
                <input
                  type="password"
                  id="docPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the password provided for this document"
                  required
                  className={authError ? 'error' : ''}
                />
                <small>You need the correct password to view the full document details</small>
              </div>

              {authError && (
                <div className="error-message">
                  ❌ {authError}
                </div>
              )}

              <button type="submit" className="auth-btn">
                {passwordAttempted ? 'Try Again' : 'Access Document'}
              </button>
            </form>

            <div className="auth-footer">
              <p>If you don't have the password, please contact the document owner.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="document-details-section">
          <div className="document-card">
            <div className="document-header-info">
              <h2>📄 Document Details</h2>
              {getStatusBadge(applicant.status)}
            </div>

            <div className="details-sections">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{applicant.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Passport Number:</label>
                    <span className="passport-highlight">{applicant.passportNumber}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Application Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Application ID:</label>
                    <span className="document-id-full">{applicant.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Submission Date:</label>
                    <span>{formatDate(applicant.uploadedAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Current Status:</label>
                    <span className={`status-text status-${applicant.status?.toLowerCase()}`}>
                      {applicant.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document File Section */}
              {applicant.fileUrl && (
                <div className="detail-section">
                  <h3>Document File</h3>
                  <div className="file-info-section">
                    <div className="file-preview-header">
                      <div className="file-icon">
                        {getFileIcon(applicant.fileName)}
                      </div>
                      <div className="file-details">
                        <h4>{applicant.fileName || 'Uploaded Document'}</h4>
                        <p className="file-type">
                          {getFileType(applicant.fileName).toUpperCase()} Document
                        </p>
                        {/* <p className="file-url">
                          {applicant.fileUrl}
                        </p> */}
                      </div>
                    </div>
                    
                    <div className="file-actions">
                      <button 
                        onClick={handleViewInNewTab}
                        className="action-btn primary"
                      >
                        👁️ View Document
                      </button>
                      <button 
                        onClick={handleDownload}
                        className="action-btn secondary"
                      >
                        📥 Download Document
                      </button>
                    </div>

                    {/* Document Preview */}
                    <div className="document-preview">
                      <h4>Document Preview</h4>
                      {documentLoading && (
                        <div className="document-loading">
                          <div className="loading-spinner"></div>
                          <p>Loading document preview...</p>
                        </div>
                      )}
                      <div className="preview-container">
                        {getFileType(applicant.fileName) === 'pdf' ? (
                          <iframe
                            src={applicant.fileUrl}
                            className="document-iframe"
                            title="Document Preview"
                            onLoad={() => setDocumentLoading(false)}
                            onLoadStart={() => setDocumentLoading(true)}
                          />
                        ) : getFileType(applicant.fileName) === 'image' ? (
                          <img
                            src={applicant.fileUrl}
                            alt="Document Preview"
                            className="document-image"
                            onLoad={() => setDocumentLoading(false)}
                            onLoadStart={() => setDocumentLoading(true)}
                          />
                        ) : (
                          <div className="unsupported-preview">
                            <div className="unsupported-icon">📄</div>
                            <h5>Preview Not Available</h5>
                            <p>This file type cannot be previewed in the browser.</p>
                            <p>Please download the file to view it.</p>
                            <button 
                              onClick={handleDownload}
                              className="action-btn outline"
                            >
                              Download File
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="document-actions">
              <h3>Available Actions</h3>
              <div className="action-buttons">
                <button className="action-btn primary">
                  📧 Contact Applicant
                </button>
                <button className="action-btn secondary">
                  📋 Update Status
                </button>
                {applicant.fileUrl && (
                  <button 
                    onClick={handleDownload}
                    className="action-btn outline"
                  >
                    📥 Download Document
                  </button>
                )}
                <button className="action-btn warning" onClick={() => setAuthenticated(false)}>
                  🔒 Lock Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentView;