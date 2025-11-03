import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Employer.css';

function Employer() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(firestore, 'applicants'));
      const applicantsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplicants(applicantsData);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', label: 'Pending', icon: '⏳' },
      approved: { class: 'status-approved', label: 'Approved', icon: '✅' },
      rejected: { class: 'status-rejected', label: 'Rejected', icon: '❌' },
      review: { class: 'status-review', label: 'Under Review', icon: '🔍' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Filter and sort applicants
  const filteredApplicants = applicants
    .filter(applicant =>
      applicant.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.uploadedAt?.toDate?.() || 0) - (a.uploadedAt?.toDate?.() || 0);
        case 'oldest':
          return (a.uploadedAt?.toDate?.() || 0) - (b.uploadedAt?.toDate?.() || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="employer-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading applicants data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-container">
      <div className="employer-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Applicant Management</h1>
            <p>View and manage all applicant documents securely</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <span className="stat-number">{applicants.length}</span>
                <span className="stat-label">Total Applicants</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number">
                  {applicants.filter(a => a.status?.toLowerCase() === 'approved').length}
                </span>
                <span className="stat-label">Approved</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <span className="stat-number">
                  {applicants.filter(a => a.status?.toLowerCase() === 'pending').length}
                </span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="employer-content">
        {/* Controls Section */}
        <div className="controls-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by passport number or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="sort-container">
            <label htmlFor="sort">Sort by:</label>
            <select 
              id="sort"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <span className="results-count">
            Showing {filteredApplicants.length} of {applicants.length} applicants
            {searchTerm && ` for "${searchTerm}"`}
          </span>
          <button 
            onClick={fetchApplicants}
            className="refresh-btn"
            title="Refresh data"
          >
            🔄 Refresh
          </button>
        </div>

        {applicants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No Applicants Found</h3>
            <p>There are no applicants in the system yet. Start by adding new applicants from the admin panel.</p>
            <Link to="/admin/login" className="empty-state-btn">
              Go to Admin Panel
            </Link>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Results Found</h3>
            <p>No applicants match your search criteria. Try adjusting your search terms.</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="empty-state-btn"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="applicants-table">
            {/* Table Header */}
            <div className="table-header">
              <div className="table-row header-row">
                <div className="table-col col-name">Applicant Name</div>
                <div className="table-col col-passport">Passport Number</div>
                <div className="table-col col-status">Status</div>
                <div className="table-col col-date">Submission Date</div>
                <div className="table-col col-actions">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="table-body">
              {filteredApplicants.map((applicant) => (
                <div key={applicant.id} className="table-row applicant-row">
                  <div className="table-col col-name">
                    <div className="applicant-info">
                      <div className="applicant-avatar">
                        {applicant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="applicant-details">
                        <span className="applicant-name">{applicant.name}</span>
                        <span className="applicant-id">ID: {applicant.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="table-col col-passport">
                    <span className="passport-number">{applicant.passportNumber}</span>
                  </div>
                  
                  <div className="table-col col-status">
                    {getStatusBadge(applicant.status)}
                  </div>
                  
                  <div className="table-col col-date">
                    <span className="submission-date">{formatDate(applicant.uploadedAt)}</span>
                  </div>
                  
                  <div className="table-col col-actions">
                    <Link 
                      to={`/employer/document/${applicant.id}`}
                      className="view-document-btn"
                    >
                      <span className="btn-icon">👁️</span>
                      View Document
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Employer;