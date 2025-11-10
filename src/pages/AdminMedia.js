import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
} from 'firebase/firestore';
import './AdminMedia.css';

const AdminDataManager = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    passportNumber: '',
    docPassword: '',
    status: 'Approved'
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const userLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (userLoggedIn) {
      setIsAuthenticated(true);
      fetchApplicants();
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch all applicants from Firestore
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(firestore, 'applicants'), 
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const applicantsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applicantsData.push({
          id: doc.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate?.() || data.uploadedAt
        });
      });
      
      setApplicants(applicantsData);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setMessage({ type: 'error', text: 'Failed to load applicants' });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit applicant
  const handleEdit = (applicant) => {
    setSelectedApplicant(applicant);
    setEditForm({
      name: applicant.name || '',
      passportNumber: applicant.passportNumber || '',
      docPassword: applicant.docPassword || '',
      status: applicant.status || 'Approved'
    });
  };

  // Handle update applicant
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const applicantRef = doc(firestore, 'applicants', selectedApplicant.id);
      const updateData = {
        ...editForm,
        updatedAt: new Date(),
        searchablePassport: editForm.passportNumber.toLowerCase(),
        searchableName: editForm.name.toLowerCase()
      };

      await updateDoc(applicantRef, updateData);
      
      setMessage({ type: 'success', text: 'Applicant updated successfully!' });
      setSelectedApplicant(null);
      fetchApplicants(); // Refresh the list
    } catch (error) {
      console.error('Error updating applicant:', error);
      setMessage({ type: 'error', text: 'Failed to update applicant' });
    }
  };

  // Handle delete applicant
  const handleDelete = async (applicant) => {
    if (!window.confirm(`Are you sure you want to delete applicant ${applicant.name} (${applicant.passportNumber})? This will remove all their data permanently.`)) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(firestore, 'applicants', applicant.id));
      
      setMessage({ type: 'success', text: 'Applicant deleted successfully!' });
      fetchApplicants(); // Refresh the list
    } catch (error) {
      console.error('Error deleting applicant:', error);
      setMessage({ type: 'error', text: 'Failed to delete applicant' });
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
  };

  // Filter applicants based on search and status
  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || applicant.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Pending': return 'status-pending';
      case 'Rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-data-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <h1>Applicant Data Management</h1>
            <p>Manage and organize all applicant data</p>
          </div>
          <div className="user-section">
            <div className="user-info">
              <span className="user-email">{localStorage.getItem('adminEmail')}</span>
            </div>
            <div className="header-actions">
              <button onClick={() => navigate('/admin')} className="action-btn secondary">
                Back to Upload
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="controls-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or passport number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-controls">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button onClick={fetchApplicants} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="data-section">
          <div className="section-header">
            <h2>Applicants ({filteredApplicants.length})</h2>
            <div className="stats">
              <span className="stat-total">Total: {applicants.length}</span>
              <span className="stat-approved">Approved: {applicants.filter(a => a.status === 'Approved').length}</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading applicants...</p>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No applicants found</h3>
              <p>{searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Start by uploading applicant data'}</p>
            </div>
          ) : (
            <div className="applicants-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Passport Number</th>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Uploaded Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant.id}>
                      <td className="applicant-name">
                        <strong>{applicant.name}</strong>
                        {applicant.docPassword && (
                          <small>Password: {applicant.docPassword}</small>
                        )}
                      </td>
                      <td className="passport-number">
                        {applicant.passportNumber}
                      </td>
                      <td className="document-info">
                        {applicant.fileName && (
                          <div className="file-details">
                            <span className="file-name">{applicant.fileName}</span>
                            <span className="file-size">{formatFileSize(applicant.fileSize)}</span>
                            {applicant.fileUrl && (
                              <a 
                                href={applicant.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="file-link"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(applicant.status)}`}>
                          {applicant.status || 'Pending'}
                        </span>
                      </td>
                      <td className="upload-date">
                        {applicant.uploadedAt ? applicant.uploadedAt.toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="actions">
                        <button 
                          onClick={() => handleEdit(applicant)}
                          className="btn-edit"
                          title="Edit applicant"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(applicant)}
                          className="btn-delete"
                          title="Delete applicant"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {selectedApplicant && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Applicant</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedApplicant(null)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="edit-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Passport Number *</label>
                  <input
                    type="text"
                    value={editForm.passportNumber}
                    onChange={(e) => setEditForm({...editForm, passportNumber: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Document Password *</label>
                  <input
                    type="text"
                    value={editForm.docPassword}
                    onChange={(e) => setEditForm({...editForm, docPassword: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Display current file info */}
                {selectedApplicant.fileName && (
                  <div className="current-file">
                    <h4>Current Document:</h4>
                    <div className="file-info">
                      <span>Name: {selectedApplicant.fileName}</span>
                      <span>Type: {selectedApplicant.fileType}</span>
                      <span>Size: {formatFileSize(selectedApplicant.fileSize)}</span>
                      {selectedApplicant.fileUrl && (
                        <a href={selectedApplicant.fileUrl} target="_blank" rel="noopener noreferrer">
                          View Current File
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setSelectedApplicant(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataManager;